import React, { useState } from "react";
import { useRouter } from "next/router";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import MainLayout from "../../../components/layout/MainLayout";
import ProtectedRoute from "../../../components/common/ProtectedRoute";
import Button from "../../../components/common/Button";
import dayBookService from "../../../services/day-book.service";

const CreateDayBookPage: React.FC = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		transactionDate: new Date().toISOString().split("T")[0],
		openingBalance: "",
	});
	const [errors, setErrors] = useState<Record<string, string>>({});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;

		setFormData((prev) => ({
			...prev,
			[name]: value,
		}));

		// Clear error when field is edited
		if (errors[name]) {
			setErrors((prev) => {
				const newErrors = { ...prev };
				delete newErrors[name];
				return newErrors;
			});
		}
	};

	const validateForm = () => {
		const newErrors: Record<string, string> = {};

		if (!formData.transactionDate) {
			newErrors.transactionDate = "Transaction date is required";
		}

		if (
			formData.openingBalance &&
			(isNaN(parseFloat(formData.openingBalance)) ||
				parseFloat(formData.openingBalance) < 0)
		) {
			newErrors.openingBalance = "Opening balance must be a positive number";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) {
			toast.error("Please fix the errors in the form");
			return;
		}

		setLoading(true);
		try {
			// Only send openingBalance if user explicitly entered one
			// Otherwise, backend will auto-carry from previous closed daybook
			const createData: { transactionDate: string; openingBalance?: number } = {
				transactionDate: formData.transactionDate,
			};

			if (formData.openingBalance && formData.openingBalance.trim() !== "") {
				createData.openingBalance = parseFloat(formData.openingBalance);
			}

			await dayBookService.createDayBook(createData);

			toast.success("Day book created successfully");
			router.push("/accounting/day-books");
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to create day book",
			);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		router.push("/accounting/day-books");
	};

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="flex items-center mb-6">
						<Button
							variant="secondary"
							className="mr-4"
							onClick={() => router.push("/accounting/day-books")}
						>
							<ArrowLeftIcon className="h-5 w-5 mr-1" />
							Back to Day Books
						</Button>
						<h1 className="text-2xl font-semibold text-gray-900">
							Create Day Book
						</h1>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div className="bg-white shadow rounded-lg overflow-hidden">
							<div className="px-4 py-5 sm:px-6 border-b border-gray-200">
								<h3 className="text-lg leading-6 font-medium text-gray-900">
									Day Book Details
								</h3>
							</div>
							<div className="px-4 py-5 sm:p-6">
								<div className="grid grid-cols-1 gap-6">
									<div>
										<label
											htmlFor="transactionDate"
											className="block text-sm font-medium text-gray-700"
										>
											Transaction Date *
										</label>
										<input
											type="date"
											name="transactionDate"
											id="transactionDate"
											value={formData.transactionDate}
											onChange={handleChange}
											className={`mt-1 block w-full border ${errors.transactionDate
													? "border-red-300"
													: "border-gray-300"
												} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
										/>
										{errors.transactionDate && (
											<p className="mt-1 text-sm text-red-600">
												{errors.transactionDate}
											</p>
										)}
									</div>
									<div>
										<label
											htmlFor="openingBalance"
											className="block text-sm font-medium text-gray-700"
										>
											Opening Balance
										</label>
										<div className="mt-1 relative rounded-md shadow-sm">
											<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
												<span className="text-gray-500 sm:text-sm">Rs</span>
											</div>
											<input
												type="number"
												name="openingBalance"
												id="openingBalance"
												step="0.01"
												min="0"
												value={formData.openingBalance}
												onChange={handleChange}
												placeholder="0.00"
												className={`block w-full pl-8 pr-12 border ${errors.openingBalance
														? "border-red-300"
														: "border-gray-300"
													} rounded-md py-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
											/>
											<div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
												<span className="text-gray-500 sm:text-sm">USD</span>
											</div>
										</div>
										{errors.openingBalance && (
											<p className="mt-1 text-sm text-red-600">
												{errors.openingBalance}
											</p>
										)}
										<p className="mt-1 text-sm text-gray-500">
											Enter the opening cash balance for this day (optional,
											defaults to 0).
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className="flex justify-end space-x-3">
							<Button
								type="button"
								variant="secondary"
								onClick={handleCancel}
								disabled={loading}
							>
								Cancel
							</Button>
							<Button type="submit" variant="primary" disabled={loading}>
								{loading ? "Creating..." : "Create Day Book"}
							</Button>
						</div>
					</form>
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

export default CreateDayBookPage;
