import { MagnifyingGlassIcon, PlusIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import ClientOnly from "../../../components/common/ClientOnly";
import ProtectedRoute from "../../../components/common/ProtectedRoute";
import MainLayout from "../../../components/layout/MainLayout";
import TransactionList from "../../../components/modules/transactions/TransactionList";
import TransactionSummaryComponent from "../../../components/modules/transactions/TransactionSummary";
import transactionService, {
	type Transaction,
	type TransactionSummary as TransactionSummaryType,
} from "../../../services/transaction.service";

const TransactionsPage: React.FC = () => {
	const router = useRouter();
	const { accountId } = router.query;

	const [transactions, setTransactions] = useState<Transaction[]>([]);
	const [summary, setSummary] = useState<TransactionSummaryType | null>(null);
	const [loading, setLoading] = useState(true);
	const [summaryLoading, setSummaryLoading] = useState(true);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10, // Show 10 transactions per page
		total: 0,
		pages: 1,
	});
	const [filters, setFilters] = useState({
		startDate: "",
		endDate: "",
		transactionType: "",
		accountNumber: "",
	});

	useEffect(() => {
		// Fetch all transactions when router is ready
		if (router.isReady) {
			// If accountId is provided in the URL, get the account details to set account number
			if (accountId && typeof accountId === "string") {
				fetchAccountDetails(accountId);
			}
			fetchTransactions();
			fetchSummary();
		}
	}, [router.isReady, pagination?.page]);

	// Function to fetch account details and set account number in filters
	const fetchAccountDetails = async (accountId: string) => {
		try {
			const account = await transactionService.getAccountById(accountId);
			if (account && account.accountNumber) {
				setFilters((prev) => ({
					...prev,
					accountNumber: account.accountNumber,
				}));
			}
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		}
	};

	const fetchTransactions = async () => {
		setLoading(true);
		try {
			// Use getAllTransactions with accountNumber filter
			const response = await transactionService.getAllTransactions(
				pagination?.page || 1,
				pagination?.limit || 10,
				filters.startDate || undefined,
				filters.endDate || undefined,
				filters.transactionType || undefined,
				undefined, // accountId is not used anymore
				filters.accountNumber || undefined,
			);
			console.log(response.data, " this is response");
			setTransactions(response.data);
			setPagination(response.pagination);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "An unexpected error occurred",
			);
		} finally {
			setLoading(false);
		}
	};

	const fetchSummary = async () => {
		setSummaryLoading(true);
		try {
			// Get summary for all transactions or filtered by accountNumber if provided
			const summaryData = await transactionService.getAllTransactionsSummary(
				undefined, // accountId is not used anymore
				filters.accountNumber,
			);
			setSummary(summaryData);
		} catch (error) {
			//	toast.error(
			//	error instanceof Error ? error.message : "An unexpected error occurred",
			//	);
		} finally {
			setSummaryLoading(false);
		}
	};

	const handlePageChange = (newPage: number) => {
		setPagination((prev) => ({ ...prev, page: newPage }));
	};

	const handleFilterChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFilters((prev) => ({ ...prev, [name]: value }));
	};

	const applyFilters = async () => {
		// Set page to 1 first
		setPagination((prev) => ({ ...prev, page: 1 }));

		// Fetch transactions with the current filters
		await fetchTransactions();
		// Also update the summary based on filters
		await fetchSummary();
	};

	const resetFilters = async () => {
		// Reset filters
		setFilters({
			startDate: "",
			endDate: "",
			transactionType: "",
			accountNumber: "",
		});

		// Set page to 1
		setPagination((prev) => ({ ...prev, page: 1 }));

		// Fetch transactions with reset filters
		await fetchTransactions();
		await fetchSummary();
	};

	const handleCreateTransaction = () => {
		router.push(`/users/transaction/create`);
	};

	const handleViewTransaction = (id: string) => {
		router.push(`/users/transaction/${id}`);
	};

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex justify-between items-center mb-6">
						<div>
							<ClientOnly>
								<h1 className="text-2xl font-semibold text-gray-900">
									All Transactions
								</h1>
								{filters.accountNumber && (
									<p className="text-gray-600">
										Filtered by Account Number: {filters.accountNumber}
									</p>
								)}
								<p className="text-sm text-gray-500 mt-1">
									Showing transactions across all accounts
								</p>
							</ClientOnly>
						</div>
						<Button
							variant="primary"
							className="flex items-center"
							onClick={handleCreateTransaction}
						>
							<PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
							New Transaction
						</Button>
					</div>

					<div className="bg-white shadow rounded-lg mb-6">
						<div className="px-4 py-5 sm:px-6">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Filters
							</h3>
						</div>
						<div className="px-4 py-5 sm:p-6">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
								<div>
									<label
										htmlFor="accountNumber"
										className="block text-sm font-medium text-gray-700"
									>
										Account Number
									</label>
									<input
										type="text"
										name="accountNumber"
										id="accountNumber"
										value={filters.accountNumber}
										onChange={handleFilterChange}
										placeholder="Filter by account number"
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
									/>
								</div>
								<div>
									<label
										htmlFor="startDate"
										className="block text-sm font-medium text-gray-700"
									>
										Start Date
									</label>
									<input
										type="date"
										name="startDate"
										id="startDate"
										value={filters.startDate}
										onChange={handleFilterChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
									/>
								</div>
								<div>
									<label
										htmlFor="endDate"
										className="block text-sm font-medium text-gray-700"
									>
										End Date
									</label>
									<input
										type="date"
										name="endDate"
										id="endDate"
										value={filters.endDate}
										onChange={handleFilterChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
									/>
								</div>
								<div>
									<label
										htmlFor="transactionType"
										className="block text-sm font-medium text-gray-700"
									>
										Transaction Type
									</label>
									<select
										name="transactionType"
										id="transactionType"
										value={filters.transactionType}
										onChange={handleFilterChange}
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
									>
										<option value="">All Types</option>
										<option value="DEPOSIT">Deposit</option>
										<option value="WITHDRAWAL">Withdrawal</option>
										<option value="INTEREST_CREDIT">Interest Credit</option>
										<option value="FEE_DEBIT">Fee Debit</option>
										<option value="ADJUSTMENT">Adjustment</option>
										<option value="TRANSFER_IN">Transfer In</option>
										<option value="TRANSFER_OUT">Transfer Out</option>
									</select>
								</div>
							</div>
							<div className="flex justify-end gap-2">
								<Button variant="outline" onClick={resetFilters}>
									Reset
								</Button>
								<Button
									variant="primary"
									className="flex items-center"
									onClick={applyFilters}
								>
									<MagnifyingGlassIcon
										className="-ml-1 mr-2 h-5 w-5"
										aria-hidden="true"
									/>
									Apply Filters
								</Button>
							</div>
						</div>
					</div>

					<TransactionList
						transactions={transactions}
						loading={loading}
						pagination={pagination}
						onPageChange={handlePageChange}
						onViewTransaction={handleViewTransaction}
					/>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default TransactionsPage;
