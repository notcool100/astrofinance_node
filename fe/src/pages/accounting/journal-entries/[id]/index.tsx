import {
	ArrowLeftIcon,
	CheckIcon,
	TrashIcon,
	XMarkIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useRouter } from "next/router";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Badge from "../../../../components/common/Badge";
import Button from "../../../../components/common/Button";
import ProtectedRoute from "../../../../components/common/ProtectedRoute";
import MainLayout from "../../../../components/layout/MainLayout";
import journalEntryService, {
	type JournalEntry,
	type JournalEntryStatus,
} from "../../../../services/journal-entry.service";

const JournalEntryDetailPage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;

	const [journalEntry, setJournalEntry] = useState<JournalEntry | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		if (router.isReady && id && typeof id === "string") {
			fetchJournalEntryDetails(id);
		}
	}, [router.isReady, id]);

	const fetchJournalEntryDetails = async (entryId: string) => {
		setLoading(true);
		try {
			const data = await journalEntryService.getJournalEntryById(entryId);
			setJournalEntry(data);
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to fetch journal entry details",
			);
			router.push("/accounting/journal-entries");
		} finally {
			setLoading(false);
		}
	};

	const handleApproveJournalEntry = async () => {
		if (!journalEntry) return;

		if (window.confirm("Are you sure you want to post this journal entry?")) {
			try {
				const updatedEntry = await journalEntryService.updateJournalEntryStatus(
					journalEntry.id,
					"POSTED",
				);
				setJournalEntry(updatedEntry);
				toast.success("Journal entry posted successfully");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to post journal entry",
				);
			}
		}
	};

	const handleRejectJournalEntry = async () => {
		if (!journalEntry) return;

		const reason = window.prompt(
			"Please provide a reason for rejecting this journal entry:",
		);
		if (reason) {
			try {
				const updatedEntry = await journalEntryService.updateJournalEntryStatus(
					journalEntry.id,
					"REVERSED",
					reason,
				);
				setJournalEntry(updatedEntry);
				toast.success("Journal entry rejected successfully");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to reject journal entry",
				);
			}
		}
	};

	const handleDeleteJournalEntry = async () => {
		if (!journalEntry) return;

		if (window.confirm("Are you sure you want to delete this journal entry?")) {
			try {
				await journalEntryService.deleteJournalEntry(journalEntry.id);
				toast.success("Journal entry deleted successfully");
				router.push("/accounting/journal-entries");
			} catch (error) {
				toast.error(
					error instanceof Error
						? error.message
						: "Failed to delete journal entry",
				);
			}
		}
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
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const formatAmount = (amount: number) => {
		const formattedNumber = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
		return `Rs ${formattedNumber}`;
	};
	const calculateTotalDebit = () => {
		if (!journalEntry) return 0;
		return journalEntry.journalEntryLines.reduce(
			(total, line) => total + Number(line.debitAmount || 0),
			0,
		);
	};

	const calculateTotalCredit = () => {
		if (!journalEntry) return 0;
		return journalEntry.journalEntryLines.reduce(
			(total, line) => total + Number(line.creditAmount || 0),
			0,
		);
	};
	if (loading) {
		return (
			<ProtectedRoute>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center">Loading journal entry details...</div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	if (!journalEntry) {
		return (
			<ProtectedRoute>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center">Journal entry not found</div>
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
								onClick={() => router.push("/accounting/journal-entries")}
							>
								<ArrowLeftIcon className="h-5 w-5 mr-1" />
								Back to Journal Entries
							</Button>
							<h1 className="text-2xl font-semibold text-gray-900">
								Journal Entry: {journalEntry.entryNumber}
							</h1>
						</div>
						<div className="flex space-x-2">
							{journalEntry.status === "DRAFT" && (
								<>
									<Button
										variant="success"
										className="flex items-center"
										onClick={handleApproveJournalEntry}
									>
										<CheckIcon className="h-5 w-5 mr-1" />
										Post Entry
									</Button>
									<Button
										variant="danger"
										className="flex items-center"
										onClick={handleRejectJournalEntry}
									>
										<XMarkIcon className="h-5 w-5 mr-1" />
										Reverse Entry
									</Button>
									<Button
										variant="danger"
										className="flex items-center"
										onClick={handleDeleteJournalEntry}
									>
										<TrashIcon className="h-5 w-5 mr-1" />
										Delete
									</Button>
								</>
							)}
						</div>
					</div>

					<div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
						<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Journal Entry Details
							</h3>
							<p className="mt-1 max-w-2xl text-sm text-gray-500">
								{journalEntry.narration}
							</p>
						</div>
						<div className="border-t border-gray-200 px-4 py-5 sm:p-0">
							<dl className="sm:divide-y sm:divide-gray-200">
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Entry Number
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{journalEntry.entryNumber}
									</dd>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Entry Date
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{formatDate(journalEntry.entryDate)}
									</dd>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">Status</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{getStatusBadge(journalEntry.status)}
									</dd>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Reference
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{journalEntry.reference || "N/A"}
									</dd>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Created By
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{journalEntry.createdBy?.fullName || "N/A"}
									</dd>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Approved By
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{journalEntry.approvedBy?.fullName || "N/A"}
									</dd>
								</div>
								<div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
									<dt className="text-sm font-medium text-gray-500">
										Created At
									</dt>
									<dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
										{formatDate(journalEntry.createdAt)}
									</dd>
								</div>
							</dl>
						</div>
					</div>

					<div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
						<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
							<h3 className="text-lg leading-6 font-medium text-gray-900">
								Journal Entry Lines
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
											Account
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
											Debit
										</th>
										<th
											scope="col"
											className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
										>
											Credit
										</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{journalEntry.journalEntryLines.map((line) => (
										<tr key={line.id}>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
												{line.account ? (
													<Link
														href={`/accounting/chart-of-accounts/${line.account.id}`}
														className="text-indigo-600 hover:text-indigo-900"
													>
														{line.account.accountCode} - {line.account.name}
													</Link>
												) : (
													`Account ID: ${line.accountId}`
												)}
											</td>
											<td className="px-6 py-4 text-sm text-gray-500">
												{line.description || "No description"}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
												{line.debitAmount > 0
													? formatAmount(line.debitAmount)
													: ""}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
												{line.creditAmount > 0
													? formatAmount(line.creditAmount)
													: ""}
											</td>
										</tr>
									))}
									<tr className="bg-gray-50 font-semibold">
										<td
											colSpan={2}
											className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right"
										>
											Total
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
											{formatAmount(calculateTotalDebit())}
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
											{formatAmount(calculateTotalCredit())}
										</td>
									</tr>
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default JournalEntryDetailPage;

