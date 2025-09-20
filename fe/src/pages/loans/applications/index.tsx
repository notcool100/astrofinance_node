import React, { useState, useCallback } from "react";
import { useQuery, useMutation } from "react-query";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import loanService, { LoanApplication } from "@/services/loanService";
import {
	PlusIcon,
	FunnelIcon,
	CheckCircleIcon,
	XCircleIcon,
	DocumentIcon,
	EyeIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
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

const LoanApplicationsPage = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [filter, setFilter] = useState({
		status: "",
		loanType: "",
	});
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");

	// Fetch loan applications
	const {
		data: applicationsData,
		isLoading,
		error,
		refetch,
	} = useQuery(
		["loanApplications", filter, search],
		() => {
			// Only send non-empty filter parameters
			const cleanFilter = Object.fromEntries(
				Object.entries(filter).filter(([_, value]) => value !== ""),
			);
			if (search) cleanFilter.search = search;
			return loanService.getLoanApplications(cleanFilter);
		},
		{
			keepPreviousData: true,
			retry: 3,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	// Approve application mutation
	const approveMutation = useMutation(
		(applicationId: string) =>
			loanService.updateLoanApplicationStatus(applicationId, {
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
		({ applicationId, reason }: { applicationId: string; reason: string }) =>
			loanService.updateLoanApplicationStatus(applicationId, {
				status: "REJECTED",
				rejectionReason: reason,
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

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(searchInput);
	};

	const handleApprove = useCallback(
		async (applicationId: string) => {
			if (!confirm("Are you sure you want to approve this loan application?")) {
				return;
			}
			await approveMutation.mutateAsync(applicationId);
		},
		[approveMutation],
	);

	const handleReject = useCallback(
		async (applicationId: string) => {
			const reason = prompt("Please provide a reason for rejection:");
			if (!reason || reason.trim().length < 10) {
				toast.error("Please provide a valid reason (minimum 10 characters)");
				return;
			}
			if (!confirm("Are you sure you want to reject this loan application?")) {
				return;
			}
			await rejectMutation.mutateAsync({
				applicationId,
				reason: reason.trim(),
			});
		},
		[rejectMutation],
	);

	// Check if user is admin/staff
	const isAdmin =
		user?.roles?.some((role) => role.name === "admin") ||
		user?.roles?.some((role) => role.name === "staff");

	const columns: any[] = React.useMemo(
		() => [
			{
				Header: "Application ID",
				accessor: "id",
				Cell: ({ value }: { value: string }) => (
					<span className="font-mono text-sm">
						{value.slice(-8).toUpperCase()}
					</span>
				),
			},
			{
				Header: "Application Number",
				accessor: "applicationNumber" as keyof LoanApplication,
				Cell: ({ value }: { value: string }) => (
					<span className="font-medium">{value || "N/A"}</span>
				),
			},
			{
				Header: "Loan Type",
				accessor: "loanType" as keyof LoanApplication,
				Cell: ({ row }: any) => (
					<div>
						<div className="font-medium">
							{row.original.loanType?.name || "N/A"}
						</div>
						<div className="text-xs text-gray-500">
							{row.original.loanType?.code || ""}
						</div>
					</div>
				),
			},
			{
				Header: "Amount Requested",
				accessor: "amount",
				Cell: ({ value }: { value: number }) => (
					<span className="font-medium">${value.toLocaleString()}</span>
				),
			},
			{
				Header: "Tenure",
				accessor: "tenure",
				Cell: ({ value }: { value: number }) => `${value} months`,
			},
			{
				Header: "Purpose",
				accessor: "purpose",
				Cell: ({ value }: { value: string }) => (
					<span className="truncate max-w-32" title={value}>
						{value}
					</span>
				),
			},
			{
				Header: "Applied Date",
				accessor: "appliedDate" as keyof LoanApplication,
				Cell: ({ value }: { value: string }) => {
					const date = value ? new Date(value) : new Date();
					return (
						<div>
							<div>{date.toLocaleDateString()}</div>
							<div className="text-xs text-gray-500">
								{date.toLocaleTimeString([], {
									hour: "2-digit",
									minute: "2-digit",
								})}
							</div>
						</div>
					);
				},
			},
			{
				Header: "Status",
				accessor: "status",
				Cell: ({ value }: { value: string }) => (
					<ApplicationStatusBadge status={value} />
				),
			},
			{
				Header: "Actions",
				id: "actions", // Use unique ID instead of accessor
				Cell: ({ row }: any) => (
					<div className="flex space-x-2">
						<button
							type="button"
							onClick={(e) => {
								e.stopPropagation();
								router.push(`/loans/applications/${row.original.id}`);
							}}
							className="text-primary-600 hover:text-primary-900 text-sm font-medium"
							title="View Details"
						>
							<EyeIcon className="h-4 w-4" />
						</button>

						{/* Admin/Staff Actions */}
						{isAdmin && (
							<>
								<button
									type="button"
									onClick={(e) => {
										e.stopPropagation();
										router.push(
											`/loans/applications/${row.original.id}/documents`,
										);
									}}
									className="text-blue-600 hover:text-blue-900 text-sm font-medium"
									title="View Documents"
								>
									<DocumentIcon className="h-4 w-4" />
								</button>

								{row.original.status === "PENDING" && (
									<>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleApprove(row.original.id);
											}}
											className="text-green-600 hover:text-green-900 text-sm font-medium"
											title="Approve Application"
											disabled={approveMutation.isLoading}
										>
											<CheckCircleIcon className="h-4 w-4" />
										</button>
										<button
											type="button"
											onClick={(e) => {
												e.stopPropagation();
												handleReject(row.original.id);
											}}
											className="text-red-600 hover:text-red-900 text-sm font-medium"
											title="Reject Application"
											disabled={rejectMutation.isLoading}
										>
											<XCircleIcon className="h-4 w-4" />
										</button>
									</>
								)}

								{row.original.status === "APPROVED" && (
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											router.push(
												`/loans/applications/${row.original.id}/agreement`,
											);
										}}
										className="text-blue-600 hover:text-blue-900 text-sm font-medium"
										title="View Agreement"
									>
										Agreement
									</button>
								)}
							</>
						)}

						{/* Regular User Actions */}
						{!isAdmin && row.original.status === "APPROVED" && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									router.push(
										`/loans/applications/${row.original.id}/documents`,
									);
								}}
								className="text-green-600 hover:text-green-900 text-sm font-medium"
							>
								Documents
							</button>
						)}
						{!isAdmin && row.original.status === "APPROVED" && (
							<button
								type="button"
								onClick={(e) => {
									e.stopPropagation();
									router.push(
										`/loans/applications/${row.original.id}/agreement`,
									);
								}}
								className="text-blue-600 hover:text-blue-900 text-sm font-medium"
							>
								Agreement
							</button>
						)}
					</div>
				),
			},
		],
		[
			router,
			isAdmin,
			handleApprove,
			handleReject,
			approveMutation.isLoading,
			rejectMutation.isLoading,
		],
	);

	const handleRowClick = (row: any) => {
		router.push(`/loans/applications/${row.original.id}`);
	};

	// Filter applications based on filter state
	const filteredApplications = React.useMemo(() => {
		let filtered = applicationsData?.data || [];

		if (filter.status) {
			filtered = filtered.filter((app: any) => app.status === filter.status);
		}

		if (filter.loanType) {
			filtered = filtered.filter(
				(app: any) => app.loanType?.name === filter.loanType,
			);
		}

		return filtered;
	}, [applicationsData, filter]);

	// Calculate statistics
	const stats = React.useMemo(() => {
		const total = filteredApplications.length;
		const pending = filteredApplications.filter(
			(app: any) => app.status === "PENDING",
		).length;
		const approved = filteredApplications.filter(
			(app: any) => app.status === "APPROVED",
		).length;
		const rejected = filteredApplications.filter(
			(app: any) => app.status === "REJECTED",
		).length;
		const disbursed = filteredApplications.filter(
			(app: any) => app.status === "DISBURSED",
		).length;
		// Use totalAmount from backend if available, else fallback to client calculation
		const totalAmount =
			applicationsData?.totalAmount ??
			filteredApplications.reduce(
				(sum: number, app: any) => sum + app.amount,
				0,
			);

		return { total, pending, approved, rejected, disbursed, totalAmount };
	}, [filteredApplications, applicationsData]);

	// Show error state if there's an error
	if (error) {
		return (
			<ProtectedRoute>
				<MainLayout title="Loan Applications">
					<div className="space-y-6">
						<div className="text-center py-8">
							<div className="text-red-500 text-lg font-medium mb-2">
								Failed to load loan applications
							</div>
							<p className="text-gray-500 mb-4">
								{(error as any)?.message ||
									"An error occurred while fetching data"}
							</p>
							<Button
								variant="primary"
								onClick={() => window.location.reload()}
							>
								Retry
							</Button>
						</div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<MainLayout title="Loan Applications">
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-semibold text-gray-900">
								{isAdmin ? "Loan Applications Management" : "Loan Applications"}
							</h1>
							<p className="mt-1 text-sm text-gray-500">
								{isAdmin
									? "Review, approve, and manage loan applications"
									: "View and track your loan applications"}
							</p>
						</div>
						<div className="flex space-x-3">
							{isAdmin && (
								<form onSubmit={handleSearch} className="flex">
									<div className="relative rounded-md shadow-sm">
										<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
											<MagnifyingGlassIcon
												className="h-5 w-5 text-gray-400"
												aria-hidden="true"
											/>
										</div>
										<input
											type="text"
											className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
											placeholder="Search applications..."
											value={searchInput}
											onChange={(e) => setSearchInput(e.target.value)}
										/>
									</div>
									<Button type="submit" variant="secondary" className="ml-2">
										Search
									</Button>
								</form>
							)}
							<Button
								variant="primary"
								icon={<PlusIcon className="h-5 w-5 mr-2" />}
								onClick={() => router.push("/loans/apply")}
							>
								New Application
							</Button>
						</div>
					</div>

					{/* Statistics Cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
						<Card>
							<div className="p-4">
								<div className="text-2xl font-bold text-gray-900">
									{stats.total}
								</div>
								<div className="text-sm text-gray-500">
									{isAdmin ? "Total Applications" : "My Applications"}
								</div>
							</div>
						</Card>
						<Card>
							<div className="p-4">
								<div className="text-2xl font-bold text-blue-600">
									{stats.pending}
								</div>
								<div className="text-sm text-gray-500">
									{isAdmin ? "Pending Review" : "Pending"}
								</div>
							</div>
						</Card>
						<Card>
							<div className="p-4">
								<div className="text-2xl font-bold text-green-600">
									{stats.approved}
								</div>
								<div className="text-sm text-gray-500">Approved</div>
							</div>
						</Card>
						<Card>
							<div className="p-4">
								<div className="text-2xl font-bold text-red-600">
									{stats.rejected}
								</div>
								<div className="text-sm text-gray-500">Rejected</div>
							</div>
						</Card>
						<Card>
							<div className="p-4">
								<div className="text-2xl font-bold text-purple-600">
									${stats.totalAmount.toLocaleString()}
								</div>
								<div className="text-sm text-gray-500">
									{isAdmin ? "Total Amount" : "My Total Amount"}
								</div>
							</div>
						</Card>
					</div>

					{/* Admin Verification Status */}
					{isAdmin && (
						<Card>
							<div className="px-4 py-5 sm:p-6">
								<div className="flex items-center">
									<div className="flex-shrink-0">
										<CheckCircleIcon className="h-8 w-8 text-green-500" />
									</div>
									<div className="ml-3">
										<h3 className="text-lg font-medium text-gray-900">
											Admin Verification Panel
										</h3>
										<p className="text-sm text-gray-500">
											Review and verify loan applications. Click on the action
											buttons to approve, reject, or view documents.
										</p>
									</div>
								</div>
								<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
									<div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
										<div className="flex">
											<div className="flex-shrink-0">
												<XCircleIcon className="h-5 w-5 text-yellow-400" />
											</div>
											<div className="ml-3">
												<h4 className="text-sm font-medium text-yellow-800">
													Pending Review
												</h4>
												<p className="text-sm text-yellow-700">
													{stats.pending} applications need your review
												</p>
											</div>
										</div>
									</div>
									<div className="bg-green-50 border border-green-200 rounded-md p-4">
										<div className="flex">
											<div className="flex-shrink-0">
												<CheckCircleIcon className="h-5 w-5 text-green-400" />
											</div>
											<div className="ml-3">
												<h4 className="text-sm font-medium text-green-800">
													Approved
												</h4>
												<p className="text-sm text-green-700">
													{stats.approved} applications approved
												</p>
											</div>
										</div>
									</div>
									<div className="bg-red-50 border border-red-200 rounded-md p-4">
										<div className="flex">
											<div className="flex-shrink-0">
												<XCircleIcon className="h-5 w-5 text-red-400" />
											</div>
											<div className="ml-3">
												<h4 className="text-sm font-medium text-red-800">
													Rejected
												</h4>
												<p className="text-sm text-red-700">
													{stats.rejected} applications rejected
												</p>
											</div>
										</div>
									</div>
								</div>
							</div>
						</Card>
					)}

					<Card>
						<div className="px-4 py-5 sm:p-6">
							<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900">
									{isAdmin ? "All Applications" : "Application List"}
								</h3>
								<div className="mt-3 sm:mt-0 flex items-center space-x-2">
									<FunnelIcon className="h-5 w-5 text-gray-400" />
									<select
										className="form-input py-1 pl-2 pr-8"
										value={filter.status}
										onChange={(e) =>
											setFilter({ ...filter, status: e.target.value })
										}
									>
										<option value="">All Status</option>
										<option value="PENDING">Pending</option>
										<option value="APPROVED">Approved</option>
										<option value="REJECTED">Rejected</option>
										<option value="DISBURSED">Disbursed</option>
									</select>
									{isAdmin && (
										<select
											className="form-input py-1 pl-2 pr-8"
											value={filter.loanType}
											onChange={(e) =>
												setFilter({ ...filter, loanType: e.target.value })
											}
										>
											<option value="">All Loan Types</option>
											<option value="Personal Loan">Personal Loan</option>
											<option value="Business Loan">Business Loan</option>
											<option value="Education Loan">Education Loan</option>
										</select>
									)}
								</div>
							</div>

							<Table
								columns={columns as any}
								data={filteredApplications}
								isLoading={isLoading}
								onRowClick={handleRowClick}
								emptyMessage={
									filter.status || filter.loanType || search
										? "No applications match your filters"
										: isAdmin
											? "No loan applications found. Applications will appear here when users submit them."
											: "You don't have any loan applications yet. Apply for a loan to get started."
								}
								keyField="id"
							/>
						</div>
					</Card>

					{!isAdmin && (
						<Card title="Application Process">
							<div className="px-4 py-5 sm:p-6">
								<div className="relative">
									<div
										className="absolute inset-0 flex items-center"
										aria-hidden="true"
									>
										<div className="w-full border-t border-gray-300" />
									</div>
									<div className="relative flex justify-between">
										<div className="flex items-center">
											<span className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
												<span className="text-white font-medium">1</span>
											</span>
											<span className="ml-3 text-sm font-medium text-gray-900">
												Apply
											</span>
										</div>
										<div className="flex items-center">
											<span className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
												<span className="text-white font-medium">2</span>
											</span>
											<span className="ml-3 text-sm font-medium text-gray-900">
												Approval
											</span>
										</div>
										<div className="flex items-center">
											<span className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
												<span className="text-white font-medium">3</span>
											</span>
											<span className="ml-3 text-sm font-medium text-gray-900">
												Documentation
											</span>
										</div>
										<div className="flex items-center">
											<span className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center">
												<span className="text-white font-medium">4</span>
											</span>
											<span className="ml-3 text-sm font-medium text-gray-900">
												Disbursement
											</span>
										</div>
									</div>
								</div>
								<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
									<div>
										<h4 className="text-sm font-medium text-gray-900">
											1. Apply
										</h4>
										<p className="mt-2 text-sm text-gray-500">
											Fill out the loan application form with your personal and
											financial details.
										</p>
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-900">
											2. Approval
										</h4>
										<p className="mt-2 text-sm text-gray-500">
											Our team reviews your application and makes a decision
											based on your eligibility.
										</p>
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-900">
											3. Documentation
										</h4>
										<p className="mt-2 text-sm text-gray-500">
											Upload required documents to verify your identity,
											address, and income.
										</p>
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-900">
											4. Disbursement
										</h4>
										<p className="mt-2 text-sm text-gray-500">
											Once approved and verified, the loan amount is disbursed
											to your account.
										</p>
									</div>
								</div>
							</div>
						</Card>
					)}

					{isAdmin && (
						<Card title="Admin Verification Process">
							<div className="px-4 py-5 sm:p-6">
								<div className="relative">
									<div
										className="absolute inset-0 flex items-center"
										aria-hidden="true"
									>
										<div className="w-full border-t border-gray-300" />
									</div>
									<div className="relative flex justify-between">
										<div className="flex items-center">
											<span className="h-10 w-10 rounded-full bg-yellow-500 flex items-center justify-center">
												<span className="text-white font-medium">1</span>
											</span>
											<span className="ml-3 text-sm font-medium text-gray-900">
												Review
											</span>
										</div>
										<div className="flex items-center">
											<span className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
												<span className="text-white font-medium">2</span>
											</span>
											<span className="ml-3 text-sm font-medium text-gray-900">
												Verify
											</span>
										</div>
										<div className="flex items-center">
											<span className="h-10 w-10 rounded-full bg-green-500 flex items-center justify-center">
												<span className="text-white font-medium">3</span>
											</span>
											<span className="ml-3 text-sm font-medium text-gray-900">
												Approve/Reject
											</span>
										</div>
										<div className="flex items-center">
											<span className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center">
												<span className="text-white font-medium">4</span>
											</span>
											<span className="ml-3 text-sm font-medium text-gray-900">
												Monitor
											</span>
										</div>
									</div>
								</div>
								<div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
									<div>
										<h4 className="text-sm font-medium text-gray-900">
											1. Review Application
										</h4>
										<p className="mt-2 text-sm text-gray-500">
											Examine the loan application details, applicant
											information, and financial data.
										</p>
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-900">
											2. Verify Documents
										</h4>
										<p className="mt-2 text-sm text-gray-500">
											Check uploaded documents for authenticity and
											completeness.
										</p>
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-900">
											3. Approve/Reject
										</h4>
										<p className="mt-2 text-sm text-gray-500">
											Make the final decision based on verification results and
											eligibility criteria.
										</p>
									</div>
									<div>
										<h4 className="text-sm font-medium text-gray-900">
											4. Monitor Progress
										</h4>
										<p className="mt-2 text-sm text-gray-500">
											Track approved applications through disbursement and
											repayment phases.
										</p>
									</div>
								</div>
							</div>
						</Card>
					)}
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default LoanApplicationsPage;
