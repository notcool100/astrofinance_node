import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery, useMutation } from "react-query";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import loanService from "@/services/loanService";
import { ArrowLeftIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const ApproveApplicationPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const [isSubmitting, setIsSubmitting] = useState(false);

	// Fetch loan application details
	const { data: application, isLoading } = useQuery(
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

	// Approve application mutation
	const approveMutation = useMutation(
		() =>
			loanService.updateLoanApplicationStatus(id as string, {
				status: "APPROVED",
			}),
		{
			onSuccess: () => {
				toast.success("Application approved successfully");
				router.push("/staff/applications");
			},
			onError: (error: any) => {
				toast.error(error?.message || "Failed to approve application");
				console.error("Error approving application:", error);
			},
		},
	);

	const handleApprove = async () => {
		if (!confirm("Are you sure you want to approve this loan application?")) {
			return;
		}

		setIsSubmitting(true);
		try {
			await approveMutation.mutateAsync();
		} finally {
			setIsSubmitting(false);
		}
	};

	if (isLoading) {
		return (
			<ProtectedRoute staffOnly>
				<MainLayout title="Approve Application">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	if (!application) {
		return (
			<ProtectedRoute staffOnly>
				<MainLayout title="Approve Application">
					<div className="text-center py-8">
						<h3 className="text-lg font-medium text-gray-900">
							Application not found
						</h3>
						<p className="mt-2 text-sm text-gray-500">
							The loan application you're looking for doesn't exist.
						</p>
						<Button
							variant="primary"
							className="mt-4"
							onClick={() => router.push("/staff/applications")}
						>
							Back to Applications
						</Button>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	if (application.status !== "PENDING") {
		return (
			<ProtectedRoute staffOnly>
				<MainLayout title="Approve Application">
					<div className="text-center py-8">
						<h3 className="text-lg font-medium text-gray-900">
							Application already processed
						</h3>
						<p className="mt-2 text-sm text-gray-500">
							This application has already been{" "}
							{application.status.toLowerCase()}.
						</p>
						<Button
							variant="primary"
							className="mt-4"
							onClick={() => router.push("/staff/applications")}
						>
							Back to Applications
						</Button>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute staffOnly>
			<MainLayout title="Approve Application">
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
								Approve Application{" "}
								{application.applicationNumber || application.id}
							</h1>
						</div>
					</div>

					<Card>
						<div className="px-4 py-5 sm:p-6">
							<div className="flex items-center mb-6">
								<div className="flex-shrink-0">
									<CheckCircleIcon className="h-8 w-8 text-green-500" />
								</div>
								<div className="ml-3">
									<h3 className="text-lg font-medium text-gray-900">
										Approve Loan Application
									</h3>
									<p className="text-sm text-gray-500">
										Review the application details before approving.
									</p>
								</div>
							</div>

							<div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Application Number
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application.applicationNumber || "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Loan Type
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application.loanType?.name || "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Loan Amount
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										${application.amount?.toLocaleString() || "N/A"}
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">Tenure</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application.tenure || "N/A"} months
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Interest Rate
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application.loanType?.interestRate || "N/A"}% per annum
									</dd>
								</div>
								<div>
									<dt className="text-sm font-medium text-gray-500">
										Applied Date
									</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application.appliedDate
											? new Date(application.appliedDate).toLocaleDateString()
											: "N/A"}
									</dd>
								</div>
								<div className="sm:col-span-2">
									<dt className="text-sm font-medium text-gray-500">Purpose</dt>
									<dd className="mt-1 text-sm text-gray-900">
										{application.purpose || "N/A"}
									</dd>
								</div>
							</div>

							<div className="mt-8 pt-6 border-t border-gray-200">
								<div className="bg-green-50 border border-green-200 rounded-md p-4">
									<div className="flex">
										<div className="flex-shrink-0">
											<CheckCircleIcon className="h-5 w-5 text-green-400" />
										</div>
										<div className="ml-3">
											<h3 className="text-sm font-medium text-green-800">
												Ready to Approve
											</h3>
											<div className="mt-2 text-sm text-green-700">
												<p>By approving this application, you confirm that:</p>
												<ul className="list-disc list-inside mt-2 space-y-1">
													<li>All required documents have been verified</li>
													<li>The applicant meets the eligibility criteria</li>
													<li>
														The loan terms are appropriate for the applicant
													</li>
													<li>All compliance requirements have been met</li>
												</ul>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-6 flex justify-end space-x-3">
									<Button
										variant="secondary"
										onClick={() => router.push("/staff/applications")}
									>
										Cancel
									</Button>
									<Button
										variant="primary"
										onClick={handleApprove}
										isLoading={isSubmitting}
										icon={<CheckCircleIcon className="h-5 w-5 mr-1" />}
									>
										Approve Application
									</Button>
								</div>
							</div>
						</div>
					</Card>
				</div>
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

export default ApproveApplicationPage;
