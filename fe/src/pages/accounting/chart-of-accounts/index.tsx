import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
	PlusIcon,
	PencilIcon,
	TrashIcon,
	ChevronDownIcon,
	ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import MainLayout from "../../../components/layout/MainLayout";
import ProtectedRoute from "../../../components/common/ProtectedRoute";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import chartOfAccountsService, {
	Account,
} from "../../../services/chart-of-accounts.service";

const ChartOfAccountsPage: React.FC = () => {
	const router = useRouter();
	const [accounts, setAccounts] = useState<Account[]>([]);
	const [loading, setLoading] = useState(true);
	const [expandedAccounts, setExpandedAccounts] = useState<
		Record<string, boolean>
	>({});
	const [filter, setFilter] = useState({
		type: "",
		active: "",
	});

	const fetchAccounts = useCallback(async () => {
		setLoading(true);
		try {
			// For hierarchical view, use getAccountStructure with filters
			const data = await chartOfAccountsService.getAccountStructure(
				filter.type || undefined,
				filter.active ? filter.active === "true" : undefined,
			);
			setAccounts(data);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		} finally {
			setLoading(false);
		}
	}, [filter.type, filter.active]);

	useEffect(() => {
		fetchAccounts();
	}, [fetchAccounts]);

	const handleCreateAccount = () => {
		router.push("/accounting/chart-of-accounts/create");
	};

	const handleEditAccount = (id: string) => {
		router.push(`/accounting/chart-of-accounts/${id}/edit`);
	};

	const handleDeleteAccount = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this account?")) {
			try {
				await chartOfAccountsService.deleteAccount(id);
				toast.success("Account deleted successfully");
				fetchAccounts();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to delete account",
				);
			}
		}
	};

	const toggleExpand = (id: string) => {
		setExpandedAccounts((prev) => ({
			...prev,
			[id]: !prev[id],
		}));
	};

	const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const { name, value } = e.target;
		setFilter((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const getAccountTypeBadge = (type: string) => {
		switch (type) {
			case "ASSET":
				return <Badge color="blue" text="Asset" />;
			case "LIABILITY":
				return <Badge color="red" text="Liability" />;
			case "EQUITY":
				return <Badge color="green" text="Equity" />;
			case "INCOME":
				return <Badge color="purple" text="Income" />;
			case "EXPENSE":
				return <Badge color="yellow" text="Expense" />;
			default:
				return <Badge color="gray" text={type} />;
		}
	};

	const renderAccountRow = (account: Account, level = 0) => {
		const hasChildren = account.children && account.children.length > 0;
		const isExpanded = expandedAccounts[account.id] || false;

		return (
			<React.Fragment key={account.id}>
				<tr
					className={`${!account.isActive ? "bg-gray-50 text-gray-500" : ""}`}
				>
					<td className="px-6 py-4 whitespace-nowrap">
						<div className="flex items-center">
							<div
								style={{ marginLeft: `${level * 20}px` }}
								className="flex items-center"
							>
								{hasChildren && (
									<button
										type="button"
										onClick={() => toggleExpand(account.id)}
										className="mr-2 text-gray-500 hover:text-gray-700"
									>
										{isExpanded ? (
											<ChevronDownIcon className="h-4 w-4" />
										) : (
											<ChevronRightIcon className="h-4 w-4" />
										)}
									</button>
								)}
								<span
									className={`${!account.isActive ? "text-gray-500" : "font-medium text-gray-900"}`}
								>
									{account.accountCode}
								</span>
							</div>
						</div>
					</td>
					<td className="px-6 py-4 whitespace-nowrap">
						<div
							className={`${!account.isActive ? "text-gray-500" : "text-gray-900"}`}
						>
							{account.name}
						</div>
					</td>
					<td className="px-6 py-4 whitespace-nowrap">
						{getAccountTypeBadge(account.accountType)}
					</td>
					<td className="px-6 py-4 whitespace-nowrap">
						<div className="text-sm text-gray-500 truncate max-w-xs">
							{account.description || "No description"}
						</div>
					</td>
					<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
						{account.isActive ? (
							<Badge color="green" text="Active" />
						) : (
							<Badge color="gray" text="Inactive" />
						)}
					</td>
					<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
						<div className="flex justify-end space-x-2">
							<button
								type="button"
								onClick={() => handleEditAccount(account.id)}
								className="text-indigo-600 hover:text-indigo-900"
							>
								<PencilIcon className="h-5 w-5" />
							</button>
							<button
								type="button"
								onClick={() => handleDeleteAccount(account.id)}
								className="text-red-600 hover:text-red-900"
							>
								<TrashIcon className="h-5 w-5" />
							</button>
						</div>
					</td>
				</tr>
				{hasChildren &&
					isExpanded &&
					account.children?.map((child) => renderAccountRow(child, level + 1))}
			</React.Fragment>
		);
	};

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-gray-900">
							Chart of Accounts
						</h1>
						<Button
							variant="primary"
							className="flex items-center"
							onClick={handleCreateAccount}
						>
							<PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
							New Account
						</Button>
					</div>

					<div className="bg-white shadow rounded-lg mb-6">
						<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Filters
							</h3>
						</div>
						<div className="px-4 py-5 sm:p-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="type"
										className="block text-sm font-medium text-gray-700"
									>
										Account Type
									</label>
									<select
										id="type"
										name="type"
										value={filter.type}
										onChange={handleFilterChange}
										className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
									>
										<option value="">All Types</option>
										<option value="ASSET">Asset</option>
										<option value="LIABILITY">Liability</option>
										<option value="EQUITY">Equity</option>
										<option value="INCOME">Income</option>
										<option value="EXPENSE">Expense</option>
									</select>
								</div>
								<div>
									<label
										htmlFor="active"
										className="block text-sm font-medium text-gray-700"
									>
										Status
									</label>
									<select
										id="active"
										name="active"
										value={filter.active}
										onChange={handleFilterChange}
										className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
									>
										<option value="">All</option>
										<option value="true">Active</option>
										<option value="false">Inactive</option>
									</select>
								</div>
							</div>
						</div>
					</div>

					<div className="bg-white shadow rounded-lg overflow-hidden">
						<div className="overflow-x-auto">
							{loading ? (
								<div className="px-6 py-4 text-center text-gray-500">
									Loading accounts...
								</div>
							) : accounts.length === 0 ? (
								<div className="px-6 py-4 text-center text-gray-500">
									No accounts found
								</div>
							) : (
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Code
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Name
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Type
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Description
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Status
											</th>
											<th scope="col" className="relative px-6 py-3">
												<span className="sr-only">Actions</span>
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{accounts.map((account) => renderAccountRow(account))}
									</tbody>
								</table>
							)}
						</div>
					</div>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default ChartOfAccountsPage;
