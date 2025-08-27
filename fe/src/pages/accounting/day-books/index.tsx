import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
	PlusIcon,
	EyeIcon,
	LockClosedIcon,
	CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import MainLayout from "../../../components/layout/MainLayout";
import ProtectedRoute from "../../../components/common/ProtectedRoute";
import Button from "../../../components/common/Button";
import Badge from "../../../components/common/Badge";
import Pagination from "../../../components/common/Pagination";
import dayBookService, { DayBook } from "../../../services/day-book.service";

const DayBooksPage: React.FC = () => {
	const router = useRouter();
	const [dayBooks, setDayBooks] = useState<DayBook[]>([]);
	const [loading, setLoading] = useState(true);
	const [pagination, setPagination] = useState({
		total: 0,
		page: 1,
		limit: 10,
		pages: 0,
	});
	const [filters, setFilters] = useState({
		startDate: "",
		endDate: "",
		isReconciled: "",
		isClosed: "",
	});

	useEffect(() => {
		fetchDayBooks();
	}, [pagination.page, filters]);

	const fetchDayBooks = async () => {
		setLoading(true);
		try {
			const { data, pagination: paginationData } =
				await dayBookService.getAllDayBooks({
					page: pagination.page,
					limit: pagination.limit,
					startDate: filters.startDate || undefined,
					endDate: filters.endDate || undefined,
					isReconciled: filters.isReconciled
						? filters.isReconciled === "true"
						: undefined,
					isClosed: filters.isClosed ? filters.isClosed === "true" : undefined,
				});

			setDayBooks(data);
			setPagination(paginationData);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to fetch day books",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateDayBook = () => {
		router.push("/accounting/day-books/create");
	};

	const handleViewDayBook = (id: string) => {
		router.push(`/accounting/day-books/${id}`);
	};

	const handleCloseDayBook = async (id: string) => {
		if (
			window.confirm(
				"Are you sure you want to close this day book? This action cannot be undone.",
			)
		) {
			try {
				await dayBookService.closeDayBook(id);
				toast.success("Day book closed successfully");
				fetchDayBooks();
			} catch (error) {
				toast.error(
					error instanceof Error ? error.message : "Failed to close day book",
				);
			}
		}
	};

	const handleFilterChange = (
		e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
	) => {
		const { name, value } = e.target;
		setFilters((prev) => ({
			...prev,
			[name]: value,
		}));
	};

	const resetFilters = () => {
		setFilters({
			startDate: "",
			endDate: "",
			isReconciled: "",
			isClosed: "",
		});
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }));
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

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const formatCurrency = (amount: number) => {
		const formattedNumber = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
		return `Rs ${formattedNumber}`;
	};

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-gray-900">Day Books</h1>
						<Button
							variant="primary"
							className="flex items-center"
							onClick={handleCreateDayBook}
						>
							<PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
							New Day Book
						</Button>
					</div>

					<div className="bg-white shadow rounded-lg mb-6">
						<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Filters
							</h3>
						</div>
						<div className="px-4 py-5 sm:p-6">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
										className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
									/>
								</div>
								<div>
									<label
										htmlFor="isReconciled"
										className="block text-sm font-medium text-gray-700"
									>
										Reconciliation Status
									</label>
									<select
										id="isReconciled"
										name="isReconciled"
										value={filters.isReconciled}
										onChange={handleFilterChange}
										className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
									>
										<option value="">All</option>
										<option value="true">Reconciled</option>
										<option value="false">Not Reconciled</option>
									</select>
								</div>
								<div>
									<label
										htmlFor="isClosed"
										className="block text-sm font-medium text-gray-700"
									>
										Closing Status
									</label>
									<select
										id="isClosed"
										name="isClosed"
										value={filters.isClosed}
										onChange={handleFilterChange}
										className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
									>
										<option value="">All</option>
										<option value="true">Closed</option>
										<option value="false">Open</option>
									</select>
								</div>
							</div>
							<div className="mt-4 flex justify-end">
								<Button
									variant="secondary"
									onClick={resetFilters}
									className="mr-2"
								>
									Reset
								</Button>
								<Button
									variant="primary"
									onClick={() =>
										setPagination((prev) => ({ ...prev, page: 1 }))
									}
								>
									Apply Filters
								</Button>
							</div>
						</div>
					</div>

					<div className="bg-white shadow rounded-lg overflow-hidden">
						<div className="overflow-x-auto">
							{loading ? (
								<div className="px-6 py-4 text-center text-gray-500">
									Loading day books...
								</div>
							) : dayBooks.length === 0 ? (
								<div className="px-6 py-4 text-center text-gray-500">
									No day books found
								</div>
							) : (
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Book Number
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
												Opening Balance
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Closing Balance
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Transactions
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
										{dayBooks.map((dayBook) => (
											<tr key={dayBook.id}>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{dayBook.bookNumber}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatDate(dayBook.transactionDate)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatCurrency(dayBook.openingBalance)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatCurrency(dayBook.closingBalance)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													<div className="flex items-center space-x-2">
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
															{dayBook._count?.transactions || 0} transactions
														</span>
														<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
															{dayBook._count?.journalEntries || 0} journal
															entries
														</span>
													</div>
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{getStatusBadges(dayBook)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<div className="flex justify-end space-x-2">
														<button
															onClick={() => handleViewDayBook(dayBook.id)}
															className="text-indigo-600 hover:text-indigo-900"
															title="View"
														>
															<EyeIcon className="h-5 w-5" />
														</button>

														{!dayBook.isClosed && dayBook.isReconciled && (
															<button
																onClick={() => handleCloseDayBook(dayBook.id)}
																className="text-gray-600 hover:text-gray-900"
																title="Close Day Book"
															>
																<LockClosedIcon className="h-5 w-5" />
															</button>
														)}

														{!dayBook.isReconciled && !dayBook.isClosed && (
															<button
																onClick={() => handleViewDayBook(dayBook.id)}
																className="text-green-600 hover:text-green-900"
																title="Reconcile"
															>
																<CheckCircleIcon className="h-5 w-5" />
															</button>
														)}
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							)}
						</div>

						{pagination.total > 0 && (
							<div className="px-4 py-3 border-t border-gray-200 sm:px-6">
								<Pagination
									currentPage={pagination.page}
									totalPages={pagination.pages}
									onPageChange={handlePageChange}
								/>
							</div>
						)}
					</div>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default DayBooksPage;
