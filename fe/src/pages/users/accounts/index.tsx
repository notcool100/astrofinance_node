import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon } from "@heroicons/react/24/outline";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import { formatDate, formatCurrency } from "@/utils/dateUtils";
import { getAllAccounts, Account } from "@/services/user.service";
import { Column } from "react-table";
import { toast } from "react-toastify";

const AccountsPage: React.FC = () => {
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(1);
	const [limit, setLimit] = useState(10);
	const [totalPages, setTotalPages] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [search, setSearch] = useState("");
	const [accountType, setAccountType] = useState<string>("");
	const [status, setStatus] = useState<string>("");

	useEffect(() => {
		fetchAccounts();
	}, [page, limit, accountType, status]);

	const fetchAccounts = async () => {
		try {
			setLoading(true);
			const response = await getAllAccounts(
				page,
				limit,
				search,
				accountType,
				status,
			);
			setAccounts(response.data);
			setTotalPages(response.pagination.pages);
			setTotalCount(response.pagination.total);
		} catch (error) {
			console.error("Error fetching accounts:", error);
			toast.error("Failed to load accounts");
		} finally {
			setLoading(false);
		}
	};

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setPage(1);
		fetchAccounts();
	};

	const handleReset = () => {
		setSearch("");
		setAccountType("");
		setStatus("");
		setPage(1);
		fetchAccounts();
	};

	const columns: Column<Account>[] = [
		{
			Header: "Account Number",
			accessor: "accountNumber",
		},
		{
			Header: "User",
			accessor: "user" as keyof Account,
			Cell: ({ row }: any) => (
				<span>{row.original.user?.fullName || "Unknown"}</span>
			),
		},
		{
			Header: "Account Type",
			accessor: "accountType",
			Cell: ({ value }: { value: string }) => (
				<Badge
					color={
						value === "SB"
							? "blue"
							: value === "BB"
								? "indigo"
								: value === "FD"
									? "green"
									: value === "SH"
										? "purple"
										: value === "LS"
											? "red"
											: "gray"
					}
					text={
						value === "SB"
							? "Sadharan Bachat"
							: value === "BB"
								? "Branch Bises Bachat"
								: value === "FD"
									? "Fixed Deposit"
									: value === "SH"
										? "Share"
										: value === "LS"
											? "Loan Share"
											: value
					}
				/>
			),
		},
		{
			Header: "Balance",
			accessor: "balance",
			Cell: ({ value }: { value: number }) => formatCurrency(value),
		},
		{
			Header: "Opening Date",
			accessor: "openingDate",
			Cell: ({ value }: { value: string }) => formatDate(value),
		},
		{
			Header: "Status",
			accessor: "status",
			Cell: ({ value }: { value: string }) => (
				<Badge
					color={
						value === "ACTIVE"
							? "green"
							: value === "INACTIVE"
								? "yellow"
								: value === "CLOSED"
									? "gray"
									: "red"
					}
					text={value}
				/>
			),
		},
		{
			Header: "Actions",
			accessor: "id",
			Cell: ({ value }: { value: string }) => (
				<Link href={`/users/accounts/${value}`}>
					<Button variant="outline" size="sm">
						View Details
					</Button>
				</Link>
			),
		},
	];

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="sm:flex sm:items-center">
						<div className="sm:flex-auto">
							<h1 className="text-xl font-semibold text-gray-900">Accounts</h1>
							<p className="mt-2 text-sm text-gray-700">
								A list of all accounts in the system including their account
								number, type, balance, and status.
							</p>
						</div>
						<div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
							<Link href="/users/accounts/new">
								<Button className="flex items-center">
									<PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
									New Account
								</Button>
							</Link>
						</div>
					</div>

					{/* Filters */}
					<div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
						<form
							onSubmit={handleSearch}
							className="space-y-4 sm:space-y-0 sm:flex sm:items-end sm:space-x-4"
						>
							<div className="sm:w-64">
								<label
									htmlFor="search"
									className="block text-sm font-medium text-gray-700"
								>
									Search
								</label>
								<input
									type="text"
									name="search"
									id="search"
									value={search}
									onChange={(e) => setSearch(e.target.value)}
									placeholder="Account number, user name..."
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
								/>
							</div>

							<div className="sm:w-48">
								<label
									htmlFor="accountType"
									className="block text-sm font-medium text-gray-700"
								>
									Account Type
								</label>
								<select
									id="accountType"
									name="accountType"
									value={accountType}
									onChange={(e) => setAccountType(e.target.value)}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
								>
									<option value="">All Types</option>
									<option value="SB">Sadharan Bachat</option>
									<option value="BB">Branch Bises Bachat</option>
									<option value="FD">Fixed Deposit</option>
									<option value="SH">Share</option>
									<option value="LS">Loan Share</option>
								</select>
							</div>

							<div className="sm:w-48">
								<label
									htmlFor="status"
									className="block text-sm font-medium text-gray-700"
								>
									Status
								</label>
								<select
									id="status"
									name="status"
									value={status}
									onChange={(e) => setStatus(e.target.value)}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
								>
									<option value="">All Statuses</option>
									<option value="ACTIVE">Active</option>
									<option value="INACTIVE">Inactive</option>
									<option value="CLOSED">Closed</option>
									<option value="FROZEN">Frozen</option>
								</select>
							</div>

							<div className="flex space-x-2">
								<Button type="submit">Search</Button>
								<Button type="button" variant="outline" onClick={handleReset}>
									Reset
								</Button>
							</div>
						</form>
					</div>

					{/* Results */}
					<div className="mt-6">
						{loading ? (
							<div className="text-center py-10">
								<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-400 border-r-transparent"></div>
								<p className="mt-4 text-gray-700">Loading accounts...</p>
							</div>
						) : accounts.length === 0 ? (
							<div className="text-center py-10 bg-white shadow rounded-lg">
								<p className="text-gray-500">No accounts found.</p>
								<Link href="/users/accounts/new">
									<Button className="mt-4 flex items-center mx-auto">
										<PlusIcon
											className="-ml-1 mr-2 h-5 w-5"
											aria-hidden="true"
										/>
										Create New Account
									</Button>
								</Link>
							</div>
						) : (
							<>
								<Table columns={columns} data={accounts} keyField="id" />

								{/* Pagination */}
								<div className="mt-4 flex items-center justify-between">
									<div className="text-sm text-gray-700">
										Showing{" "}
										<span className="font-medium">
											{(page - 1) * limit + 1}
										</span>{" "}
										to{" "}
										<span className="font-medium">
											{Math.min(page * limit, totalCount)}
										</span>{" "}
										of <span className="font-medium">{totalCount}</span> results
									</div>
									<div className="flex space-x-2">
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(page - 1)}
											disabled={page === 1}
										>
											Previous
										</Button>
										<Button
											variant="outline"
											size="sm"
											onClick={() => setPage(page + 1)}
											disabled={page >= totalPages}
										>
											Next
										</Button>
									</div>
								</div>
							</>
						)}
					</div>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default AccountsPage;
