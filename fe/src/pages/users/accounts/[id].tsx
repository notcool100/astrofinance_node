import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
	ArrowLeftIcon,
	PencilIcon,
	XCircleIcon,
} from "@heroicons/react/24/outline";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import AccountForm from "@/components/modules/users/AccountForm";
import { getAccountById, closeAccount, Account } from "@/services/user.service";
import { formatDate, formatCurrency } from "@/utils/dateUtils";
import { toast } from "react-toastify";

const AccountDetailPage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [account, setAccount] = useState<Account | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [showCloseModal, setShowCloseModal] = useState(false);
	const [closureReason, setClosureReason] = useState("");
	const [isClosing, setIsClosing] = useState(false);

	useEffect(() => {
		if (id && typeof id === "string") {
			fetchAccountDetails(id);
		}
	}, [id]);

	const fetchAccountDetails = async (accountId: string) => {
		try {
			setLoading(true);
			const data = await getAccountById(accountId);
			setAccount(data);
			setError(null);
		} catch (err) {
			console.error("Error fetching account details:", err);
			setError("Failed to load account details. Please try again later.");
			toast.error("Failed to load account details");
		} finally {
			setLoading(false);
		}
	};

	const handleCloseAccount = async () => {
		if (!account) return;

		try {
			setIsClosing(true);
			await closeAccount(account.id, closureReason);
			toast.success("Account closed successfully");
			setShowCloseModal(false);
			fetchAccountDetails(account.id);
		} catch (err) {
			console.error("Error closing account:", err);
			toast.error("Failed to close account");
		} finally {
			setIsClosing(false);
		}
	};

	const handleEditSuccess = () => {
		setIsEditing(false);
		if (id && typeof id === "string") {
			fetchAccountDetails(id);
		}
		toast.success("Account updated successfully");
	};

	if (loading) {
		return (
			<ProtectedRoute>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center py-10">
							<div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-primary-400 border-r-transparent"></div>
							<p className="mt-4 text-gray-700">Loading account details...</p>
						</div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	if (error || !account) {
		return (
			<ProtectedRoute>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="bg-red-50 p-4 rounded-md">
							<div className="flex">
								<div className="ml-3">
									<h3 className="text-sm font-medium text-red-800">Error</h3>
									<div className="mt-2 text-sm text-red-700">
										<p>{error || "Account not found"}</p>
									</div>
									<div className="mt-4">
										<Link href="/users/accounts">
											<Button variant="outline" className="flex items-center">
												<ArrowLeftIcon
													className="-ml-1 mr-2 h-5 w-5"
													aria-hidden="true"
												/>
												Back to Accounts
											</Button>
										</Link>
									</div>
								</div>
							</div>
						</div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	if (isEditing) {
		return (
			<ProtectedRoute>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="mb-6">
							<Button
								variant="outline"
								className="flex items-center"
								onClick={() => setIsEditing(false)}
							>
								<ArrowLeftIcon
									className="-ml-1 mr-2 h-5 w-5"
									aria-hidden="true"
								/>
								Cancel Editing
							</Button>
						</div>

						<h1 className="text-2xl font-semibold text-gray-900 mb-6">
							Edit Account
						</h1>

						<AccountForm
							account={account}
							isEdit={true}
							onSuccess={handleEditSuccess}
						/>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-6">
						<Link href="/users/accounts">
							<Button variant="outline" className="flex items-center">
								<ArrowLeftIcon
									className="-ml-1 mr-2 h-5 w-5"
									aria-hidden="true"
								/>
								Back to Accounts
							</Button>
						</Link>
					</div>

					<div className="bg-white shadow overflow-hidden sm:rounded-lg">
						<div className="px-4 py-5 sm:px-6 flex justify-between items-center">
							<div>
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									Account Information
								</h3>
								<p className="mt-1 max-w-2xl text-sm text-gray-500">
									Account details and status.
								</p>
							</div>
							<div className="flex space-x-2">
								<Link href={`/users/transaction?accountId=${account.id}`}>
									<Button variant="primary" className="flex items-center">
										View Transactions
									</Button>
								</Link>

								{account.status !== "CLOSED" && (
									<>
										<Button
											variant="outline"
											className="flex items-center"
											onClick={() => setIsEditing(true)}
										>
											<PencilIcon
												className="-ml-1 mr-2 h-5 w-5"
												aria-hidden="true"
											/>
											Edit
										</Button>
										<Button
											variant="outline"
											className="flex items-center text-red-600 hover:text-red-800 border-red-600 hover:border-red-800"
											onClick={() => setShowCloseModal(true)}
										>
											<XCircleIcon
												className="-ml-1 mr-2 h-5 w-5"
												aria-hidden="true"
											/>
											Close Account
										</Button>
									</>
								)}
							</div>
						</div>

						<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
							<dl className="sm:divide-y sm:divide-gray-200">
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Account Number
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{account.accountNumber}
									</dd>
								</div>

								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Account Type
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										<Badge
											color={
												account.accountType === "SB"
													? "blue"
													: account.accountType === "BB"
														? "indigo"
														: account.accountType === "FD"
															? "green"
															: account.accountType === "SH"
																? "purple"
																: account.accountType === "LS"
																	? "red"
																	: "gray"
											}
											text={
												account.accountType === "SB"
													? "Sadharan Bachat"
													: account.accountType === "BB"
														? "Branch Bises Bachat"
														: account.accountType === "FD"
															? "Fixed Deposit"
															: account.accountType === "SH"
																? "Share"
																: account.accountType === "LS"
																	? "Loan Share"
																	: account.accountType
											}
										/>
									</dd>
								</div>

								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">User</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{account.user ? (
											<Link href={`/users/${account.user.id}`}>
												<span className="text-primary-600 hover:text-primary-800 cursor-pointer">
													{account.user.fullName}
												</span>
											</Link>
										) : (
											"Unknown User"
										)}
									</dd>
								</div>

								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">Balance</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{formatCurrency(account.balance)}
									</dd>
								</div>

								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Interest Rate
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{account.interestRate}%
									</dd>
								</div>

								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Opening Date
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{formatDate(account.openingDate)}
									</dd>
								</div>

								{account.lastTransactionDate && (
									<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
										<dt className="text-sm font-medium text-gray-500">
											Last Transaction Date
										</dt>
										<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
											{formatDate(account.lastTransactionDate)}
										</dd>
									</div>
								)}

								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">Status</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										<Badge
											color={
												account.status === "ACTIVE"
													? "green"
													: account.status === "INACTIVE"
														? "yellow"
														: account.status === "CLOSED"
															? "gray"
															: "red"
											}
											text={account.status}
										/>
									</dd>
								</div>

								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Created At
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{formatDate(account.createdAt)}
									</dd>
								</div>

								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Last Updated
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{formatDate(account.updatedAt)}
									</dd>
								</div>
							</dl>
						</div>

						{/* BB Account Details */}
						{account.bbAccountDetails && (
							<div className="border-t border-gray-200">
								<div className="px-4 py-5 sm:px-6">
									<h3 className="text-lg leading-6 font-medium text-gray-900">
										Business Banking Details
									</h3>
								</div>
								<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
									<dl className="sm:divide-y sm:divide-gray-200">
										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Guardian Name
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{account.bbAccountDetails.guardianName}
											</dd>
										</div>

										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Guardian Relation
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{account.bbAccountDetails.guardianRelation}
											</dd>
										</div>

										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Guardian Contact
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{account.bbAccountDetails.guardianContact}
											</dd>
										</div>

										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Guardian ID Type
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{account.bbAccountDetails.guardianIdType}
											</dd>
										</div>

										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Guardian ID Number
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{account.bbAccountDetails.guardianIdNumber}
											</dd>
										</div>

										{account.bbAccountDetails.maturityDate && (
											<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
												<dt className="text-sm font-medium text-gray-500">
													Maturity Date
												</dt>
												<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
													{formatDate(account.bbAccountDetails.maturityDate)}
												</dd>
											</div>
										)}
									</dl>
								</div>
							</div>
						)}

						{/* MB Account Details */}
						{account.mbAccountDetails && (
							<div className="border-t border-gray-200">
								<div className="px-4 py-5 sm:px-6">
									<h3 className="text-lg leading-6 font-medium text-gray-900">
										Mobile Banking Details
									</h3>
								</div>
								<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
									<dl className="sm:divide-y sm:divide-gray-200">
										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Monthly Deposit Amount
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{formatCurrency(
													account.mbAccountDetails.monthlyDepositAmount,
												)}
											</dd>
										</div>

										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Deposit Day
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{account.mbAccountDetails.depositDay}
											</dd>
										</div>

										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Term (Months)
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{account.mbAccountDetails.termMonths}
											</dd>
										</div>

										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Missed Deposits
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{account.mbAccountDetails.missedDeposits}
											</dd>
										</div>

										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Maturity Date
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{formatDate(account.mbAccountDetails.maturityDate)}
											</dd>
										</div>
									</dl>
								</div>
							</div>
						)}
					</div>

					{/* Close Account Modal */}
					<Modal
						isOpen={showCloseModal}
						onClose={() => setShowCloseModal(false)}
						title="Close Account"
					>
						<div className="p-6">
							<div className="mb-4">
								<p className="text-sm text-gray-500">
									Are you sure you want to close this account? This action
									cannot be undone.
								</p>
							</div>

							<div className="mb-4">
								<label
									htmlFor="closureReason"
									className="block text-sm font-medium text-gray-700"
								>
									Reason for Closure
								</label>
								<textarea
									id="closureReason"
									name="closureReason"
									rows={3}
									value={closureReason}
									onChange={(e) => setClosureReason(e.target.value)}
									className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
									placeholder="Please provide a reason for closing this account"
								/>
							</div>

							<div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
								<Button
									type="button"
									variant="outline"
									onClick={() => setShowCloseModal(false)}
									disabled={isClosing}
									className="mt-3 sm:mt-0 sm:col-start-1"
								>
									Cancel
								</Button>
								<Button
									type="button"
									onClick={handleCloseAccount}
									disabled={isClosing}
									className="sm:col-start-2"
								>
									{isClosing ? "Closing..." : "Close Account"}
								</Button>
							</div>
						</div>
					</Modal>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default AccountDetailPage;
