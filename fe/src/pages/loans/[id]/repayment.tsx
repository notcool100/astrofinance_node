import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import loanService, {
	Loan,
	LoanSchedule,
	LoanPayment,
} from "@/services/loanService";
import {
	ArrowLeftIcon,
	CreditCardIcon,
	BanknotesIcon,
	CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const paymentSchema = yup.object().shape({
	amount: yup
		.number()
		.required("Amount is required")
		.positive("Amount must be positive"),
	paymentDate: yup.string().required("Payment date is required"),
	paymentMethod: yup
		.string()
		.required("Payment method is required")
		.oneOf(
			["CASH", "BANK_TRANSFER", "CHEQUE", "ONLINE"],
			"Invalid payment method",
		),
	reference: yup.string().when("paymentMethod", (method, schema) => {
		return method && method[0] !== "CASH"
			? schema.required("Reference number is required for this payment method")
			: schema;
	}),
});

const InstallmentStatusBadge = ({ status }: { status: string }) => {
	switch (status) {
		case "PENDING":
			return <Badge variant="secondary">Pending</Badge>;
		case "PAID":
			return <Badge variant="success">Paid</Badge>;
		case "OVERDUE":
			return <Badge variant="danger">Overdue</Badge>;
		default:
			return <Badge variant="secondary">{status}</Badge>;
	}
};

const LoanRepaymentPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
	const [selectedInstallment, setSelectedInstallment] =
		useState<LoanSchedule | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [paymentSuccess, setPaymentSuccess] = useState(false);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: yupResolver(paymentSchema),
		defaultValues: {
			amount: 0,
			paymentDate: new Date().toISOString().split("T")[0],
			paymentMethod: "CASH",
			reference: "",
		},
	});

	// Fetch loan details
	const { data: loan, isLoading: isLoadingLoan } = useQuery(
		["loan", id],
		() => loanService.getLoanById(id as string),
		{
			enabled: !!id,
			onError: (error) => {
				toast.error("Failed to load loan details");
				console.error("Error fetching loan:", error);
			},
		},
	);

	// Fetch loan schedule
	const {
		data: schedule,
		isLoading: isLoadingSchedule,
		refetch: refetchSchedule,
	} = useQuery(
		["loanSchedule", id],
		() => loanService.getLoanSchedule(id as string),
		{
			enabled: !!id,
			onError: (error) => {
				toast.error("Failed to load repayment schedule");
				console.error("Error fetching schedule:", error);
			},
		},
	);

	// Mock data for now
	const mockLoan: Loan = {
		id: (id as string) || "L-1001",
		loanNumber: "LN-1001",
		userId: "user-1",
		applicationId: "LA-1001",
		amount: 10000,
		tenure: 12,
		interestRate: 12,
		interestType: "DIMINISHING",
		emi: 888.49,
		disbursementDate: "2023-01-15",
		status: "ACTIVE",
		loanType: {
			id: "1",
			name: "Personal Loan",
			code: "PL",
			interestType: "DIMINISHING",
			minAmount: 1000,
			maxAmount: 50000,
			minTenure: 3,
			maxTenure: 36,
			interestRate: 12,
			processingFeePercent: 2,
			lateFeeAmount: 500,
			isActive: true,
		},
	};

	// Generate mock schedule
	const generateMockSchedule = (): LoanSchedule[] => {
		const result: LoanSchedule[] = [];
		const principal = 10000;
		const rate = 12 / 12 / 100; // Monthly interest rate
		const tenure = 12;
		const emi = 888.49;

		let balance = principal;
		const startDate = new Date("2023-02-15");

		for (let i = 1; i <= tenure; i++) {
			const dueDate = new Date(startDate);
			dueDate.setMonth(startDate.getMonth() + i - 1);

			const interest = balance * rate;
			const principalPart = emi - interest;
			balance -= principalPart;

			// Set some installments as paid for demonstration
			const status = i <= 3 ? "PAID" : i === 4 ? "OVERDUE" : "PENDING";
			const paymentId = i <= 3 ? `payment-${i}` : undefined;

			result.push({
				installmentNumber: i,
				dueDate: dueDate.toISOString().split("T")[0],
				principal: principalPart,
				interest: interest,
				amount: emi,
				balance: Math.max(0, balance),
				status,
				paymentId,
			});
		}

		return result;
	};

	const mockSchedule = generateMockSchedule();

	const loanData = loan || mockLoan;
	const scheduleData = schedule || mockSchedule;

	const formatCurrency = (amount: number) => {
		const formattedNumber = new Intl.NumberFormat("en-US", {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
		}).format(amount);
		return `Rs ${formattedNumber}`;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const handlePaymentClick = (installment: LoanSchedule) => {
		setSelectedInstallment(installment);
		reset({
			amount: installment.amount,
			paymentDate: new Date().toISOString().split("T")[0],
			paymentMethod: "CASH",
			reference: "",
		});
		setIsPaymentModalOpen(true);
	};

	const handlePaymentSubmit = async (data: any) => {
		if (!selectedInstallment) return;

		setIsSubmitting(true);
		try {
			// In a real implementation, we would call the API
			// await loanService.recordLoanPayment(id as string, {
			//   amount: data.amount,
			//   paymentDate: data.paymentDate,
			//   paymentMethod: data.paymentMethod,
			//   reference: data.reference,
			//   installmentId: selectedInstallment.id,
			// });

			// Mock success
			await new Promise((resolve) => setTimeout(resolve, 1500));

			setPaymentSuccess(true);

			// Reset after a delay
			setTimeout(() => {
				setPaymentSuccess(false);
				setIsPaymentModalOpen(false);
				setSelectedInstallment(null);
				refetchSchedule();
			}, 2000);
		} catch (error) {
			toast.error("Failed to record payment");
			console.error("Error recording payment:", error);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleClosePaymentModal = () => {
		if (!isSubmitting) {
			setIsPaymentModalOpen(false);
			setSelectedInstallment(null);
			setPaymentSuccess(false);
		}
	};

	const calculateTotalPaid = () => {
		return scheduleData
			.filter((installment) => installment.status === "PAID")
			.reduce((sum, installment) => sum + installment.amount, 0);
	};

	const calculateTotalPending = () => {
		return scheduleData
			.filter(
				(installment) =>
					installment.status === "PENDING" || installment.status === "OVERDUE",
			)
			.reduce((sum, installment) => sum + installment.amount, 0);
	};

	const calculateTotalOverdue = () => {
		return scheduleData
			.filter((installment) => installment.status === "OVERDUE")
			.reduce((sum, installment) => sum + installment.amount, 0);
	};

	const getNextDueInstallment = () => {
		return scheduleData.find(
			(installment) =>
				installment.status === "PENDING" || installment.status === "OVERDUE",
		);
	};

	const nextDueInstallment = getNextDueInstallment();

	if (isLoadingLoan || isLoadingSchedule) {
		return (
			<ProtectedRoute>
				<MainLayout title="Loan Repayment">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<MainLayout title="Loan Repayment">
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<Button
								variant="secondary"
								className="mr-4"
								onClick={() => router.push(`/loans/${id}`)}
							>
								<ArrowLeftIcon className="h-5 w-5 mr-1" />
								Back to Loan Details
							</Button>
							<h1 className="text-2xl font-semibold text-gray-900">
								Loan Repayment
							</h1>
						</div>
						{nextDueInstallment && (
							<Button
								variant="primary"
								onClick={() => handlePaymentClick(nextDueInstallment)}
							>
								Pay Next Installment
							</Button>
						)}
					</div>

					<div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
						<Card>
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
									Loan Summary
								</h3>

								<div className="space-y-4">
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Loan Number
										</dt>
										<dd className="mt-1 text-sm text-gray-900">
											{loanData.loanNumber}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Loan Type
										</dt>
										<dd className="mt-1 text-sm text-gray-900">
											{loanData.loanType?.name || "Personal Loan"}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Principal Amount
										</dt>
										<dd className="mt-1 text-sm text-gray-900">
											{formatCurrency(loanData.amount)}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Interest Rate
										</dt>
										<dd className="mt-1 text-sm text-gray-900">
											{loanData.interestRate}% per annum (
											{loanData.interestType === "FLAT"
												? "Flat Rate"
												: "Reducing Balance"}
											)
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Tenure
										</dt>
										<dd className="mt-1 text-sm text-gray-900">
											{loanData.tenure} months
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Monthly EMI
										</dt>
										<dd className="mt-1 text-sm text-gray-900">
											{formatCurrency(loanData.emi)}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Disbursement Date
										</dt>
										<dd className="mt-1 text-sm text-gray-900">
											{formatDate(loanData.disbursementDate)}
										</dd>
									</div>
								</div>
							</div>
						</Card>

						<div className="lg:col-span-2">
							<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
								<Card className="bg-green-50 border border-green-100">
									<div className="px-4 py-5 sm:p-6">
										<h3 className="text-sm font-medium text-gray-900">
											Total Paid
										</h3>
										<div className="mt-2 flex items-baseline">
											<p className="text-2xl font-semibold text-gray-900">
												{formatCurrency(calculateTotalPaid())}
											</p>
										</div>
										<p className="mt-2 text-sm text-gray-500">
											{scheduleData.filter((i) => i.status === "PAID").length}{" "}
											of {scheduleData.length} installments paid
										</p>
									</div>
								</Card>

								<Card className="bg-yellow-50 border border-yellow-100">
									<div className="px-4 py-5 sm:p-6">
										<h3 className="text-sm font-medium text-gray-900">
											Total Pending
										</h3>
										<div className="mt-2 flex items-baseline">
											<p className="text-2xl font-semibold text-gray-900">
												{formatCurrency(calculateTotalPending())}
											</p>
										</div>
										<p className="mt-2 text-sm text-gray-500">
											{
												scheduleData.filter(
													(i) =>
														i.status === "PENDING" || i.status === "OVERDUE",
												).length
											}{" "}
											installments remaining
										</p>
									</div>
								</Card>

								<Card className="bg-red-50 border border-red-100">
									<div className="px-4 py-5 sm:p-6">
										<h3 className="text-sm font-medium text-gray-900">
											Total Overdue
										</h3>
										<div className="mt-2 flex items-baseline">
											<p className="text-2xl font-semibold text-gray-900">
												{formatCurrency(calculateTotalOverdue())}
											</p>
										</div>
										<p className="mt-2 text-sm text-gray-500">
											{
												scheduleData.filter((i) => i.status === "OVERDUE")
													.length
											}{" "}
											overdue installments
										</p>
									</div>
								</Card>
							</div>

							{nextDueInstallment && (
								<Card className="mt-6">
									<div className="px-4 py-5 sm:p-6">
										<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
											Next Payment Due
										</h3>

										<div className="bg-gray-50 p-4 rounded-md">
											<div className="flex justify-between items-center">
												<div>
													<p className="text-sm font-medium text-gray-900">
														Installment #{nextDueInstallment.installmentNumber}
													</p>
													<p className="mt-1 text-sm text-gray-500">
														Due Date: {formatDate(nextDueInstallment.dueDate)}
													</p>
													<div className="mt-2">
														<InstallmentStatusBadge
															status={nextDueInstallment.status}
														/>
													</div>
												</div>
												<div className="text-right">
													<p className="text-sm text-gray-500">Amount Due</p>
													<p className="text-xl font-semibold text-gray-900">
														{formatCurrency(nextDueInstallment.amount)}
													</p>
													<Button
														variant="primary"
														size="sm"
														className="mt-2"
														onClick={() =>
															handlePaymentClick(nextDueInstallment)
														}
													>
														Pay Now
													</Button>
												</div>
											</div>
										</div>
									</div>
								</Card>
							)}
						</div>
					</div>

					<Card>
						<div className="px-4 py-5 sm:p-6">
							<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
								Repayment Schedule
							</h3>

							<div className="overflow-x-auto">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-50">
										<tr>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												No.
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Due Date
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Principal
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Interest
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												EMI
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Balance
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Status
											</th>
											<th
												scope="col"
												className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
											>
												Action
											</th>
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{scheduleData.map((installment) => (
											<tr
												key={installment.installmentNumber}
												className={
													installment.status === "OVERDUE"
														? "bg-red-50"
														: installment.status === "PAID"
															? "bg-green-50"
															: ""
												}
											>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
													{installment.installmentNumber}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
													{formatDate(installment.dueDate)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
													{formatCurrency(installment.principal)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
													{formatCurrency(installment.interest)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
													{formatCurrency(installment.amount)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
													{formatCurrency(installment.balance)}
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-center">
													<InstallmentStatusBadge status={installment.status} />
												</td>
												<td className="px-6 py-4 whitespace-nowrap text-sm text-right">
													{(installment.status === "PENDING" ||
														installment.status === "OVERDUE") && (
														<Button
															variant="primary"
															size="sm"
															onClick={() => handlePaymentClick(installment)}
														>
															Pay
														</Button>
													)}
													{installment.status === "PAID" && (
														<span className="text-green-600">Paid</span>
													)}
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</Card>
				</div>

				{/* Payment Modal */}
				{isPaymentModalOpen && selectedInstallment && (
					<div className="fixed inset-0 z-10 overflow-y-auto">
						<div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
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

							<div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
								{paymentSuccess ? (
									<div className="text-center">
										<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
											<CheckCircleIcon
												className="h-6 w-6 text-green-600"
												aria-hidden="true"
											/>
										</div>
										<h3 className="mt-3 text-lg font-medium text-gray-900">
											Payment Successful
										</h3>
										<p className="mt-2 text-sm text-gray-500">
											Your payment has been processed successfully.
										</p>
									</div>
								) : (
									<>
										<div>
											<div className="mt-3 text-center sm:mt-0 sm:text-left">
												<h3 className="text-lg leading-6 font-medium text-gray-900">
													Make Payment - Installment #
													{selectedInstallment.installmentNumber}
												</h3>
												<div className="mt-2">
													<p className="text-sm text-gray-500">
														Due Date: {formatDate(selectedInstallment.dueDate)}
													</p>
													<p className="text-sm text-gray-500">
														Amount Due:{" "}
														{formatCurrency(selectedInstallment.amount)}
													</p>
													{selectedInstallment.status === "OVERDUE" && (
														<p className="text-sm text-red-500 mt-1">
															This payment is overdue. Late fees may apply.
														</p>
													)}
												</div>
											</div>
										</div>

										<form
											onSubmit={handleSubmit(handlePaymentSubmit)}
											className="mt-5 space-y-4"
										>
											<div>
												<label
													htmlFor="amount"
													className="block text-sm font-medium text-gray-700"
												>
													Payment Amount
												</label>
												<div className="mt-1 relative rounded-md shadow-sm">
													<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
														<span className="text-gray-500 sm:text-sm">$</span>
													</div>
													<input
														type="number"
														id="amount"
														step="0.01"
														className={`form-input block w-full pl-7 pr-12 sm:text-sm rounded-md ${
															errors.amount
																? "border-red-300 focus:ring-red-500 focus:border-red-500"
																: ""
														}`}
														placeholder="0.00"
														{...register("amount")}
													/>
												</div>
												{errors.amount && (
													<p className="mt-1 text-sm text-red-600">
														{errors.amount.message}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="paymentDate"
													className="block text-sm font-medium text-gray-700"
												>
													Payment Date
												</label>
												<input
													type="date"
													id="paymentDate"
													className={`form-input mt-1 block w-full sm:text-sm rounded-md ${
														errors.paymentDate
															? "border-red-300 focus:ring-red-500 focus:border-red-500"
															: ""
													}`}
													{...register("paymentDate")}
												/>
												{errors.paymentDate && (
													<p className="mt-1 text-sm text-red-600">
														{errors.paymentDate.message}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="paymentMethod"
													className="block text-sm font-medium text-gray-700"
												>
													Payment Method
												</label>
												<select
													id="paymentMethod"
													className={`form-select mt-1 block w-full sm:text-sm rounded-md ${
														errors.paymentMethod
															? "border-red-300 focus:ring-red-500 focus:border-red-500"
															: ""
													}`}
													{...register("paymentMethod")}
												>
													<option value="CASH">Cash</option>
													<option value="BANK_TRANSFER">Bank Transfer</option>
													<option value="CHEQUE">Cheque</option>
													<option value="ONLINE">Online Payment</option>
												</select>
												{errors.paymentMethod && (
													<p className="mt-1 text-sm text-red-600">
														{errors.paymentMethod.message}
													</p>
												)}
											</div>

											<div>
												<label
													htmlFor="reference"
													className="block text-sm font-medium text-gray-700"
												>
													Reference Number
												</label>
												<input
													type="text"
													id="reference"
													className={`form-input mt-1 block w-full sm:text-sm rounded-md ${
														errors.reference
															? "border-red-300 focus:ring-red-500 focus:border-red-500"
															: ""
													}`}
													placeholder="Transaction ID, Cheque Number, etc."
													{...register("reference")}
												/>
												{errors.reference && (
													<p className="mt-1 text-sm text-red-600">
														{errors.reference.message}
													</p>
												)}
											</div>

											<div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
												<Button
													type="submit"
													variant="primary"
													className="w-full sm:col-start-2"
													isLoading={isSubmitting}
												>
													Make Payment
												</Button>
												<Button
													type="button"
													variant="secondary"
													className="w-full sm:col-start-1 mt-3 sm:mt-0"
													onClick={handleClosePaymentModal}
													disabled={isSubmitting}
												>
													Cancel
												</Button>
											</div>
										</form>
									</>
								)}
							</div>
						</div>
					</div>
				)}
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

export default LoanRepaymentPage;
