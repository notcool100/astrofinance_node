import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
	ArrowLeftIcon,
	LockClosedIcon,
	CheckCircleIcon,
	PlusIcon,
	TrashIcon,
	PrinterIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import MainLayout from "../../../../components/layout/MainLayout";
import ProtectedRoute from "../../../../components/common/ProtectedRoute";
import Button from "../../../../components/common/Button";
import Badge from "../../../../components/common/Badge";
import dayBookService, {
	DayBook,
	DayBookSummary,
	DayBookTransaction,
	CreateTransactionData,
	DayBookTransactionType,
	PaymentMethod,
} from "../../../../services/day-book.service";
import { DayBookDenomination } from "../../../../components/accounting/DayBookDenomination";
import DayBookPrint from "../../../../components/accounting/DayBookPrint";

const DayBookDetailPage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;

	const [dayBook, setDayBook] = useState<DayBook | null>(null);
	const [summary, setSummary] = useState<DayBookSummary | null>(null);
	const [loading, setLoading] = useState(true);
	const [reconcileModalOpen, setReconcileModalOpen] = useState(false);
	const [printOpen, setPrintOpen] = useState(false);
	const [reconcileData, setReconcileData] = useState<{
		physicalCashBalance: string;
		discrepancyNotes: string;
		denominations: Record<string, number>;
	}>({
		physicalCashBalance: "",
		discrepancyNotes: "",
		denominations: {},
	});
	const [reconcileErrors, setReconcileErrors] = useState<
		Record<string, string>
	>({});

	useEffect(() => {
		if (router.isReady && id && typeof id === "string") {
			fetchDayBookDetails(id);
			fetchDayBookSummary(id);
		}
	}, [router.isReady, id]);

	const fetchDayBookDetails = async (bookId: string) => {
		setLoading(true);
		try {
			const data = await dayBookService.getDayBookById(bookId);
			setDayBook(data);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to fetch day book details",
			);
			router.push("/accounting/day-books");
		} finally {
			setLoading(false);
		}
	};

	const fetchDayBookSummary = async (bookId: string) => {
		try {
			const data = await dayBookService.getDayBookSummary(bookId);
			setSummary(data);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to fetch day book summary",
			);
		}
	};

	const handleCloseDayBook = async () => {
		if (!dayBook) return;

		if (
			window.confirm(
				"Are you sure you want to close this day book? This action cannot be undone.",
			)
		) {
			try {
				await dayBookService.closeDayBook(dayBook.id);
				toast.success("Day book closed successfully");
				fetchDayBookDetails(dayBook.id);
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to close day book",
				);
			}
		}
	};

	const handleReconcileClick = () => {
		if (!dayBook) return;

		setReconcileData({
			physicalCashBalance: "",
			discrepancyNotes: "",
			denominations: {},
		});
		setReconcileErrors({});
		setReconcileModalOpen(true);
	};

	const handleReconcileChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
	) => {
		const { name, value } = e.target;

		setReconcileData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when field is edited
		if (reconcileErrors[name]) {
			setReconcileErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const handleTotalChange = (total: number, denominations: Record<string, number>) => {
		setReconcileData(prev => ({
			...prev,
			physicalCashBalance: total.toString(),
			denominations
		}));

		// Clear error if exists
		if (reconcileErrors.physicalCashBalance) {
			setReconcileErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors.physicalCashBalance;
				return newErrors;
			});
		}
	};

	const validateReconcileForm = () => {
		const newErrors: Record<string, string> = {};

		if (!reconcileData.physicalCashBalance) {
			newErrors.physicalCashBalance = "Physical cash balance is required";
		} else if (
			isNaN(parseFloat(reconcileData.physicalCashBalance)) ||
			parseFloat(reconcileData.physicalCashBalance) < 0
		) {
			newErrors.physicalCashBalance =
				"Physical cash balance must be a positive number";
		}

		setReconcileErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleReconcileSubmit = async () => {
		if (!dayBook) return;

		if (!validateReconcileForm()) {
			toast.error("Please fix the errors in the form");
			return;
		}

		try {
			await dayBookService.reconcileDayBook(dayBook.id, {
				physicalCashBalance: parseFloat(reconcileData.physicalCashBalance),
				discrepancyNotes: reconcileData.discrepancyNotes || undefined,
				denominations: reconcileData.denominations,
			});

			toast.success("Day book reconciled successfully");
			setReconcileModalOpen(false);
			fetchDayBookDetails(dayBook.id);
			fetchDayBookSummary(dayBook.id);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to reconcile day book",
			);
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatCurrency = (amount: number) => {
		const formattedNumber = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
		return `Rs ${formattedNumber}`;
	};

	const getStatusBadges = (dayBook: DayBook) => {
		return (
			<div className="flex flex-col space-y-1">
				{dayBook.isReconciled ? (
					<Badge color="green" text="Reconciled" />
				) : (
					<Badge color="yellow" text="Not Reconciled" />
				)}
				{dayBook.isClosed ? (
					<Badge color="gray" text="Closed" />
				) : (
					<Badge color="blue" text="Open" />
				)}
			</div>
		);
	};

	if (loading) {
		return (
			<ProtectedRoute>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center">Loading day book details...</div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	if (!dayBook) {
		return (
			<ProtectedRoute>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center">Day book not found</div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex justify-between items-center mb-6">
						<div className="flex items-center">
							<Button
								variant="secondary"
								className="mr-4"
								onClick={() => router.push("/accounting/day-books")}
							>
								<ArrowLeftIcon className="h-5 w-5 mr-1" />
								Back to Day Books
							</Button>
							<h1 className="text-2xl font-semibold text-gray-900">
								Day Book: {formatDate(dayBook.transactionDate)}
							</h1>
						</div>
						<div className="flex space-x-2">
							<Button
								variant="secondary"
								className="flex items-center"
								onClick={() => setPrintOpen(true)}
							>
								<PrinterIcon className="h-5 w-5 mr-1" />
								Print
							</Button>

							{!dayBook.isReconciled && !dayBook.isClosed && (
								<Button
									variant="primary"
									className="flex items-center"
									onClick={handleReconcileClick}
								>
									<CheckCircleIcon className="h-5 w-5 mr-1" />
									Reconcile
								</Button>
							)}

							{dayBook.isReconciled && !dayBook.isClosed && (
								<Button
									variant="secondary"
									className="flex items-center"
									onClick={handleCloseDayBook}
								>
									<LockClosedIcon className="h-5 w-5 mr-1" />
									Close Day Book
								</Button>
							)}
						</div>
					</div>

					<div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
						<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Day Book Details
							</h3>
							<p className="mt-1 max-w-2xl text-sm text-gray-500">
								Transaction date: {formatDate(dayBook.transactionDate)}
							</p>
						</div>
						<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
							<dl className="sm:divide-y sm:divide-gray-200">
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">Status</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{getStatusBadges(dayBook)}
									</dd>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										System Cash Balance
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{formatCurrency(dayBook.systemCashBalance)}
									</dd>
								</div>
								{dayBook.isReconciled && (
									<>
										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Physical Cash Balance
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{formatCurrency(dayBook.physicalCashBalance || 0)}
											</dd>
										</div>
										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Discrepancy
											</dt>
											<dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
												{dayBook.discrepancyAmount !== null &&
													dayBook.discrepancyAmount !== undefined ? (
													<span
														className={
															dayBook.discrepancyAmount < 0
																? "text-red-600"
																: "text-green-600"
														}
													>
														{formatCurrency(dayBook.discrepancyAmount)}
													</span>
												) : (
													"N/A"
												)}
											</dd>
										</div>
										{dayBook.discrepancyNotes && (
											<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
												<dt className="text-sm font-medium text-gray-500">
													Discrepancy Notes
												</dt>
												<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
													{dayBook.discrepancyNotes}
												</dd>
											</div>
										)}
									</>
								)}
								{dayBook.isClosed && (
									<>
										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Closed By
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{dayBook.closedBy?.fullName || "N/A"}
											</dd>
										</div>
										<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
											<dt className="text-sm font-medium text-gray-500">
												Closed At
											</dt>
											<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
												{dayBook.closedAt
													? formatDate(dayBook.closedAt)
													: "N/A"}
											</dd>
										</div>
									</>
								)}
							</dl>
						</div>
					</div>

					{summary && (
						<div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
							<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									Day Book Summary
								</h3>
							</div>
							<div className="px-4 py-5 sm:p-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-sm font-medium text-gray-500">
											Total Entries
										</h4>
										<p className="mt-1 text-2xl font-semibold text-gray-900">
											{summary.summary.totalEntries}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-sm font-medium text-gray-500">
											Total Debits
										</h4>
										<p className="mt-1 text-2xl font-semibold text-gray-900">
											{formatCurrency(summary.summary.totalDebits)}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<h4 className="text-sm font-medium text-gray-500">
											Total Credits
										</h4>
										<p className="mt-1 text-2xl font-semibold text-gray-900">
											{formatCurrency(summary.summary.totalCredits)}
										</p>
									</div>
								</div>

								{Object.keys(summary.summary.accountTypeSummary).length > 0 && (
									<div className="mt-6">
										<h4 className="text-lg font-medium text-gray-900 mb-4">
											Account Type Summary
										</h4>
										<div className="overflow-x-auto">
											<table className="min-w-full divide-y divide-gray-200">
												<thead className="bg-gray-50">
													<tr>
														<th
															scope="col"
															className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
														>
															Account Type
														</th>
														<th
															scope="col"
															className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
														>
															Debits
														</th>
														<th
															scope="col"
															className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
														>
															Credits
														</th>
														<th
															scope="col"
															className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
														>
															Net
														</th>
													</tr>
												</thead>
												<tbody className="bg-white divide-y divide-gray-200">
													{Object.entries(
														summary.summary.accountTypeSummary,
													).map(([type, values]) => (
														<tr key={type}>
															<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
																{type}
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
																{formatCurrency(values.debits)}
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
																{formatCurrency(values.credits)}
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
																{formatCurrency(values.debits - values.credits)}
															</td>
														</tr>
													))}
												</tbody>
											</table>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{summary && summary.journalEntries.length > 0 && (
						<div className="bg-white shadow overflow-hidden sm:rounded-lg">
							<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									Journal Entries
								</h3>
							</div>
							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Entry Number
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
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{summary.journalEntries.map((entry) => {
											// Calculate total amount
											const totalAmount = entry.journalEntryLines.reduce(
												(sum, line) =>
													sum +
													(parseFloat(line.debitAmount.toString()) > 0
														? parseFloat(line.debitAmount.toString())
														: 0),
												0,
											);

											return (
												<tr key={entry.id}>
													<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
														<Link
															href={`/accounting/journal-entries/${entry.id}`}
															className="text-indigo-600 hover:text-indigo-900"
														>
															{entry.entryNumber}
														</Link>
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{formatDate(entry.entryDate)}
													</td>
													<td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
														{entry.narration}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
														{formatCurrency(totalAmount)}
													</td>
													<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
														{entry.status}
													</td>
												</tr>
											);
										})}
									</tbody>
								</table>
							</div>
						</div>
					)}

					{/* Reconcile Modal */}
					{reconcileModalOpen && (
						<div className="fixed inset-0 overflow-y-auto z-50">
							<div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
								<div
									className="fixed inset-0 transition-opacity"
									aria-hidden="true"
								>
									<div className="absolute inset-0 bg-gray-500 opacity-75"></div>
								</div>

								<span
									className="hidden sm:inline-block sm:align-middle sm:h-screen"
									aria-hidden="true"
								>
									&#8203;
								</span>

								<div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
									<div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
										<div className="sm:flex sm:items-start">
											<div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
												<h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
													Reconcile Day Book
												</h3>

												<div className="mb-4">
													<DayBookDenomination
														onTotalChange={handleTotalChange}
														initialDenominations={reconcileData.denominations}
													/>
													{reconcileErrors.physicalCashBalance && (
														<p className="mt-1 text-sm text-red-600">
															{reconcileErrors.physicalCashBalance}
														</p>
													)}
												</div>

												<div>
													<label
														htmlFor="discrepancyNotes"
														className="block text-sm font-medium text-gray-700 mb-1"
													>
														Discrepancy Notes
													</label>
													<textarea
														id="discrepancyNotes"
														name="discrepancyNotes"
														rows={3}
														value={reconcileData.discrepancyNotes}
														onChange={handleReconcileChange}
														placeholder="Explain any discrepancies between system and physical cash balances"
														className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
													/>
												</div>

												<div className="mt-4 p-4 bg-yellow-50 rounded-md">
													<div className="flex">
														<div className="flex-shrink-0">
															<svg
																className="h-5 w-5 text-yellow-400"
																xmlns="http://www.w3.org/2000/svg"
																viewBox="0 0 20 20"
																fill="currentColor"
																aria-hidden="true"
															>
																<path
																	fillRule="evenodd"
																	d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
																	clipRule="evenodd"
																/>
															</svg>
														</div>
														<div className="ml-3">
															<h3 className="text-sm font-medium text-yellow-800">
																Important Note
															</h3>
															<div className="mt-2 text-sm text-yellow-700">
																<p>
																	System cash balance:{" "}
																	{formatCurrency(dayBook.systemCashBalance)}.
																	Any difference between physical and system
																	cash will be recorded as a discrepancy.
																</p>
															</div>
														</div>
													</div>
												</div>
											</div>
										</div>
									</div>
									<div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
										<Button
											variant="primary"
											onClick={handleReconcileSubmit}
											className="w-full sm:w-auto sm:ml-3"
										>
											Reconcile
										</Button>
										<Button
											variant="secondary"
											onClick={() => setReconcileModalOpen(false)}
											className="mt-3 w-full sm:mt-0 sm:w-auto"
										>
											Cancel
										</Button>
									</div>
								</div>
							</div>
						</div>
					)}
					{printOpen && dayBook && summary && (
						<DayBookPrint
							dayBook={dayBook}
							summary={summary}
							onClose={() => setPrintOpen(false)}
						/>
					)}
				</div>
			</MainLayout>
		</ProtectedRoute >
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

export default DayBookDetailPage;
