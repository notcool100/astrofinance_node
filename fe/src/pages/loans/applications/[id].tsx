import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import loanService, { type LoanApplication } from "@/services/loanService";
import {
	ArrowLeftIcon,
	DocumentArrowUpIcon,
	CheckCircleIcon,
	XCircleIcon,
	DocumentIcon,
	EyeIcon,
} from "@heroicons/react/24/outline";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";
import DocumentUploadModal from "@/components/modals/DocumentUploadModal";

const ApplicationStatusBadge = ({ status }: { status: string }) => {
	switch (status) {
		case "PENDING":
			return <Badge variant="primary">Pending</Badge>;
		case "APPROVED":
			return <Badge variant="success">Approved</Badge>;
		case "REJECTED":
			return <Badge variant="danger">Rejected</Badge>;
		case "DISBURSED":
			return <Badge variant="info">Disbursed</Badge>;
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

const LoanApplicationDetailPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [selectedDocument, setSelectedDocument] = useState<{
		id: string;
		documentType: string;
		documentName: string;
		status?: string;
	} | null>(null);
	const [verificationNotes, setVerificationNotes] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	// Fetch loan application details
	const { data: application, refetch } = useQuery(
		["loanApplication", id],
		() => loanService.getLoanApplicationById(id as string),
		{
			enabled: !!id,
			onError: (error) => {
				toast.error("Failed to load application details");
				console.error("Error fetching application:", error);
			},
		},
	);

	// Fetch uploaded documents
	const {
		data: documents,
		isLoading: isLoadingDocuments,
		refetch: refetchDocuments,
	} = useQuery(
		["loanDocuments", id],
		() => loanService.getLoanDocuments(id as string),
		{
			enabled: !!id,
			onError: (error) => {
				toast.error("Failed to load documents");
				console.error("Error fetching documents:", error);
			},
		},
	);

	// Verify document mutation
	const verifyDocumentMutation = useMutation(
		({
			documentId,
			status,
			notes,
		}: {
			documentId: string;
			status: string;
			notes: string;
		}) =>
			loanService.verifyLoanDocument(documentId, {
				status,
				verificationNotes: notes,
			}),
		{
			onSuccess: () => {
				toast.success("Document verification updated successfully");
				refetchDocuments();
				setSelectedDocument(null);
				setVerificationNotes("");
			},
			onError: (error: unknown) => {
				toast.error(
					(error as { message?: string })?.message ||
						"Failed to verify document",
				);
				console.error("Error verifying document:", error);
			},
		},
	);

	// Mock data for now
	const mockApplication: LoanApplication = {
		id: (id as string) || "LA-1001",
		applicationNumber: "APP-1001",
		userId: "user-1",
		loanTypeId: "1",
		amount: 10000,
		tenure: 12,
		purpose: "Home renovation",
		status: "PENDING",
		appliedDate: new Date().toISOString(),
		applicationDate: new Date().toISOString(),
		createdAt: new Date().toISOString(),
		updatedAt: new Date().toISOString(),
		loanType: {
			id: "1",
			name: "Personal Loan",
			code: "PL",
			interestType: "FLAT",
			minAmount: 1000,
			maxAmount: 50000,
			minTenure: 3,
			maxTenure: 36,
			interestRate: 12,
			processingFeePercent: 2,
			lateFeeAmount: 500,
			isActive: true,
		},
	};

	const handleUploadDocuments = () => {
		setIsUploadModalOpen(true);
	};

	const handleDocumentUpload = async (formData: FormData) => {
		setIsSubmitting(true);
		try {
			// Upload multiple documents
			await loanService.uploadMultipleDocuments(id as string, formData);

			toast.success("Documents uploaded successfully");
			setIsUploadModalOpen(false);
			refetch();
			refetchDocuments();
		} catch (error: unknown) {
			toast.error(
				(error as { message?: string })?.message ||
					"Failed to upload documents",
			);
			console.error("Error uploading documents:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleViewDocument = (documentUrl: string) => {
		// If the URL is relative, prepend the backend base URL (without /api)
		const fullUrl = documentUrl.startsWith("http")
			? documentUrl
			: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${documentUrl}`;
		window.open(fullUrl, "_blank");
	};

	const getDocumentStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return <Badge variant="primary">Pending Review</Badge>;
			case "UPLOADED":
				return <Badge variant="primary">Pending Review</Badge>;
			case "VERIFIED":
				return <Badge variant="success">Verified</Badge>;
			case "REJECTED":
				return <Badge variant="danger">Rejected</Badge>;
			default:
				return <Badge variant="secondary">Unknown</Badge>;
		}
	};

	const getDocumentTypeName = (documentType: string) => {
		const typeMap: Record<string, string> = {
			identity: "Identity Proof",
			address: "Address Proof",
			income: "Income Proof",
			photo: "Photograph",
			bank: "Bank Statement",
			employment: "Employment Proof",
		};
		return typeMap[documentType] || documentType;
	};

	const handleVerifyDocument = async (status: "VERIFIED" | "REJECTED") => {
		if (!selectedDocument) return;

		if (status === "REJECTED" && !verificationNotes.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}

		setIsVerifying(true);
		try {
			await verifyDocumentMutation.mutateAsync({
				documentId: selectedDocument.id,
				status,
				notes: verificationNotes.trim(),
			});
		} finally {
			setIsVerifying(false);
		}
	};

	const handleCancelApplication = async () => {
		if (!confirm("Are you sure you want to cancel this application?")) return;

		setIsSubmitting(true);
		try {
			// In a real implementation, we would call the API
			// await loanService.updateLoanApplicationStatus(id as string, { status: 'CANCELLED' });

			// Mock success
			await new Promise((resolve) => setTimeout(resolve, 1000));

			toast.success("Application cancelled successfully");
			router.push("/loans/applications");
		} catch (error) {
			toast.error("Failed to cancel application");
			console.error("Error cancelling application:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	// Use mock data for now
	const applicationData = application || mockApplication;

	return (
		<ProtectedRoute>
			<MainLayout title={`Loan Application ${applicationData.id}`}>
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<Button
								variant="secondary"
								className="mr-4"
								onClick={() => router.push("/loans/applications")}
							>
								<ArrowLeftIcon className="h-5 w-5 mr-1" />
								Back to Applications
							</Button>
							<h1 className="text-2xl font-semibold text-gray-900">
								Application {applicationData.id}
							</h1>
						</div>
						<div className="flex space-x-2">
							{applicationData.status === "APPROVED" && (
								<Button
									variant="primary"
									icon={<DocumentArrowUpIcon className="h-5 w-5 mr-1" />}
									onClick={handleUploadDocuments}
								>
									Upload Documents
								</Button>
							)}
							{applicationData.status === "PENDING" && (
								<Button
									variant="danger"
									icon={<XCircleIcon className="h-5 w-5 mr-1" />}
									onClick={handleCancelApplication}
									isLoading={isSubmitting}
								>
									Cancel Application
								</Button>
							)}
						</div>
					</div>

					<Card>
						<div className="px-4 py-5 sm:p-6">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900">
									Application Details
								</h3>
								<ApplicationStatusBadge status={applicationData.status} />
							</div>

							<div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Loan Type
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.loanType?.name || "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Application Date
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.applicationDate
											? new Date(
													applicationData.applicationDate,
												).toLocaleDateString()
											: "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Loan Amount
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										${applicationData.amount.toLocaleString()}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">Tenure</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.tenure} months
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Interest Rate
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.loanType?.interestRate}% per annum
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Interest Type
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.loanType?.interestType === "FLAT"
											? "Flat Rate"
											: "Reducing Balance"}
									</dd>
								</div>
								<div className="sm:col-span-2">
									<dt className="text-sm font-medium text-gray-500">Purpose</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.purpose}
									</dd>
								</div>
								{applicationData.notes && (
									<div className="sm:col-span-2">
										<dt className="text-sm font-medium text-gray-500">Notes</dt>
										<dd className="mt-1 text-sm text-gray-900">
											{applicationData.notes}
										</dd>
									</div>
								)}
							</div>
						</div>
					</Card>

					<Card title="Application Timeline">
						<div className="px-4 py-5 sm:p-6">
							<div className="flow-root">
								<ul className="-mb-8">
									<li>
										<div className="relative pb-8">
											<span
												className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
												aria-hidden="true"
											></span>
											<div className="relative flex space-x-3">
												<div>
													<span className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center ring-8 ring-white">
														<CheckCircleIcon
															className="h-5 w-5 text-white"
															aria-hidden="true"
														/>
													</span>
												</div>
												<div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
													<div>
														<p className="text-sm text-gray-500">
															Application{" "}
															<span className="font-medium text-gray-900">
																submitted
															</span>
														</p>
													</div>
													<div className="text-right text-sm whitespace-nowrap text-gray-500">
														{applicationData.applicationDate
															? new Date(
																	applicationData.applicationDate,
																).toLocaleDateString()
															: "N/A"}
													</div>
												</div>
											</div>
										</div>
									</li>

									{applicationData.status !== "PENDING" && (
										<li>
											<div className="relative pb-8">
												{applicationData.status === "APPROVED" && (
													<span
														className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
														aria-hidden="true"
													></span>
												)}
												<div className="relative flex space-x-3">
													<div>
														<span
															className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
																applicationData.status === "APPROVED"
																	? "bg-green-500"
																	: "bg-red-500"
															}`}
														>
															{applicationData.status === "APPROVED" ? (
																<CheckCircleIcon
																	className="h-5 w-5 text-white"
																	aria-hidden="true"
																/>
															) : (
																<XCircleIcon
																	className="h-5 w-5 text-white"
																	aria-hidden="true"
																/>
															)}
														</span>
													</div>
													<div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
														<div>
															<p className="text-sm text-gray-500">
																Application{" "}
																<span className="font-medium text-gray-900">
																	{applicationData.status === "APPROVED"
																		? "approved"
																		: "rejected"}
																</span>
															</p>
														</div>
														<div className="text-right text-sm whitespace-nowrap text-gray-500">
															{/* In a real app, we would use the actual approval/rejection date */}
															{new Date(
																Date.now() - 2 * 24 * 60 * 60 * 1000,
															).toLocaleDateString()}
														</div>
													</div>
												</div>
											</div>
										</li>
									)}

									{applicationData.status === "DISBURSED" && (
										<li>
											<div className="relative">
												<div className="relative flex space-x-3">
													<div>
														<span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
															<CheckCircleIcon
																className="h-5 w-5 text-white"
																aria-hidden="true"
															/>
														</span>
													</div>
													<div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
														<div>
															<p className="text-sm text-gray-500">
																Loan{" "}
																<span className="font-medium text-gray-900">
																	disbursed
																</span>
															</p>
														</div>
														<div className="text-right text-sm whitespace-nowrap text-gray-500">
															{/* In a real app, we would use the actual disbursement date */}
															{new Date(
																Date.now() - 1 * 24 * 60 * 60 * 1000,
															).toLocaleDateString()}
														</div>
													</div>
												</div>
											</div>
										</li>
									)}
								</ul>
							</div>
						</div>
					</Card>

					{applicationData.status === "PENDING" && (
						<Card title="What's Next?">
							<div className="px-4 py-5 sm:p-6">
								<p className="text-sm text-gray-500">
									Your application is currently under review. This process
									typically takes 1-2 business days. You will be notified once a
									decision has been made.
								</p>
								<div className="mt-4 flex items-center">
									<div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
										Pending Review
									</div>
								</div>
							</div>
						</Card>
					)}

					{applicationData.status === "APPROVED" && (
						<Card title="Next Steps">
							<div className="px-4 py-5 sm:p-6">
								<p className="text-sm text-gray-500">
									Congratulations! Your loan application has been approved.
									Please upload the required documents to proceed with the loan
									disbursement.
								</p>
								<div className="mt-4">
									<Button
										variant="primary"
										icon={<DocumentArrowUpIcon className="h-5 w-5 mr-1" />}
										onClick={handleUploadDocuments}
									>
										Upload Documents
									</Button>
								</div>
							</div>
						</Card>
					)}

					{applicationData.status === "REJECTED" && (
						<Card title="Application Status">
							<div className="px-4 py-5 sm:p-6">
								<p className="text-sm text-gray-500">
									We regret to inform you that your loan application has been
									rejected.
									{applicationData.notes && (
										<span>
											{" "}
											Reason: <strong>{applicationData.notes}</strong>
										</span>
									)}
								</p>
								<div className="mt-4">
									<Button
										variant="primary"
										onClick={() => router.push("/loans/apply")}
									>
										Apply for a New Loan
									</Button>
								</div>
							</div>
						</Card>
					)}

					{applicationData.status === "DISBURSED" && (
						<Card title="Loan Disbursed">
							<div className="px-4 py-5 sm:p-6">
								<p className="text-sm text-gray-500">
									Your loan has been successfully disbursed. You can view the
									loan details and repayment schedule in the Loans section.
								</p>
								<div className="mt-4">
									<Button
										variant="primary"
										onClick={() => router.push("/loans")}
									>
										View My Loans
									</Button>
								</div>
							</div>
						</Card>
					)}

					{/* Documents Section */}
					<Card title="Uploaded Documents">
						<div className="px-4 py-5 sm:p-6">
							{isLoadingDocuments ? (
								<div className="flex justify-center items-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
								</div>
							) : !documents || documents.length === 0 ? (
								<div className="text-center py-8">
									<DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
									<h3 className="mt-2 text-sm font-medium text-gray-900">
										No documents uploaded
									</h3>
									<p className="mt-1 text-sm text-gray-500">
										Upload the required documents to proceed with your loan
										application.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{documents.map((document) => (
										<div
											key={document.id}
											className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50"
										>
											<div className="flex items-center justify-between">
												<div className="flex items-center space-x-4">
													<DocumentIcon className="h-8 w-8 text-gray-400" />
													<div>
														<h4 className="text-sm font-medium text-gray-900">
															{getDocumentTypeName(document.documentType)}
														</h4>
														<p className="text-sm text-gray-500">
															{document.documentName}
														</p>
														<p className="text-xs text-gray-400">
															Uploaded:{" "}
															{new Date(
																document.uploadDate,
															).toLocaleDateString()}
														</p>
													</div>
												</div>
												<div className="flex items-center space-x-3">
													{getDocumentStatusBadge(document.status || "PENDING")}
													<Button
														variant="outline"
														size="sm"
														onClick={() =>
															handleViewDocument(document.documentUrl)
														}
													>
														<EyeIcon className="h-4 w-4 mr-1" />
														View
													</Button>
													{(document.status === "PENDING" ||
														document.status === "UPLOADED") && (
														<Button
															variant="primary"
															size="sm"
															onClick={() => {
																setSelectedDocument({
																	id: document.id,
																	documentType: document.documentType,
																	documentName: document.documentName,
																	status: document.status,
																});
																setVerificationNotes(
																	document.verificationNotes || "",
																);
															}}
														>
															<CheckCircleIcon className="h-4 w-4 mr-1" />
															Verify
														</Button>
													)}
												</div>
											</div>
											{document.verificationNotes && (
												<div className="mt-3 p-3 bg-gray-50 rounded-md">
													<p className="text-sm text-gray-700">
														<strong>Verification Notes:</strong>{" "}
														{document.verificationNotes}
													</p>
												</div>
											)}
										</div>
									))}
								</div>
							)}
						</div>
					</Card>
				</div>

				<DocumentUploadModal
					isOpen={isUploadModalOpen}
					onClose={() => setIsUploadModalOpen(false)}
					onUpload={handleDocumentUpload}
					isSubmitting={isSubmitting}
					requiredDocuments={[
						{
							id: "identity",
							name: "Identity Proof",
							description: "Aadhar Card, PAN Card, Passport, etc.",
						},
						{
							id: "address",
							name: "Address Proof",
							description: "Utility Bill, Rental Agreement, etc.",
						},
						{
							id: "income",
							name: "Income Proof",
							description: "Salary Slips, Bank Statements, etc.",
						},
						{
							id: "photo",
							name: "Photograph",
							description: "Recent passport-sized photograph",
						},
					]}
				/>

				{/* Document Verification Modal */}
				{selectedDocument && (
					<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
						<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
							<div className="mt-3">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Verify Document
								</h3>
								<div className="mb-4">
									<p className="text-sm text-gray-600">
										<strong>Document:</strong>{" "}
										{getDocumentTypeName(selectedDocument.documentType)}
									</p>
									<p className="text-sm text-gray-600">
										<strong>File:</strong> {selectedDocument.documentName}
									</p>
								</div>
								<div className="mb-4">
									<label
										htmlFor="verificationNotes"
										className="block text-sm font-medium text-gray-700"
									>
										Verification Notes
									</label>
									<textarea
										id="verificationNotes"
										rows={3}
										className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
										value={verificationNotes}
										onChange={(e) => setVerificationNotes(e.target.value)}
										placeholder="Add notes for verification or rejection..."
									></textarea>
									{selectedDocument.status === "REJECTED" &&
										verificationNotes.trim().length < 10 && (
											<p className="mt-2 text-sm text-red-600">
												Rejection notes must be at least 10 characters long.
											</p>
										)}
								</div>
								<div className="flex justify-end space-x-3">
									<Button
										variant="secondary"
										onClick={() => setSelectedDocument(null)}
										disabled={isVerifying}
									>
										Cancel
									</Button>
									<Button
										variant="danger"
										onClick={() => handleVerifyDocument("REJECTED")}
										isLoading={
											isVerifying && verificationNotes.trim().length < 10
										}
										disabled={
											isVerifying || verificationNotes.trim().length < 10
										}
										icon={<XCircleIcon className="h-5 w-5 mr-1" />}
									>
										Reject
									</Button>
									<Button
										variant="primary"
										onClick={() => handleVerifyDocument("VERIFIED")}
										isLoading={isVerifying}
										disabled={isVerifying}
										icon={<CheckCircleIcon className="h-5 w-5 mr-1" />}
									>
										Approve
									</Button>
								</div>
							</div>
						</div>
					</div>
				)}
			</MainLayout>
		</ProtectedRoute>
	);
};

export default LoanApplicationDetailPage;
