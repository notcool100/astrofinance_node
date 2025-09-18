import React, { useState } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import loanService, { Loan } from "@/services/loanService";
import { Column } from "react-table";
import {
	PlusIcon,
	FunnelIcon,
	CalculatorIcon,
	EyeIcon,
	DocumentIcon,
	CheckCircleIcon,
	XCircleIcon,
	MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const LoanStatusBadge = ({ status }: { status: string }) => {
	switch (status) {
		case "ACTIVE":
			return <Badge variant="success">Active</Badge>;
		case "CLOSED":
			return <Badge variant="secondary">Closed</Badge>;
		case "DEFAULTED":
			return <Badge variant="danger">Defaulted</Badge>;
		case "WRITTEN_OFF":
			return <Badge variant="warning">Written Off</Badge>;
		default:
			return <Badge variant="primary">{status}</Badge>;
	}
};

const LoansPage = () => {
	const router = useRouter();
	const { user } = useAuth();
	const [filter, setFilter] = useState({
		status: "",
		loanType: "",
	});
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");

	// Check if user is admin/staff
	const isAdmin = user?.roles?.some(
		(role: { id: string; name: string }) =>
			role.name === "admin" || role.name === "staff",
	);

	// Fetch loans
	const { data: loansData, isLoading } = useQuery(
		["loans", filter, search],
		() => {
			const queryParams: any = { ...filter };
			if (search) queryParams.search = search;
			return loanService.getLoans(queryParams);
		},
		{
			keepPreviousData: true,
		},
	);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(searchInput);
	};

	const columns: Column<Loan>[] = React.useMemo(
		() => [
			{
				Header: "Loan Number",
				accessor: "loanNumber",
			},
			{
				Header: "Loan Type",
				accessor: "loanType",
				Cell: ({ row }: any) => row.original.loanType?.name || "N/A",
			},
			{
				Header: "Amount",
				accessor: "amount",
				Cell: ({ value }: { value: number }) => `$${value.toLocaleString()}`,
			},
			{
				Header: "EMI",
				accessor: "emi",
				Cell: ({ value }: { value: number }) => `$${value.toLocaleString()}`,
			},
			{
				Header: "Tenure",
				accessor: "tenure",
				Cell: ({ value }: { value: number }) => `${value} months`,
			},
			{
				Header: "Disbursement Date",
				accessor: "disbursementDate",
				Cell: ({ value }: { value: string }) =>
					value ? new Date(value).toLocaleDateString() : "N/A",
			},
			{
				Header: "Status",
				accessor: "status",
				Cell: ({ value }: { value: string }) => (
					<LoanStatusBadge status={value} />
				),
			},
			{
				Header: "Actions",
				accessor: "id",
				Cell: ({ row }: any) => (
					<div className="flex space-x-2">
						<button
							type="button"
							onClick={() => router.push(`/loans/${row.original.id}`)}
							className="text-primary-600 hover:text-primary-900"
							title="View Details"
						>
							<EyeIcon className="h-4 w-4" />
						</button>

						{/* Admin/Staff Actions */}
						{isAdmin && (
							<>
								<button
									type="button"
									onClick={() =>
										router.push(`/loans/${row.original.id}/documents`)
									}
									className="text-blue-600 hover:text-blue-900"
									title="View Documents"
								>
									<DocumentIcon className="h-4 w-4" />
								</button>

								{row.original.status === "ACTIVE" && (
									<button
										type="button"
										onClick={() =>
											router.push(`/loans/${row.original.id}/payments`)
										}
										className="text-green-600 hover:text-green-900"
										title="Manage Payments"
									>
										Pay
									</button>
								)}

								{row.original.status === "ACTIVE" && (
									<button
										type="button"
										onClick={() => {
											if (
												confirm("Are you sure you want to close this loan?")
											) {
												// Add close loan functionality
												toast.success("Loan closure initiated");
											}
										}}
										className="text-red-600 hover:text-red-900"
										title="Close Loan"
									>
										<XCircleIcon className="h-4 w-4" />
									</button>
								)}
							</>
						)}

						{/* Regular User Actions */}
						{!isAdmin && row.original.status === "ACTIVE" && (
							<button
								type="button"
								onClick={() =>
									router.push(`/loans/${row.original.id}/payments`)
								}
								className="text-primary-600 hover:text-primary-900"
							>
								Pay
							</button>
						)}
					</div>
				),
			},
		],
		[router, isAdmin],
	);

	const handleRowClick = (row: any) => {
		router.push(`/loans/${row.original.id}`);
	};

	// Mock data for now
	const mockLoans: Loan[] = [
		{
			id: "L-1001",
			loanNumber: "LN-1001",
			userId: "user-1",
			applicationId: "LA-1001",
			amount: 10000,
			tenure: 12,
			interestRate: 12,
			interestType: "FLAT",
			emi: 916.67,
			disbursementDate: "2023-12-05",
			status: "ACTIVE",
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
		},
		{
			id: "L-1002",
			loanNumber: "LN-1002",
			userId: "user-1",
			applicationId: "LA-1002",
			amount: 25000,
			tenure: 24,
			interestRate: 15,
			interestType: "DIMINISHING",
			emi: 1207.73,
			disbursementDate: "2023-11-15",
			status: "ACTIVE",
			loanType: {
				id: "2",
				name: "Business Loan",
				code: "BL",
				interestType: "DIMINISHING",
				minAmount: 5000,
				maxAmount: 200000,
				minTenure: 6,
				maxTenure: 60,
				interestRate: 15,
				processingFeePercent: 2.5,
				lateFeeAmount: 750,
				isActive: true,
			},
		},
		{
			id: "L-1003",
			loanNumber: "LN-1003",
			userId: "user-1",
			applicationId: "LA-1003",
			amount: 5000,
			tenure: 6,
			interestRate: 10,
			interestType: "FLAT",
			emi: 875.0,
			disbursementDate: "2023-09-20",
			status: "CLOSED",
			closureDate: "2024-03-20",
			loanType: {
				id: "1",
				name: "Personal Loan",
				code: "PL",
				interestType: "FLAT",
				processingFeePercent: 2,
				lateFeeAmount: 500,
				minAmount: 1000,
				maxAmount: 50000,
				minTenure: 3,
				maxTenure: 36,
				interestRate: 12,
				isActive: true,
			},
		},
	];

	return (
		<ProtectedRoute>
			<MainLayout title="My Loans">
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-semibold text-gray-900">
								{isAdmin ? "Loan Management" : "My Loans"}
							</h1>
							<p className="mt-1 text-sm text-gray-500">
								{isAdmin
									? "Manage and monitor all loans in the system"
									: "View and manage your active and past loans"}
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
											placeholder="Search loans..."
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
								variant="secondary"
								icon={<CalculatorIcon className="h-5 w-5 mr-2" />}
								onClick={() => router.push("/loans/calculator")}
							>
								Loan Calculator
							</Button>
							<Button
								variant="primary"
								icon={<PlusIcon className="h-5 w-5 mr-2" />}
								onClick={() => router.push("/loans/apply")}
							>
								Apply for Loan
							</Button>
						</div>
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
											Loan Management Panel
										</h3>
										<p className="text-sm text-gray-500">
											Monitor and manage all loans in the system. View
											documents, manage payments, and track loan performance.
										</p>
									</div>
								</div>
								<div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
									<div className="bg-green-50 border border-green-200 rounded-md p-4">
										<div className="flex">
											<div className="flex-shrink-0">
												<CheckCircleIcon className="h-5 w-5 text-green-400" />
											</div>
											<div className="ml-3">
												<h4 className="text-sm font-medium text-green-800">
													Active Loans
												</h4>
												<p className="text-sm text-green-700">
													{
														mockLoans.filter((loan) => loan.status === "ACTIVE")
															.length
													}{" "}
													loans currently active
												</p>
											</div>
										</div>
									</div>
									<div className="bg-blue-50 border border-blue-200 rounded-md p-4">
										<div className="flex">
											<div className="flex-shrink-0">
												<DocumentIcon className="h-5 w-5 text-blue-400" />
											</div>
											<div className="ml-3">
												<h4 className="text-sm font-medium text-blue-800">
													Document Management
												</h4>
												<p className="text-sm text-blue-700">
													View and manage loan documents
												</p>
											</div>
										</div>
									</div>
									<div className="bg-purple-50 border border-purple-200 rounded-md p-4">
										<div className="flex">
											<div className="flex-shrink-0">
												<CalculatorIcon className="h-5 w-5 text-purple-400" />
											</div>
											<div className="ml-3">
												<h4 className="text-sm font-medium text-purple-800">
													Payment Management
												</h4>
												<p className="text-sm text-purple-700">
													Track and manage loan payments
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
									{isAdmin ? "All Loans" : "Loan List"}
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
										<option value="ACTIVE">Active</option>
										<option value="CLOSED">Closed</option>
										<option value="DEFAULTED">Defaulted</option>
									</select>
									<select
										className="form-input py-1 pl-2 pr-8"
										value={filter.loanType}
										onChange={(e) =>
											setFilter({ ...filter, loanType: e.target.value })
										}
									>
										<option value="">All Loan Types</option>
										<option value="1">Personal Loan</option>
										<option value="2">Business Loan</option>
										<option value="3">Education Loan</option>
									</select>
								</div>
							</div>

							<Table
								columns={columns}
								data={loansData?.data || mockLoans}
								isLoading={isLoading}
								onRowClick={handleRowClick}
								emptyMessage={
									isAdmin
										? "No loans found in the system. Loans will appear here when applications are approved and disbursed."
										: "You don't have any loans yet. Apply for a loan to get started."
								}
							/>
						</div>
					</Card>

					<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
						<Card>
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900">
									{isAdmin ? "System Overview" : "Active Loans"}
								</h3>
								<div className="mt-2 max-w-xl text-sm text-gray-500">
									<p>
										{isAdmin ? "System has" : "You have"}{" "}
										{
											mockLoans.filter((loan) => loan.status === "ACTIVE")
												.length
										}{" "}
										{isAdmin ? "total active loans" : "active loans"}.
									</p>
								</div>
								<div className="mt-5">
									<div className="rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-start sm:justify-between">
										<div className="sm:flex sm:items-start">
											<div className="mt-3 sm:mt-0 sm:ml-4">
												<div className="text-sm font-medium text-gray-900">
													{isAdmin ? "Total Outstanding" : "Total Outstanding"}
												</div>
												<div className="mt-1 text-sm text-gray-600 sm:flex sm:items-center">
													<div>
														$
														{mockLoans
															.filter((loan) => loan.status === "ACTIVE")
															.reduce((sum, loan) => sum + loan.amount, 0)
															.toLocaleString()}
													</div>
												</div>
											</div>
										</div>
										<div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
											<Button
												variant="secondary"
												onClick={() => router.push("/loans/applications")}
											>
												{isAdmin ? "Manage Applications" : "View Applications"}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</Card>

						<Card>
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900">
									{isAdmin ? "Payment Overview" : "Monthly Payments"}
								</h3>
								<div className="mt-2 max-w-xl text-sm text-gray-500">
									<p>
										{isAdmin
											? "Total monthly EMI payments across all active loans in the system."
											: "Your total monthly EMI payments across all active loans."}
									</p>
								</div>
								<div className="mt-5">
									<div className="rounded-md bg-gray-50 px-6 py-5 sm:flex sm:items-start sm:justify-between">
										<div className="sm:flex sm:items-start">
											<div className="mt-3 sm:mt-0 sm:ml-4">
												<div className="text-sm font-medium text-gray-900">
													{isAdmin ? "Total System EMI" : "Total Monthly EMI"}
												</div>
												<div className="mt-1 text-sm text-gray-600 sm:flex sm:items-center">
													<div>
														$
														{mockLoans
															.filter((loan) => loan.status === "ACTIVE")
															.reduce((sum, loan) => sum + loan.emi, 0)
															.toLocaleString()}
													</div>
												</div>
											</div>
										</div>
										<div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-shrink-0">
											<Button
												variant="secondary"
												onClick={() => router.push("/loans/payments")}
											>
												{isAdmin ? "Payment Management" : "Payment History"}
											</Button>
										</div>
									</div>
								</div>
							</div>
						</Card>

						<Card>
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900">
									{isAdmin ? "Admin Tools" : "Need Help?"}
								</h3>
								<div className="mt-2 max-w-xl text-sm text-gray-500">
									<p>
										{isAdmin
											? "Access administrative tools and system management features."
											: "If you have any questions about your loans or need assistance, our support team is here to help."}
									</p>
								</div>
								<div className="mt-5">
									<div className="flex space-x-4">
										{isAdmin ? (
											<>
												<Button
													variant="outline"
													onClick={() => router.push("/admin/dashboard")}
												>
													Admin Dashboard
												</Button>
												<Button
													variant="outline"
													onClick={() => router.push("/admin/settings")}
												>
													System Settings
												</Button>
											</>
										) : (
											<>
												<Button
													variant="outline"
													onClick={() => router.push("/help")}
												>
													Help Center
												</Button>
												<Button
													variant="outline"
													onClick={() => router.push("/contact")}
												>
													Contact Support
												</Button>
											</>
										)}
									</div>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default LoansPage;
