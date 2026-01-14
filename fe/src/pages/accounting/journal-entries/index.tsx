import {
	CheckIcon,
	EyeIcon,
	PlusIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Badge from "../../../components/common/Badge";
import Button from "../../../components/common/Button";
import Pagination from "../../../components/common/Pagination";
import ProtectedRoute from "../../../components/common/ProtectedRoute";
import MainLayout from "../../../components/layout/MainLayout";
import journalEntryService, {
	type JournalEntry,
	type JournalEntryStatus,
} from "../../../services/journal-entry.service";

const JournalEntriesPage: React.FC = () => {
	const router = useRouter();
	const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
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
		status: "",
	});

	useEffect(() => {
		fetchJournalEntries();
	}, [pagination.page, filters]);

	const fetchJournalEntries = async () => {
		setLoading(true);
		try {
			const { data, pagination: paginationData } =
				await journalEntryService.getAllJournalEntries({
					page: pagination.page,
					limit: pagination.limit,
					startDate: filters.startDate || undefined,
					endDate: filters.endDate || undefined,
					status: (filters.status as JournalEntryStatus) || undefined,
				});

			setJournalEntries(data);
			setPagination(paginationData);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to fetch journal entries",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateJournalEntry = () => {
		router.push("/accounting/journal-entries/create");
	};

	const handleViewJournalEntry = (id: string) => {
		router.push(`/accounting/journal-entries/${id}`);
	};

	const handleDeleteJournalEntry = async (id: string) => {
		if (window.confirm("Are you sure you want to delete this journal entry?")) {
			try {
				await journalEntryService.deleteJournalEntry(id);
				toast.success("Journal entry deleted successfully");
				fetchJournalEntries();
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to delete journal entry",
				);
			}
		}
	};

	const handleApproveJournalEntry = async (id: string) => {
		if (window.confirm("Are you sure you want to post this journal entry?")) {
			try {
				await journalEntryService.updateJournalEntryStatus(id, "POSTED");
				toast.success("Journal entry posted successfully");
				fetchJournalEntries();
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to post journal entry",
				);
			}
		}
	};

	const handleRejectJournalEntry = async (id: string) => {
		const reason = window.prompt(
			"Please provide a reason for rejecting this journal entry:",
		);
		if (reason) {
			try {
				await journalEntryService.updateJournalEntryStatus(
					id,
					"REVERSED",
					reason,
				);
				toast.success("Journal entry rejected successfully");
				fetchJournalEntries();
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to reject journal entry",
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
			status: "",
		});
		setPagination((prev) => ({ ...prev, page: 1 }));
	};

	const handlePageChange = (page: number) => {
		setPagination((prev) => ({ ...prev, page }));
	};

	const getStatusBadge = (status: JournalEntryStatus) => {
		switch (status) {
			case "DRAFT":
				return <Badge color="yellow" text="Draft" />;
			case "POSTED":
				return <Badge color="green" text="Posted" />;
			case "REVERSED":
				return <Badge color="red" text="Reversed" />;
			default:
				return <Badge color="gray" text={status} />;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const formatAmount = (amount: number) => {
		const formattedNumber = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
		return `Rs ${formattedNumber}`;
	};

	const calculateTotalAmount = (journalEntry: JournalEntry) => {
		return journalEntry.journalEntryLines.reduce((total, line) => {
			const debit = Number(line.debitAmount) || 0;
			return total + debit;
		}, 0);
	};

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex justify-between items-center mb-6">
						<h1 className="text-2xl font-semibold text-gray-900">
							Journal Entries
						</h1>
						<Button
							variant="primary"
							className="flex items-center"
							onClick={handleCreateJournalEntry}
						>
							<PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
							New Journal Entry
						</Button>
					</div>

					<div className="bg-white shadow rounded-lg mb-6">
						<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Filters
							</h3>
						</div>
						<div className="px-4 py-5 sm:p-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
										htmlFor="status"
										className="block text-sm font-medium text-gray-700"
									>
										Status
									</label>
									<select
										id="status"
										name="status"
										value={filters.status}
										onChange={handleFilterChange}
										className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
									>
										<option value="">All Statuses</option>
										<option value="DRAFT">Draft</option>
										<option value="POSTED">Posted</option>
										<option value="REVERSED">Reversed</option>
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
									Loading journal entries...
								</div>
							) : journalEntries.length === 0 ? (
								<div className="px-6 py-4 text-center text-gray-500">
									No journal entries found
								</div>
							) : (
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
												Created By
											</th>
											<th scope="col" className="relative px-6 py-3">
												<span className="sr-only">Actions</span>
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{journalEntries.map((entry) => (
											<tr key={entry.id}>
												<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
													{entry.entryNumber}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatDate(entry.entryDate)}
												</td>
												<td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
													{entry.narration}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatAmount(calculateTotalAmount(entry))}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{getStatusBadge(entry.status)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{entry.createdBy?.fullName || "N/A"}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
													<div className="flex justify-end space-x-2">
														<button
															onClick={() => handleViewJournalEntry(entry.id)}
															className="text-indigo-600 hover:text-indigo-900"
															title="View"
														>
															<EyeIcon className="h-5 w-5" />
														</button>

														{entry.status === "DRAFT" && (
															<>
																<button
																	onClick={() =>
																		handleApproveJournalEntry(entry.id)
																	}
																	className="text-green-600 hover:text-green-900"
																	title="Post"
																>
																	<CheckIcon className="h-5 w-5" />
																</button>
																<button
																	onClick={() =>
																		handleRejectJournalEntry(entry.id)
																	}
																	className="text-red-600 hover:text-red-900"
																	title="Reverse"
																>
																	<XMarkIcon className="h-5 w-5" />
																</button>
																<button
																	onClick={() =>
																		handleDeleteJournalEntry(entry.id)
																	}
																	className="text-red-600 hover:text-red-900"
																	title="Delete"
																>
																	<TrashIcon className="h-5 w-5" />
																</button>
															</>
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




export async function getServerSideProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await import('next-i18next/serverSideTranslations').then(m => 
        m.serverSideTranslations(locale, ['common', 'user', 'auth'])
      )),
    },
  };
}

export default JournalEntriesPage;
