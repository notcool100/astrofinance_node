import { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "react-query";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import loanService from "@/services/loanService";
import {
	ArrowLeftIcon,
	DocumentIcon,
	CheckCircleIcon,
	XCircleIcon,
	EyeIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const LoanDocumentsPage = () => {
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

	// Fetch loan application details
	const { data: application, isLoading: isLoadingApplication } = useQuery(
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
		refetch,
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
				refetch();
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

	const handleViewDocument = (documentUrl: string) => {
		// If the URL is relative, prepend the backend base URL (without /api)
		const fullUrl = documentUrl.startsWith("http")
			? documentUrl
			: `${process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000"}${documentUrl}`;
		window.open(fullUrl, "_blank");
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "PENDING":
				return <Badge color="yellow" text="Pending" />;
			case "UPLOADED":
				return <Badge color="blue" text="Uploaded" />;
			case "VERIFIED":
				return <Badge color="green" text="Verified" />;
			case "REJECTED":
				return <Badge color="red" text="Rejected" />;
			default:
				return <Badge color="gray" text="Unknown" />;
		}
	};

	const getDocumentTypeName = (type: string) => {
		const typeMap: Record<string, string> = {
			identity: "Identity Proof",
			address: "Address Proof",
			income: "Income Proof",
			photo: "Photograph",
			employment: "Employment Proof",
		};
		return typeMap[type] || type;
	};

	if (isLoadingApplication || isLoadingDocuments) {
		return (
			<ProtectedRoute staffOnly>
				<MainLayout title="Loan Documents">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute staffOnly>
			<MainLayout title="Loan Documents">
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<Button
								variant="secondary"
								className="mr-4"
								onClick={() => router.push("/staff/applications")}
							>
								<ArrowLeftIcon className="h-5 w-5 mr-1" />
								Back to Applications
							</Button>
							<h1 className="text-2xl font-semibold text-gray-900">
								Documents - {application?.applicationNumber || application?.id}
							</h1>
						</div>
					</div>

					{/* Application Info */}
					<Card>
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Application Information
							</h3>
							<div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Applicant
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application?.user?.fullName || "Unknown User"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Loan Type
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application?.loanType?.name || "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">Amount</dt>
									<dd className="mt-1 text-sm text-gray-900">
										${application?.amount?.toLocaleString() || "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">Status</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application?.status || "N/A"}
									</dd>
								</div>
							</div>
						</div>
					</Card>

					{/* Documents List */}
					<Card>
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Uploaded Documents
							</h3>
							{!documents || documents.length === 0 ? (
								<div className="text-center py-8">
									<DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
									<h3 className="mt-2 text-sm font-medium text-gray-900">
										No documents uploaded
									</h3>
									<p className="mt-1 text-sm text-gray-500">
										The applicant has not uploaded any documents yet.
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
													{getStatusBadge(document.status || "PENDING")}
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
											className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
											placeholder="Enter verification notes or rejection reason..."
											value={verificationNotes}
											onChange={(e) => setVerificationNotes(e.target.value)}
										/>
									</div>
									<div className="flex justify-end space-x-3">
										<Button
											variant="secondary"
											onClick={() => {
												setSelectedDocument(null);
												setVerificationNotes("");
											}}
										>
											Cancel
										</Button>
										<Button
											variant="danger"
											onClick={() => handleVerifyDocument("REJECTED")}
											isLoading={isVerifying}
											icon={<XCircleIcon className="h-4 w-4 mr-1" />}
										>
											Reject
										</Button>
										<Button
											variant="primary"
											onClick={() => handleVerifyDocument("VERIFIED")}
											isLoading={isVerifying}
											icon={<CheckCircleIcon className="h-4 w-4 mr-1" />}
										>
											Verify
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default LoanDocumentsPage;
