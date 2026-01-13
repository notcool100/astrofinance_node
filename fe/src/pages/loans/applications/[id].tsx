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
	CheckCircleIcon,
	XCircleIcon,
	DocumentIcon,
	EyeIcon,
} from "@heroicons/react/24/outline";
import { useMutation } from "react-query";
import { toast } from "react-hot-toast";

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
	const [selectedDocument, setSelectedDocument] = useState<{
		id: string;
		documentType: string;
		documentName: string;
		status?: string;
	} | null>(null);
	const [verificationNotes, setVerificationNotes] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

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

	// Approve application mutation
	const approveMutation = useMutation(
		() =>
			loanService.updateLoanApplicationStatus(id as string, {
				status: "APPROVED",
			}),
		{
			onSuccess: () => {
				toast.success("Application approved successfully");
				refetch();
			},
			onError: (error: any) => {
				toast.error(error?.message || "Failed to approve application");
			},
		},
	);

	// Reject application mutation
	const rejectMutation = useMutation(
		() =>
			loanService.updateLoanApplicationStatus(id as string, {
				status: "REJECTED",
				rejectionReason: rejectionReason.trim(),
			}),
		{
			onSuccess: () => {
				toast.success("Application rejected successfully");
				refetch();
			},
			onError: (error: any) => {
				toast.error(error?.message || "Failed to reject application");
			},
		},
	);

	// Disburse loan mutation
	const disburseMutation = useMutation(
		() =>
			loanService.updateLoanApplicationStatus(id as string, {
				status: "DISBURSED",
			}),
		{
			onSuccess: () => {
				toast.success("Loan disbursed successfully");
				refetch();
			},
			onError: (error: any) => {
				toast.error(error?.message || "Failed to disburse loan");
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

	const handleViewDocument = (documentUrl: string) => {
		// If the URL is relative, prepend the backend base URL (without /api)
		const fullUrl = documentUrl.startsWith("http")
			? documentUrl
			: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5001"}${documentUrl}`;
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

	const handleApproveApplication = async () => {
		if (!confirm("Are you sure you want to approve this loan application?")) {
			return;
		}
		await approveMutation.mutateAsync();
	};

	const handleRejectApplication = async () => {
		if (!rejectionReason.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}
		if (rejectionReason.trim().length < 10) {
			toast.error("Rejection reason must be at least 10 characters long");
			return;
		}
		if (!confirm("Are you sure you want to reject this loan application?")) {
			return;
		}
		await rejectMutation.mutateAsync();
	};

	const handleDisburseLoan = async () => {
		if (
			!confirm(
				"Are you sure you want to disburse this loan? This action cannot be undone.",
			)
		) {
			return;
		}
		await disburseMutation.mutateAsync();
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
								Application Review - {applicationData.id}
							</h1>
						</div>
						<div className="flex space-x-2">
							{/* Admin Actions */}
							{applicationData.status === "PENDING" && (
								<>
									<Button
										variant="success"
										icon={<CheckCircleIcon className="h-5 w-5 mr-1" />}
										onClick={handleApproveApplication}
										isLoading={approveMutation.isLoading}
									>
										Approve Application
									</Button>
									<Button
										variant="danger"
										icon={<XCircleIcon className="h-5 w-5 mr-1" />}
										onClick={() => {
											const reason = prompt(
												"Please provide a reason for rejection:",
											);
											if (reason && reason.trim().length >= 10) {
												setRejectionReason(reason.trim());
												handleRejectApplication();
											} else if (reason) {
												toast.error(
													"Rejection reason must be at least 10 characters long",
												);
											}
										}}
										isLoading={rejectMutation.isLoading}
									>
										Reject Application
									</Button>
								</>
							)}

							{/* Disburse Loan Action */}
							{applicationData.status === "APPROVED" && (
								<Button
									variant="primary"
									icon={<CheckCircleIcon className="h-5 w-5 mr-1" />}
									onClick={handleDisburseLoan}
									isLoading={disburseMutation.isLoading}
								>
									Disburse Loan
								</Button>
							)}
						</div>
					</div>

					<Card>
						<div className="px-4 py-5 sm:p-6">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900">
									Application Details & Verification
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

								{/* Admin-specific information */}
								<div className="sm:col-span-2">
									<dt className="text-sm font-medium text-gray-500">
										Application ID
									</dt>
									<dd className="mt-1 text-sm text-gray-900 font-mono">
										{applicationData.id}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">User ID</dt>
									<dd className="mt-1 text-sm text-gray-900 font-mono">
										{applicationData.userId}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Application Number
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.applicationNumber || "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Created Date
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.createdAt
											? new Date(applicationData.createdAt).toLocaleDateString()
											: "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Last Updated
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{applicationData.updatedAt
											? new Date(applicationData.updatedAt).toLocaleDateString()
											: "N/A"}
									</dd>
								</div>
							</div>
						</div>
					</Card>

					{/* Admin Verification Panel */}
					{applicationData.status === "PENDING" && (
						<Card title="Admin Verification Panel">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center mb-4">
									<div className="flex-shrink-0">
										<CheckCircleIcon className="h-8 w-8 text-yellow-500" />
									</div>
									<div className="ml-3">
										<h3 className="text-lg font-medium text-gray-900">
											Application Review Required
										</h3>
										<p className="text-sm text-gray-500">
											Review the application details and documents before making
											a decision.
										</p>
									</div>
								</div>

								<div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
									<div className="flex">
										<div className="flex-shrink-0">
											<XCircleIcon className="h-5 w-5 text-yellow-400" />
										</div>
										<div className="ml-3">
											<h4 className="text-sm font-medium text-yellow-800">
												Verification Checklist
											</h4>
											<div className="mt-2 text-sm text-yellow-700">
												<ul className="list-disc list-inside space-y-1">
													<li>
														Verify applicant identity and contact information
													</li>
													<li>
														Review financial information and income details
													</li>
													<li>Check all uploaded documents for authenticity</li>
													<li>Ensure applicant meets eligibility criteria</li>
													<li>Verify loan amount and tenure are appropriate</li>
												</ul>
											</div>
										</div>
									</div>
								</div>

								<div className="flex space-x-3">
									<Button
										variant="success"
										icon={<CheckCircleIcon className="h-5 w-5 mr-2" />}
										onClick={handleApproveApplication}
										isLoading={approveMutation.isLoading}
									>
										Approve Application
									</Button>
									<Button
										variant="danger"
										icon={<XCircleIcon className="h-5 w-5 mr-2" />}
										onClick={() => {
											const reason = prompt(
												"Please provide a detailed reason for rejection:",
											);
											if (reason && reason.trim().length >= 10) {
												setRejectionReason(reason.trim());
												handleRejectApplication();
											} else if (reason) {
												toast.error(
													"Rejection reason must be at least 10 characters long",
												);
											}
										}}
										isLoading={rejectMutation.isLoading}
									>
										Reject Application
									</Button>
								</div>
							</div>
						</Card>
					)}

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

					{/* Admin Status Information */}
					{applicationData.status === "PENDING" && (
						<Card title="Application Status">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<CheckCircleIcon className="h-8 w-8 text-yellow-500" />
									</div>
									<div className="ml-3">
										<h3 className="text-lg font-medium text-gray-900">
											Application Under Review
										</h3>
										<p className="text-sm text-gray-500">
											This application is pending admin review and verification.
										</p>
									</div>
								</div>
							</div>
						</Card>
					)}

					{applicationData.status === "APPROVED" && (
						<Card title="Loan Disbursement Panel">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center mb-4">
									<div className="flex-shrink-0">
										<CheckCircleIcon className="h-8 w-8 text-green-500" />
									</div>
									<div className="ml-3">
										<h3 className="text-lg font-medium text-gray-900">
											Application Approved - Ready for Disbursement
										</h3>
										<p className="text-sm text-gray-500">
											This application has been approved. You can now disburse
											the loan amount to the applicant.
										</p>
									</div>
								</div>

								<div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
									<div className="flex">
										<div className="flex-shrink-0">
											<CheckCircleIcon className="h-5 w-5 text-green-400" />
										</div>
										<div className="ml-3">
											<h4 className="text-sm font-medium text-green-800">
												Pre-Disbursement Checklist
											</h4>
											<div className="mt-2 text-sm text-green-700">
												<ul className="list-disc list-inside space-y-1">
													<li>All required documents have been verified</li>
													<li>Application meets all eligibility criteria</li>
													<li>Loan amount and terms are confirmed</li>
													<li>Applicant's account details are verified</li>
													<li>Disbursement authorization is complete</li>
												</ul>
											</div>
										</div>
									</div>
								</div>

								<div className="flex space-x-3">
									<Button
										variant="primary"
										icon={<CheckCircleIcon className="h-5 w-5 mr-2" />}
										onClick={handleDisburseLoan}
										isLoading={disburseMutation.isLoading}
									>
										Disburse Loan Amount
									</Button>
									<Button
										variant="outline"
										onClick={() => router.push(`/loans/${applicationData.id}`)}
									>
										View Loan Details
									</Button>
								</div>
							</div>
						</Card>
					)}

					{applicationData.status === "REJECTED" && (
						<Card title="Application Rejected">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<XCircleIcon className="h-8 w-8 text-red-500" />
									</div>
									<div className="ml-3">
										<h3 className="text-lg font-medium text-gray-900">
											Application Rejected
										</h3>
										<p className="text-sm text-gray-500">
											This application has been rejected.
											{applicationData.notes && (
												<span>
													{" "}
													Reason: <strong>{applicationData.notes}</strong>
												</span>
											)}
										</p>
									</div>
								</div>
							</div>
						</Card>
					)}

					{applicationData.status === "DISBURSED" && (
						<Card title="Loan Successfully Disbursed">
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center mb-4">
									<div className="flex-shrink-0">
										<CheckCircleIcon className="h-8 w-8 text-green-500" />
									</div>
									<div className="ml-3">
										<h3 className="text-lg font-medium text-gray-900">
											Loan Successfully Disbursed
										</h3>
										<p className="text-sm text-gray-500">
											This loan has been successfully disbursed and is now
											active. The applicant can now manage their loan.
										</p>
									</div>
								</div>

								<div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
									<div className="flex">
										<div className="flex-shrink-0">
											<CheckCircleIcon className="h-5 w-5 text-green-400" />
										</div>
										<div className="ml-3">
											<h4 className="text-sm font-medium text-green-800">
												Post-Disbursement Actions
											</h4>
											<div className="mt-2 text-sm text-green-700">
												<ul className="list-disc list-inside space-y-1">
													<li>Loan is now active and accruing interest</li>
													<li>EMI schedule has been generated</li>
													<li>
														Applicant can make payments through the system
													</li>
													<li>Loan monitoring and management is available</li>
													<li>Support team can assist with any queries</li>
												</ul>
											</div>
										</div>
									</div>
								</div>

								<div className="flex space-x-3">
									<Button
										variant="primary"
										onClick={() => router.push(`/loans/${applicationData.id}`)}
									>
										View Active Loan
									</Button>
									<Button
										variant="outline"
										onClick={() =>
											router.push(`/loans/${applicationData.id}/payments`)
										}
									>
										Manage Payments
									</Button>
								</div>
							</div>
						</Card>
					)}

					{/* Documents Section */}
					<Card title="Document Verification & Management">
						<div className="px-4 py-5 sm:p-6">
							{isLoadingDocuments ? (
								<div className="flex justify-center items-center py-8">
									<div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
								</div>
							) : !documents || documents.length === 0 ? (
								<div className="text-center py-8">
									<DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
									<h3 className="mt-2 text-sm font-medium text-gray-900">
										No documents uploaded yet
									</h3>
									<p className="mt-1 text-sm text-gray-500">
										The applicant has not uploaded any documents yet. Documents
										will appear here once uploaded.
									</p>
								</div>
							) : (
								<div className="space-y-4">
									{/* Admin Document Verification Summary */}
									<div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
										<div className="flex">
											<div className="flex-shrink-0">
												<CheckCircleIcon className="h-5 w-5 text-blue-400" />
											</div>
											<div className="ml-3">
												<h4 className="text-sm font-medium text-blue-800">
													Document Verification Status
												</h4>
												<p className="text-sm text-blue-700">
													Review and verify each document before approving the
													application.
												</p>
											</div>
										</div>
									</div>

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
													{/* Admin Document Verification */}
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
															Verify Document
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

				{/* Document Verification Modal */}
				{selectedDocument && (
					<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
						<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
							<div className="mt-3">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Admin Document Verification
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
										Reject Document
									</Button>
									<Button
										variant="success"
										onClick={() => handleVerifyDocument("VERIFIED")}
										isLoading={isVerifying}
										disabled={isVerifying}
										icon={<CheckCircleIcon className="h-5 w-5 mr-1" />}
									>
										Approve Document
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



export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(m => 
        m.serverSideTranslations(locale, ['common', 'user', 'auth'])
      )),
    },
  };
}

export default LoanApplicationDetailPage;
