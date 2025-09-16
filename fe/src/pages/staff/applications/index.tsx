import React, { useState } from "react";
import { useQuery } from "react-query";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import apiService from "@/services/api";
import loanService from "@/services/loanService";
import {
	MagnifyingGlassIcon,
	PlusIcon,
	ChevronLeftIcon,
	ChevronRightIcon,
	EyeIcon,
	CheckCircleIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";

// Types for loan application data
interface LoanApplication {
	id: string;
	applicationNumber: string;
	userId: string;
	userName: string;
	loanTypeId: string;
	loanTypeName: string;
	amount: number;
	tenure: number;
	purpose: string;
	status: "PENDING" | "APPROVED" | "REJECTED" | "DISBURSED";
	appliedDate: string;
	approvedDate?: string;
	approvedById?: string;
	rejectionReason?: string;
}

interface ApplicationsResponse {
	applications: LoanApplication[];
	total: number;
	page: number;
	limit: number;
}

// Service to fetch loan applications
const fetchApplications = async (
	page = 1,
	limit = 10,
	status = "",
	search = "",
): Promise<ApplicationsResponse> => {
	try {
		// Build query parameters
		const params: any = { page, limit };
		if (status) params.status = status;
		if (search) params.search = search;

		// Call the real API
		const response = await loanService.getLoanApplications(params);

		// Transform the response to match our interface
		const applications: LoanApplication[] = (response.data || []).map(
			(app: any) => ({
				id: app.id,
				applicationNumber:
					app.applicationNumber || `APP-${app.id.slice(-8).toUpperCase()}`,
				userId: app.userId,
				userName: app.user?.fullName || "Unknown User",
				loanTypeId: app.loanTypeId,
				loanTypeName: app.loanType?.name || "Unknown Type",
				amount: app.amount,
				tenure: app.tenure,
				purpose: app.purpose,
				status: app.status,
				appliedDate: app.appliedDate || app.createdAt,
				approvedDate: app.approvedDate,
				approvedById: app.approvedById,
				rejectionReason: app.rejectionReason,
			}),
		);

		return {
			applications,
			total: response.pagination?.total || applications.length,
			page: response.pagination?.page || page,
			limit: response.pagination?.limit || limit,
		};
	} catch (error) {
		console.error("Error fetching loan applications:", error);
		throw error;
	}
};

const getStatusBadgeColor = (status: string) => {
	switch (status) {
		case "PENDING":
			return "yellow";
		case "APPROVED":
			return "blue";
		case "REJECTED":
			return "red";
		case "DISBURSED":
			return "green";
		default:
			return "gray";
	}
};

const LoanApplicationsPage = () => {
	const { isAuthenticated, isLoading: authLoading } = useAuth();
	const router = useRouter();
	const [page, setPage] = useState(1);
	const [limit] = useState(10);
	const [status, setStatus] = useState("");
	const [search, setSearch] = useState("");
	const [searchInput, setSearchInput] = useState("");

	// Fetch loan applications data
	const { data, isLoading, refetch } = useQuery(
		["loanApplications", page, limit, status, search],
		() => fetchApplications(page, limit, status, search),
		{
			enabled: isAuthenticated,
			keepPreviousData: true,
		},
	);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(searchInput);
		setPage(1);
	};

	const handleStatusChange = (newStatus: string) => {
		setStatus(newStatus);
		setPage(1);
	};

	const handlePageChange = (newPage: number) => {
		setPage(newPage);
	};

	if (authLoading || !isAuthenticated) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	return (
		<ProtectedRoute staffOnly>
			<MainLayout title="Loan Applications">
				<div className="space-y-6">
					<Card>
						<div className="flex flex-col sm:flex-row justify-between items-center p-4 space-y-4 sm:space-y-0">
							<h1 className="text-xl font-semibold text-gray-900">
								Loan Applications
							</h1>
							<div className="flex space-x-4">
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
									<Button type="submit" variant="primary" className="ml-2">
										Search
									</Button>
								</form>
								<Button
									variant="primary"
									onClick={() => router.push("/staff/applications/new")}
									className="flex items-center"
								>
									<PlusIcon className="h-5 w-5 mr-1" />
									New Application
								</Button>
							</div>
						</div>
					</Card>

					<div className="bg-white shadow overflow-hidden sm:rounded-lg">
						<div className="border-b border-gray-200">
							<nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
								<button
									onClick={() => handleStatusChange("")}
									className={`${
										status === ""
											? "border-primary-500 text-primary-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
								>
									All
								</button>
								<button
									onClick={() => handleStatusChange("PENDING")}
									className={`${
										status === "PENDING"
											? "border-yellow-500 text-yellow-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
								>
									Pending
								</button>
								<button
									onClick={() => handleStatusChange("APPROVED")}
									className={`${
										status === "APPROVED"
											? "border-blue-500 text-blue-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
								>
									Approved
								</button>
								<button
									onClick={() => handleStatusChange("REJECTED")}
									className={`${
										status === "REJECTED"
											? "border-red-500 text-red-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
								>
									Rejected
								</button>
								<button
									onClick={() => handleStatusChange("DISBURSED")}
									className={`${
										status === "DISBURSED"
											? "border-green-500 text-green-600"
											: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
									} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
								>
									Disbursed
								</button>
							</nav>
						</div>
					</div>

					<Card>
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-300">
								<thead className="bg-gray-50">
									<tr>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Application #
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Applicant
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Loan Type
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Amount
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Status
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Applied Date
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{isLoading ? (
										<tr>
											<td
												colSpan={7}
												className="px-6 py-4 text-center text-sm text-gray-500"
											>
												Loading...
											</td>
										</tr>
									) : data && data.applications.length > 0 ? (
										data.applications.map((application) => (
											<tr key={application.id} className="hover:bg-gray-50">
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{application.applicationNumber}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{application.userName}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{application.loanTypeName}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													${application.amount.toLocaleString()}
												</td>
												<td className="px-6 py-4 whitespace-nowrap">
													<Badge
														color={
															getStatusBadgeColor(application.status) as any
														}
														text={application.status}
													/>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{new Date(
														application.appliedDate,
													).toLocaleDateString()}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<div className="flex justify-end space-x-2">
														<button
															onClick={() =>
																router.push(
																	`/staff/applications/${application.id}`,
																)
															}
															className="text-primary-600 hover:text-primary-900"
															title="View Details"
														>
															<EyeIcon className="h-5 w-5" />
														</button>
														{application.status === "PENDING" && (
															<>
																<button
																	onClick={() =>
																		router.push(
																			`/staff/applications/${application.id}/approve`,
																		)
																	}
																	className="text-green-600 hover:text-green-900"
																	title="Approve"
																>
																	<CheckCircleIcon className="h-5 w-5" />
																</button>
																<button
																	onClick={() =>
																		router.push(
																			`/staff/applications/${application.id}/reject`,
																		)
																	}
																	className="text-red-600 hover:text-red-900"
																	title="Reject"
																>
																	<XCircleIcon className="h-5 w-5" />
																</button>
															</>
														)}
													</div>
												</td>
											</tr>
										))
									) : (
										<tr>
											<td
												colSpan={7}
												className="px-6 py-4 text-center text-sm text-gray-500"
											>
												No loan applications found.
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>

						{/* Pagination */}
						{data && data.total > 0 && (
							<div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
								<div className="flex-1 flex justify-between sm:hidden">
									<Button
										variant="outline"
										onClick={() => handlePageChange(page - 1)}
										disabled={page === 1}
									>
										Previous
									</Button>
									<Button
										variant="outline"
										onClick={() => handlePageChange(page + 1)}
										disabled={page * limit >= data.total}
									>
										Next
									</Button>
								</div>
								<div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
									<div>
										<p className="text-sm text-gray-700">
											Showing{" "}
											<span className="font-medium">
												{(page - 1) * limit + 1}
											</span>{" "}
											to{" "}
											<span className="font-medium">
												{Math.min(page * limit, data.total)}
											</span>{" "}
											of <span className="font-medium">{data.total}</span>{" "}
											results
										</p>
									</div>
									<div>
										<nav
											className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
											aria-label="Pagination"
										>
											<Button
												variant="outline"
												className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
												onClick={() => handlePageChange(page - 1)}
												disabled={page === 1}
											>
												<span className="sr-only">Previous</span>
												<ChevronLeftIcon
													className="h-5 w-5"
													aria-hidden="true"
												/>
											</Button>
											{Array.from({
												length: Math.ceil(data.total / limit),
											}).map((_, i) => (
												<Button
													key={i}
													variant={page === i + 1 ? "primary" : "outline"}
													className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
														page === i + 1
															? "z-10 bg-primary-50 border-primary-500 text-primary-600"
															: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
													}`}
													onClick={() => handlePageChange(i + 1)}
												>
													{i + 1}
												</Button>
											))}
											<Button
												variant="outline"
												className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
												onClick={() => handlePageChange(page + 1)}
												disabled={page * limit >= data.total}
											>
												<span className="sr-only">Next</span>
												<ChevronRightIcon
													className="h-5 w-5"
													aria-hidden="true"
												/>
											</Button>
										</nav>
									</div>
								</div>
							</div>
						)}
					</Card>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default LoanApplicationsPage;
