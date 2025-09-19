import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import type React from "react";
import type { Transaction } from "../../../services/transaction.service";
import { formatCurrency } from "../../../utils/dateUtils";
import Badge from "../../common/Badge";
import Button from "../../common/Button";

interface TransactionListProps {
	transactions: Transaction[];
	loading: boolean;
	pagination: {
		page: number;
		limit: number;
		total: number;
		pages: number;
	};
	onPageChange: (page: number) => void;
	onViewTransaction: (id: string) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({
	transactions,
	loading,
	pagination,
	onPageChange,
	onViewTransaction,
}) => {
	const getTransactionTypeBadge = (type: string) => {
		switch (type) {
			case "DEPOSIT":
				return <Badge color="green" text="Deposit" />;
			case "WITHDRAWAL":
				return <Badge color="red" text="Withdrawal" />;
			case "INTEREST_CREDIT":
				return <Badge color="blue" text="Interest Credit" />;
			case "FEE_DEBIT":
				return <Badge color="orange" text="Fee Debit" />;
			case "ADJUSTMENT":
				return <Badge color="purple" text="Adjustment" />;
			case "TRANSFER_IN":
				return <Badge color="teal" text="Transfer In" />;
			case "TRANSFER_OUT":
				return <Badge color="pink" text="Transfer Out" />;
			default:
				return <Badge color="gray" text="Unknown" />;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "COMPLETED":
				return <Badge color="green" text="Completed" />;
			case "PENDING":
				return <Badge color="yellow" text="Pending" />;
			case "FAILED":
				return <Badge color="red" text="Failed" />;
			case "CANCELLED":
				return <Badge color="gray" text="Cancelled" />;
			default:
				return <Badge color="gray" text="Unknown" />;
		}
	};

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), "MMM dd, yyyy HH:mm");
		} catch (error) {
			return "Invalid date";
		}
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center h-48">
				<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
			</div>
		);
	}

	return (
		<>
			<div className="overflow-x-auto">
				<table className="min-w-full divide-y divide-gray-200">
					<thead className="bg-gray-50">
						<tr>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Users
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
								Reference
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Description
							</th>
							<th
								scope="col"
								className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
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
								Date
							</th>

							<th
								scope="col"
								className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
							>
								Actions
							</th>
						</tr>
					</thead>
					<tbody className="bg-white divide-y divide-gray-200">
						{!Array.isArray(transactions) || transactions.length === 0 ? (
							<tr>
								<td
									colSpan={7}
									className="px-6 py-4 text-center text-sm text-gray-500"
								>
									No transactions found
								</td>
							</tr>
						) : (
							transactions.map((transaction) => (
								<tr key={transaction.id}>
									<td className="px-6 py-4 whitespace-nowrap">
										{transaction.account.user.fullName}
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{getTransactionTypeBadge(transaction.transactionType)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{transaction.referenceNumber || "-"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{transaction.description || "-"}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-right">
										<span
											className={`font-medium ${
												["DEPOSIT", "INTEREST_CREDIT", "TRANSFER_IN"].includes(
													transaction.transactionType,
												)
													? "text-green-600"
													: "text-red-600"
											}`}
										>
											{formatCurrency(transaction.amount)}
										</span>
									</td>
									<td className="px-6 py-4 whitespace-nowrap">
										{getStatusBadge(transaction.status)}
									</td>
									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										{formatDate(transaction.transactionDate)}
									</td>

									<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
										<Button
											variant="outline"
											size="sm"
											onClick={() => onViewTransaction(transaction.id)}
										>
											View
										</Button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			<div className="flex justify-between items-center mt-4">
				<p className="text-sm text-gray-700">
					Showing {Array.isArray(transactions) ? transactions.length : 0} of{" "}
					{pagination?.total || 0} transactions
				</p>
				<div className="flex items-center space-x-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange((pagination?.page || 1) - 1)}
						disabled={(pagination?.page || 1) <= 1}
						className="flex items-center"
					>
						<ChevronLeftIcon className="h-4 w-4 mr-1" />
						Previous
					</Button>
					<span className="text-sm text-gray-700">
						Page {pagination?.page || 1} of {pagination?.pages || 1}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={() => onPageChange((pagination?.page || 1) + 1)}
						disabled={(pagination?.page || 1) >= (pagination?.pages || 1)}
						className="flex items-center"
					>
						Next
						<ChevronRightIcon className="h-4 w-4 ml-1" />
					</Button>
				</div>
			</div>
		</>
	);
};

export default TransactionList;

