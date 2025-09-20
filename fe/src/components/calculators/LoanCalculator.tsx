import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";
import loanService from "@/services/loanService";
import {
	CalculatorIcon,
	ArrowPathIcon,
	ChartBarIcon,
	DocumentTextIcon,
	ArrowDownTrayIcon,
	InformationCircleIcon,
	BookmarkIcon,
	ClockIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";
import {
	LoanType,
	LoanCalculatorPreset,
	LoanCalculatorHistory,
	EMICalculationResult,
} from "@/types/loan";
import { useAuth } from "@/hooks/useAuth";
import styles from "./LoanCalculator.module.css";

interface CalculatorFormData {
	loanTypeId: string;
	amount: number;
	tenure: number;
	interestRate: number;
	interestType: "FLAT" | "DIMINISHING";
	startDate: string;
}

interface AmortizationScheduleEntry {
	installmentNumber: number;
	dueDate: string;
	principal: number;
	interest: number;
	amount: number;
	balance: number;
}

const calculatorSchema = yup.object().shape({
	loanTypeId: yup.string().required("Loan type is required"),
	amount: yup
		.number()
		.required("Loan amount is required")
		.positive("Amount must be positive"),
	tenure: yup
		.number()
		.required("Tenure is required")
		.positive("Tenure must be positive")
		.integer("Tenure must be a whole number"),
	interestRate: yup
		.number()
		.required("Interest rate is required")
		.positive("Interest rate must be positive"),
	interestType: yup
		.string()
		.oneOf(["FLAT", "DIMINISHING"], "Invalid interest type")
		.required("Interest type is required"),
	startDate: yup.string().required("Start date is required"),
});

const LoanCalculator: React.FC = () => {
	const { user } = useAuth();
	const queryClient = useQueryClient();

	const [selectedLoanType, setSelectedLoanType] = useState<LoanType | null>(
		null,
	);
	const [isCalculating, setIsCalculating] = useState(false);
	const [emiResult, setEmiResult] = useState<{
		emi: number;
		totalInterest: number;
		totalAmount: number;
	} | null>(null);
	const [schedule, setSchedule] = useState<AmortizationScheduleEntry[]>([]);
	const [showFullSchedule, setShowFullSchedule] = useState(false);
	const [activeTab, setActiveTab] = useState<
		"calculator" | "comparison" | "chart" | "presets" | "history"
	>("calculator");
	const [comparisonResult, setComparisonResult] = useState<{
		flat: { emi: number; totalInterest: number; totalAmount: number };
		diminishing: { emi: number; totalInterest: number; totalAmount: number };
	} | null>(null);
	const [showTooltip, setShowTooltip] = useState<string | null>(null);
	const [showSavePresetModal, setShowSavePresetModal] = useState(false);
	const [presetName, setPresetName] = useState("");
	const [makeDefaultPreset, setMakeDefaultPreset] = useState(false);
	const chartRef = useRef<HTMLDivElement>(null);

	// Fetch loan types
	const { data: loanTypes, isLoading: isLoadingLoanTypes } = useQuery(
		"loanTypes",
		() => loanService.getLoanTypes(),
		{
			staleTime: 60 * 60 * 1000, // 1 hour
			// Mock data for now
			onError: () => {
				console.error("Failed to fetch loan types, using mock data");
				return [
					{
						id: "1",
						name: "Personal Loan",
						code: "PL",
						interestType: "FLAT",
						minAmount: 1000,
						maxAmount: 50000,
						minTenure: 3,
						maxTenure: 36,
						interestRate: 12,
						isActive: true,
					},
					{
						id: "2",
						name: "Business Loan",
						code: "BL",
						interestType: "DIMINISHING",
						minAmount: 5000,
						maxAmount: 200000,
						minTenure: 6,
						maxTenure: 60,
						interestRate: 15,
						isActive: true,
					},
					{
						id: "3",
						name: "Education Loan",
						code: "EL",
						interestType: "DIMINISHING",
						minAmount: 10000,
						maxAmount: 100000,
						minTenure: 12,
						maxTenure: 84,
						interestRate: 10,
						isActive: true,
					},
				];
			},
		},
	);

	// Fetch user's calculator presets
	const { data: presets, isLoading: isLoadingPresets } = useQuery(
		["calculatorPresets", user?.id],
		() => loanService.getUserCalculatorPresets(user?.id || ""),
		{
			enabled: !!user?.id,
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	// Fetch user's calculation history
	const { data: calculationHistory, isLoading: isLoadingHistory } = useQuery(
		["calculationHistory", user?.id],
		() => loanService.getUserCalculationHistory(user?.id || ""),
		{
			enabled: !!user?.id && activeTab === "history",
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	// Fetch user's calculation stats
	const { data: calculationStats, isLoading: isLoadingStats } = useQuery(
		["calculationStats", user?.id],
		() => loanService.getUserCalculationStats(user?.id || ""),
		{
			enabled: !!user?.id && activeTab === "history",
			staleTime: 5 * 60 * 1000, // 5 minutes
		},
	);

	// Create preset mutation
	const createPresetMutation = useMutation(
		(data: {
			name: string;
			userId: string;
			loanTypeId: string;
			amount: number;
			tenure: number;
			interestRate: number;
			interestType: "FLAT" | "DIMINISHING";
			startDate: string;
			isDefault: boolean;
		}) => loanService.createCalculatorPreset(data),
		{
			onSuccess: () => {
				queryClient.invalidateQueries(["calculatorPresets", user?.id]);
				toast.success("Preset saved successfully");
				setShowSavePresetModal(false);
				setPresetName("");
				setMakeDefaultPreset(false);
			},
			onError: () => {
				toast.error("Failed to save preset");
			},
		},
	);

	// Delete preset mutation
	const deletePresetMutation = useMutation(
		(id: string) => loanService.deleteCalculatorPreset(id),
		{
			onSuccess: () => {
				queryClient.invalidateQueries(["calculatorPresets", user?.id]);
				toast.success("Preset deleted successfully");
			},
			onError: () => {
				toast.error("Failed to delete preset");
			},
		},
	);

	// Record calculation mutation
	const recordCalculationMutation = useMutation(
		(data: {
			userId: string;
			loanTypeId?: string;
			amount: number;
			tenure: number;
			interestRate: number;
			interestType: "FLAT" | "DIMINISHING";
			emi: number;
			totalInterest: number;
			totalAmount: number;
		}) => loanService.recordCalculation(data),
		{
			onSuccess: () => {
				queryClient.invalidateQueries(["calculationHistory", user?.id]);
				queryClient.invalidateQueries(["calculationStats", user?.id]);
			},
		},
	);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		reset,
		getValues,
		formState: { errors },
	} = useForm<CalculatorFormData>({
		resolver: yupResolver(calculatorSchema),
		defaultValues: {
			loanTypeId: "",
			amount: 10000,
			tenure: 12,
			interestRate: 12,
			interestType: "DIMINISHING",
			startDate: new Date().toISOString().split("T")[0],
		},
	});

	const watchLoanTypeId = watch("loanTypeId");
	const watchAmount = watch("amount");
	const watchTenure = watch("tenure");
	const watchInterestRate = watch("interestRate");
	const watchInterestType = watch("interestType");
	const watchStartDate = watch("startDate");

	// Update form values when loan type changes
	useEffect(() => {
		if (loanTypes && watchLoanTypeId) {
			const loanType = loanTypes.data?.find(
				(lt: any) => lt.id === watchLoanTypeId,
			);
			if (loanType) {
				setSelectedLoanType(loanType);

				// Set default values based on loan type
				setValue("amount", loanType.minAmount);
				setValue("tenure", loanType.minTenure);
				setValue("interestRate", loanType.interestRate);
				setValue("interestType", loanType.interestType);
			}
		}
	}, [loanTypes, watchLoanTypeId, setValue]);

	// Calculate EMI and generate schedule
	const calculateLoan = async (data: CalculatorFormData) => {
		setIsCalculating(true);
		try {
			// In a real implementation, we would call the API
			// const emiResult = await loanService.calculateEMI({
			//   amount: data.amount,
			//   tenure: data.tenure,
			//   interestRate: data.interestRate,
			//   interestType: data.interestType,
			// });
			// const scheduleResult = await loanService.generateSchedule(data);

			// Mock calculation for now
			const principal = data.amount;
			const ratePerMonth = data.interestRate / 12 / 100;
			const tenure = data.tenure;
			let emi = 0;
			let totalInterest = 0;

			if (data.interestType === "FLAT") {
				// Flat rate calculation
				totalInterest = ((principal * data.interestRate) / 100) * (tenure / 12);
				emi = (principal + totalInterest) / tenure;
			} else {
				// Diminishing balance calculation
				emi =
					(principal * ratePerMonth * Math.pow(1 + ratePerMonth, tenure)) /
					(Math.pow(1 + ratePerMonth, tenure) - 1);
				totalInterest = emi * tenure - principal;
			}

			const totalAmount = principal + totalInterest;

			// Generate amortization schedule
			const schedule: AmortizationScheduleEntry[] = [];
			let remainingPrincipal = principal;
			let startDate = new Date(data.startDate);

			for (let i = 1; i <= tenure; i++) {
				const dueDate = new Date(startDate);
				dueDate.setMonth(dueDate.getMonth() + i);

				let interestPayment = 0;
				let principalPayment = 0;

				if (data.interestType === "FLAT") {
					// Flat rate
					interestPayment = totalInterest / tenure;
					principalPayment = principal / tenure;
				} else {
					// Diminishing balance
					interestPayment = remainingPrincipal * ratePerMonth;
					principalPayment = emi - interestPayment;
				}

				remainingPrincipal -= principalPayment;

				schedule.push({
					installmentNumber: i,
					dueDate: dueDate.toISOString().split("T")[0],
					principal: principalPayment,
					interest: interestPayment,
					amount: principalPayment + interestPayment,
					balance: Math.max(0, remainingPrincipal),
				});
			}

			setEmiResult({
				emi,
				totalInterest,
				totalAmount,
			});

			setSchedule(schedule);

			// Calculate comparison between flat and diminishing methods
			const flatInterest =
				((principal * data.interestRate) / 100) * (tenure / 12);
			const flatEmi = (principal + flatInterest) / tenure;
			const flatTotal = principal + flatInterest;

			const diminishingEmi =
				(principal * ratePerMonth * Math.pow(1 + ratePerMonth, tenure)) /
				(Math.pow(1 + ratePerMonth, tenure) - 1);
			const diminishingInterest = diminishingEmi * tenure - principal;
			const diminishingTotal = principal + diminishingInterest;

			setComparisonResult({
				flat: {
					emi: flatEmi,
					totalInterest: flatInterest,
					totalAmount: flatTotal,
				},
				diminishing: {
					emi: diminishingEmi,
					totalInterest: diminishingInterest,
					totalAmount: diminishingTotal,
				},
			});

			// If calculation is successful, show a success message
			toast.success("Loan calculation completed successfully");

			// Record calculation in history if user is logged in
			if (user?.id) {
				recordCalculationMutation.mutate({
					userId: user.id,
					loanTypeId: data.loanTypeId || undefined,
					amount: principal,
					tenure,
					interestRate: data.interestRate,
					interestType: data.interestType,
					emi,
					totalInterest,
					totalAmount,
				});
			}

			// Scroll to results
			setTimeout(() => {
				if (emiResult && window) {
					window.scrollTo({
						top: window.scrollY + 300,
						behavior: "smooth",
					});
				}
			}, 100);
		} catch (error) {
			console.error("Error calculating loan:", error);
			toast.error("Failed to calculate loan. Please try again.");
		} finally {
			setIsCalculating(false);
		}
	};

	const handleReset = () => {
		reset();
		setEmiResult(null);
		setSchedule([]);
		setShowFullSchedule(false);
		setComparisonResult(null);
		setActiveTab("calculator");
		toast.success("Calculator reset successfully");
	};

	// Function to export amortization schedule as CSV
	const exportScheduleAsCSV = () => {
		if (schedule.length === 0) return;

		// Create CSV content
		const headers = [
			"Installment Number",
			"Due Date",
			"Principal",
			"Interest",
			"EMI",
			"Balance",
		];
		const csvContent = [
			headers.join(","),
			...schedule.map((entry) =>
				[
					entry.installmentNumber,
					formatDate(entry.dueDate),
					entry.principal.toFixed(2),
					entry.interest.toFixed(2),
					entry.amount.toFixed(2),
					entry.balance.toFixed(2),
				].join(","),
			),
		].join("\n");

		// Create a blob and download link
		const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.setAttribute("href", url);
		link.setAttribute(
			"download",
			`loan_schedule_${new Date().toISOString().split("T")[0]}.csv`,
		);
		link.style.visibility = "hidden";
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		toast.success("Amortization schedule exported successfully");
	};

	// Function to handle tooltip display
	const handleTooltipToggle = (tooltipId: string) => {
		if (showTooltip === tooltipId) {
			setShowTooltip(null);
		} else {
			setShowTooltip(tooltipId);
		}
	};

	// Function to save current calculator settings as a preset
	const handleSavePreset = () => {
		if (!user?.id) {
			toast.error("You must be logged in to save presets");
			return;
		}

		if (!presetName.trim()) {
			toast.error("Please enter a name for your preset");
			return;
		}

		const formValues = getValues();

		createPresetMutation.mutate({
			name: presetName,
			userId: user.id,
			loanTypeId: formValues.loanTypeId,
			amount: formValues.amount,
			tenure: formValues.tenure,
			interestRate: formValues.interestRate,
			interestType: formValues.interestType,
			startDate: formValues.startDate,
			isDefault: makeDefaultPreset,
		});
	};

	// Function to load a preset
	const handleLoadPreset = (preset: LoanCalculatorPreset) => {
		setValue("loanTypeId", preset.loanTypeId || "");
		setValue("amount", preset.amount);
		setValue("tenure", preset.tenure);
		setValue("interestRate", preset.interestRate);
		setValue("interestType", preset.interestType);
		setValue("startDate", preset.startDate);

		toast.success(`Preset "${preset.name}" loaded successfully`);
		setActiveTab("calculator");
	};

	// Function to delete a preset
	const handleDeletePreset = (id: string) => {
		if (confirm("Are you sure you want to delete this preset?")) {
			deletePresetMutation.mutate(id);
		}
	};

	// Function to clear calculation history
	const handleClearHistory = () => {
		if (!user?.id) return;

		if (confirm("Are you sure you want to clear your calculation history?")) {
			loanService
				.clearUserCalculationHistory(user.id)
				.then(() => {
					queryClient.invalidateQueries(["calculationHistory", user.id]);
					queryClient.invalidateQueries(["calculationStats", user.id]);
					toast.success("Calculation history cleared successfully");
				})
				.catch(() => {
					toast.error("Failed to clear calculation history");
				});
		}
	};

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
			month: "short",
			day: "numeric",
		});
	};

	return (
		<div className={`space-y-6 ${styles.calculatorContainer}`}>
			<Card>
				<div className="px-4 py-5 sm:p-6">
					<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
						Loan Calculator
					</h3>

					<form
						onSubmit={handleSubmit(calculateLoan)}
						className={`space-y-6 ${styles.formContainer}`}
					>
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
							<div>
								<label
									htmlFor="loanTypeId"
									className="form-label flex items-center"
								>
									<span>Loan Type</span>
									<button
										type="button"
										className="ml-1 text-gray-400 hover:text-gray-500"
										onClick={() => handleTooltipToggle("loanType")}
										aria-label="More information about loan types"
									>
										<InformationCircleIcon className="h-4 w-4" />
									</button>
								</label>
								{showTooltip === "loanType" && (
									<div className="mt-1 p-2 bg-gray-100 rounded-md text-xs text-gray-700">
										Different loan types have different interest rates and
										terms. Select the appropriate loan type for your needs.
									</div>
								)}
								<select
									id="loanTypeId"
									className={`form-input ${errors.loanTypeId ? "border-red-300" : ""}`}
									{...register("loanTypeId")}
									disabled={isLoadingLoanTypes}
									aria-invalid={errors.loanTypeId ? "true" : "false"}
								>
									<option value="">Select Loan Type</option>
									{loanTypes?.data?.map((loanType: any) => (
										<option key={loanType.id} value={loanType.id}>
											{loanType.name} ({loanType.interestRate}%)
										</option>
									))}
								</select>
								{errors.loanTypeId && (
									<p className="form-error" role="alert">
										{errors.loanTypeId.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="amount"
									className="form-label flex items-center"
								>
									<span>Loan Amount</span>
									<button
										type="button"
										className="ml-1 text-gray-400 hover:text-gray-500"
										onClick={() => handleTooltipToggle("amount")}
										aria-label="More information about loan amount"
									>
										<InformationCircleIcon className="h-4 w-4" />
									</button>
								</label>
								{showTooltip === "amount" && (
									<div className="mt-1 p-2 bg-gray-100 rounded-md text-xs text-gray-700">
										Enter the principal amount you wish to borrow. This is the
										base amount on which interest will be calculated.
									</div>
								)}
								<input
									id="amount"
									type="number"
									className={`form-input ${errors.amount ? "border-red-300" : ""}`}
									{...register("amount")}
									min={selectedLoanType?.minAmount || 1000}
									max={selectedLoanType?.maxAmount || 1000000}
									aria-invalid={errors.amount ? "true" : "false"}
								/>
								{errors.amount && (
									<p className="form-error" role="alert">
										{errors.amount.message}
									</p>
								)}
								{selectedLoanType && (
									<p className="mt-1 text-xs text-gray-500">
										Min: {formatCurrency(selectedLoanType.minAmount)} | Max:{" "}
										{formatCurrency(selectedLoanType.maxAmount)}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="tenure"
									className="form-label flex items-center"
								>
									<span>Tenure (months)</span>
									<button
										type="button"
										className="ml-1 text-gray-400 hover:text-gray-500"
										onClick={() => handleTooltipToggle("tenure")}
										aria-label="More information about loan tenure"
									>
										<InformationCircleIcon className="h-4 w-4" />
									</button>
								</label>
								{showTooltip === "tenure" && (
									<div className="mt-1 p-2 bg-gray-100 rounded-md text-xs text-gray-700">
										The loan tenure is the period over which you'll repay the
										loan. Longer tenures mean lower EMIs but higher total
										interest.
									</div>
								)}
								<input
									id="tenure"
									type="number"
									className={`form-input ${errors.tenure ? "border-red-300" : ""}`}
									{...register("tenure")}
									min={selectedLoanType?.minTenure || 3}
									max={selectedLoanType?.maxTenure || 84}
									aria-invalid={errors.tenure ? "true" : "false"}
								/>
								{errors.tenure && (
									<p className="form-error" role="alert">
										{errors.tenure.message}
									</p>
								)}
								{selectedLoanType && (
									<p className="mt-1 text-xs text-gray-500">
										Min: {selectedLoanType.minTenure} months | Max:{" "}
										{selectedLoanType.maxTenure} months
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="interestRate"
									className="form-label flex items-center"
								>
									<span>Interest Rate (% p.a.)</span>
									<button
										type="button"
										className="ml-1 text-gray-400 hover:text-gray-500"
										onClick={() => handleTooltipToggle("interestRate")}
										aria-label="More information about interest rate"
									>
										<InformationCircleIcon className="h-4 w-4" />
									</button>
								</label>
								{showTooltip === "interestRate" && (
									<div className="mt-1 p-2 bg-gray-100 rounded-md text-xs text-gray-700">
										Annual interest rate charged on the loan. Higher rates mean
										higher EMIs and total interest payments.
									</div>
								)}
								<input
									id="interestRate"
									type="number"
									step="0.01"
									className={`form-input ${errors.interestRate ? "border-red-300" : ""}`}
									{...register("interestRate")}
									min={1}
									max={36}
									aria-invalid={errors.interestRate ? "true" : "false"}
								/>
								{errors.interestRate && (
									<p className="form-error" role="alert">
										{errors.interestRate.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="interestType"
									className="form-label flex items-center"
								>
									<span>Interest Type</span>
									<button
										type="button"
										className="ml-1 text-gray-400 hover:text-gray-500"
										onClick={() => handleTooltipToggle("interestType")}
										aria-label="More information about interest type"
									>
										<InformationCircleIcon className="h-4 w-4" />
									</button>
								</label>
								{showTooltip === "interestType" && (
									<div className="mt-1 p-2 bg-gray-100 rounded-md text-xs text-gray-700">
										<p>
											<strong>Flat Rate:</strong> Interest calculated on the
											full principal throughout the loan tenure.
										</p>
										<p>
											<strong>Reducing Balance:</strong> Interest calculated on
											the remaining principal, which decreases with each
											payment.
										</p>
									</div>
								)}
								<select
									id="interestType"
									className={`form-input ${errors.interestType ? "border-red-300" : ""}`}
									{...register("interestType")}
									aria-invalid={errors.interestType ? "true" : "false"}
								>
									<option value="FLAT">Flat Rate</option>
									<option value="DIMINISHING">Reducing Balance</option>
								</select>
								{errors.interestType && (
									<p className="form-error" role="alert">
										{errors.interestType.message}
									</p>
								)}
							</div>

							<div>
								<label
									htmlFor="startDate"
									className="form-label flex items-center"
								>
									<span>First Payment Date</span>
									<button
										type="button"
										className="ml-1 text-gray-400 hover:text-gray-500"
										onClick={() => handleTooltipToggle("startDate")}
										aria-label="More information about first payment date"
									>
										<InformationCircleIcon className="h-4 w-4" />
									</button>
								</label>
								{showTooltip === "startDate" && (
									<div className="mt-1 p-2 bg-gray-100 rounded-md text-xs text-gray-700">
										The date when your first EMI payment is due. Subsequent
										payments will be due on the same date of following months.
									</div>
								)}
								<input
									id="startDate"
									type="date"
									className={`form-input ${errors.startDate ? "border-red-300" : ""}`}
									{...register("startDate")}
									aria-invalid={errors.startDate ? "true" : "false"}
								/>
								{errors.startDate && (
									<p className="form-error" role="alert">
										{errors.startDate.message}
									</p>
								)}
							</div>
						</div>

						<div className="flex justify-end space-x-3">
							<Button
								type="button"
								variant="secondary"
								onClick={handleReset}
								icon={<ArrowPathIcon className="h-5 w-5 mr-1" />}
								aria-label="Reset calculator"
							>
								Reset
							</Button>
							<Button
								type="submit"
								variant="primary"
								isLoading={isCalculating}
								icon={<CalculatorIcon className="h-5 w-5 mr-1" />}
								aria-label="Calculate loan details"
							>
								Calculate
							</Button>
						</div>
					</form>
				</div>
			</Card>

			{emiResult && (
				<div className="space-y-6">
					{/* Tabs */}
					<div className="border-b border-gray-200">
						<nav
							className={`-mb-px flex space-x-8 overflow-x-auto ${styles.tabsContainer}`}
							aria-label="Loan calculation results tabs"
						>
							<button
								type="button"
								className={`${
									activeTab === "calculator"
										? `border-primary-500 text-primary-600 ${styles.activeTab}`
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${styles.tabButton}`}
								onClick={() => setActiveTab("calculator")}
								aria-current={activeTab === "calculator" ? "page" : undefined}
							>
								Loan Summary
							</button>
							<button
								type="button"
								className={`${
									activeTab === "comparison"
										? `border-primary-500 text-primary-600 ${styles.activeTab}`
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${styles.tabButton}`}
								onClick={() => setActiveTab("comparison")}
								aria-current={activeTab === "comparison" ? "page" : undefined}
							>
								Interest Comparison
							</button>
							<button
								type="button"
								className={`${
									activeTab === "chart"
										? `border-primary-500 text-primary-600 ${styles.activeTab}`
										: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
								} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${styles.tabButton}`}
								onClick={() => setActiveTab("chart")}
								aria-current={activeTab === "chart" ? "page" : undefined}
							>
								Payment Breakdown
							</button>
							{user && (
								<>
									<button
										type="button"
										className={`${
											activeTab === "presets"
												? `border-primary-500 text-primary-600 ${styles.activeTab}`
												: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
										} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${styles.tabButton}`}
										onClick={() => setActiveTab("presets")}
										aria-current={activeTab === "presets" ? "page" : undefined}
									>
										<BookmarkIcon className="h-4 w-4 mr-1" />
										Saved Presets
									</button>
									<button
										type="button"
										className={`${
											activeTab === "history"
												? `border-primary-500 text-primary-600 ${styles.activeTab}`
												: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
										} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center ${styles.tabButton}`}
										onClick={() => setActiveTab("history")}
										aria-current={activeTab === "history" ? "page" : undefined}
									>
										<ClockIcon className="h-4 w-4 mr-1" />
										History
									</button>
								</>
							)}
						</nav>
					</div>

					{/* Loan Summary Tab */}
					{activeTab === "calculator" && (
						<Card className={styles.resultCard}>
							<div className="px-4 py-5 sm:p-6">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-medium leading-6 text-gray-900">
										Loan Summary
									</h3>
									<div className="flex space-x-2">
										{user && (
											<Button
												variant="outline"
												size="sm"
												icon={<BookmarkIcon className="h-4 w-4 mr-1" />}
												onClick={() => setShowSavePresetModal(true)}
												aria-label="Save current settings as preset"
												className={styles.savePresetButton}
											>
												Save Preset
											</Button>
										)}
										<Button
											variant="outline"
											size="sm"
											icon={<ArrowDownTrayIcon className="h-4 w-4 mr-1" />}
											onClick={exportScheduleAsCSV}
											aria-label="Export amortization schedule as CSV"
											className={styles.exportButton}
										>
											Export Schedule
										</Button>
									</div>
								</div>

								<div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500">Monthly EMI</p>
										<p className="text-xl font-semibold text-gray-900">
											{formatCurrency(emiResult.emi)}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500">Principal Amount</p>
										<p className="text-xl font-semibold text-gray-900">
											{formatCurrency(watchAmount)}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500">Total Interest</p>
										<p className="text-xl font-semibold text-gray-900">
											{formatCurrency(emiResult.totalInterest)}
										</p>
									</div>
									<div className="bg-gray-50 p-4 rounded-lg">
										<p className="text-sm text-gray-500">Total Amount</p>
										<p className="text-xl font-semibold text-gray-900">
											{formatCurrency(emiResult.totalAmount)}
										</p>
									</div>
								</div>

								<div className="mt-6">
									<div className="flex justify-between items-center mb-4">
										<h4 className="text-md font-medium text-gray-900">
											Amortization Schedule
										</h4>
										<button
											type="button"
											onClick={() => setShowFullSchedule(!showFullSchedule)}
											className="text-sm text-primary-600 hover:text-primary-800"
											aria-expanded={showFullSchedule ? "true" : "false"}
										>
											{showFullSchedule ? "Show Less" : "Show Full Schedule"}
										</button>
									</div>

									<div className="overflow-x-auto">
										<table
											className="min-w-full divide-y divide-gray-200"
											aria-label="Amortization schedule"
										>
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
												</tr>
											</thead>
											<tbody className="bg-white divide-y divide-gray-200">
												{(showFullSchedule
													? schedule
													: schedule.slice(0, 3)
												).map((entry) => (
													<tr key={entry.installmentNumber}>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
															{entry.installmentNumber}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
															{formatDate(entry.dueDate)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
															{formatCurrency(entry.principal)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
															{formatCurrency(entry.interest)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
															{formatCurrency(entry.amount)}
														</td>
														<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
															{formatCurrency(entry.balance)}
														</td>
													</tr>
												))}

												{!showFullSchedule && schedule.length > 3 && (
													<tr>
														<td
															colSpan={6}
															className="px-6 py-4 text-center text-sm text-gray-500"
														>
															<button
																type="button"
																onClick={() => setShowFullSchedule(true)}
																className="text-primary-600 hover:text-primary-800"
															>
																Show {schedule.length - 3} more entries...
															</button>
														</td>
													</tr>
												)}
											</tbody>
										</table>
									</div>
								</div>
							</div>
						</Card>
					)}

					{/* Interest Comparison Tab */}
					{activeTab === "comparison" && comparisonResult && (
						<Card>
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
									Interest Calculation Method Comparison
								</h3>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div className="border border-gray-200 rounded-lg p-4">
										<h4 className="text-md font-medium text-gray-900 mb-2">
											Flat Rate Method
										</h4>
										<p className="text-sm text-gray-500 mb-4">
											Interest is calculated on the full principal amount
											throughout the loan tenure.
										</p>

										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">
													Monthly EMI:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(comparisonResult.flat.emi)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">
													Principal Amount:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(watchAmount)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">
													Total Interest:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(comparisonResult.flat.totalInterest)}
												</span>
											</div>
											<div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
												<span className="text-sm font-medium text-gray-700">
													Total Amount:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(comparisonResult.flat.totalAmount)}
												</span>
											</div>
										</div>
									</div>

									<div className="border border-gray-200 rounded-lg p-4">
										<h4 className="text-md font-medium text-gray-900 mb-2">
											Reducing Balance Method
										</h4>
										<p className="text-sm text-gray-500 mb-4">
											Interest is calculated on the outstanding principal, which
											decreases with each payment.
										</p>

										<div className="space-y-3">
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">
													Monthly EMI:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(comparisonResult.diminishing.emi)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">
													Principal Amount:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(watchAmount)}
												</span>
											</div>
											<div className="flex justify-between">
												<span className="text-sm text-gray-500">
													Total Interest:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(
														comparisonResult.diminishing.totalInterest,
													)}
												</span>
											</div>
											<div className="flex justify-between border-t border-gray-200 pt-2 mt-2">
												<span className="text-sm font-medium text-gray-700">
													Total Amount:
												</span>
												<span className="text-sm font-medium text-gray-900">
													{formatCurrency(
														comparisonResult.diminishing.totalAmount,
													)}
												</span>
											</div>
										</div>
									</div>
								</div>

								<div className="mt-6 bg-yellow-50 border border-yellow-100 rounded-lg p-4">
									<h4 className="text-md font-medium text-gray-900 mb-2">
										Comparison Summary
									</h4>

									<div className="space-y-2">
										<p className="text-sm text-gray-700">
											<strong>Interest Difference:</strong>{" "}
											{formatCurrency(
												Math.abs(
													comparisonResult.flat.totalInterest -
														comparisonResult.diminishing.totalInterest,
												),
											)}
											{comparisonResult.flat.totalInterest >
											comparisonResult.diminishing.totalInterest
												? " more in Flat Rate method"
												: " more in Reducing Balance method"}
										</p>

										<p className="text-sm text-gray-700">
											<strong>EMI Difference:</strong>{" "}
											{formatCurrency(
												Math.abs(
													comparisonResult.flat.emi -
														comparisonResult.diminishing.emi,
												),
											)}
											{comparisonResult.flat.emi >
											comparisonResult.diminishing.emi
												? " higher in Flat Rate method"
												: " higher in Reducing Balance method"}
										</p>

										<p className="text-sm text-gray-700">
											<strong>Recommendation:</strong>{" "}
											{comparisonResult.flat.totalInterest >
											comparisonResult.diminishing.totalInterest
												? "The Reducing Balance method is generally more favorable as it results in lower total interest payments."
												: "In this specific case, the Flat Rate method results in lower total interest payments."}
										</p>
									</div>
								</div>
							</div>
						</Card>
					)}

					{/* Payment Breakdown Chart Tab */}
					{activeTab === "chart" && (
						<Card>
							<div className="px-4 py-5 sm:p-6">
								<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
									Payment Breakdown
								</h3>

								<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
									<div>
										<h4 className="text-md font-medium text-gray-900 mb-2">
											Principal vs. Interest
										</h4>
										<div className="bg-gray-50 p-4 rounded-lg">
											<div className="flex items-center justify-between mb-2">
												<div className="flex items-center">
													<div className="w-3 h-3 bg-primary-500 rounded-full mr-2"></div>
													<span className="text-sm text-gray-500">
														Principal: {formatCurrency(watchAmount)}
													</span>
												</div>
												<span className="text-sm font-medium text-gray-900">
													{Math.round(
														(watchAmount /
															(watchAmount + emiResult.totalInterest)) *
															100,
													)}
													%
												</span>
											</div>
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													<div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
													<span className="text-sm text-gray-500">
														Interest: {formatCurrency(emiResult.totalInterest)}
													</span>
												</div>
												<span className="text-sm font-medium text-gray-900">
													{Math.round(
														(emiResult.totalInterest /
															(watchAmount + emiResult.totalInterest)) *
															100,
													)}
													%
												</span>
											</div>

											<div className="mt-4 h-6 bg-gray-200 rounded-full overflow-hidden">
												<div
													className="h-full bg-primary-500"
													style={{
														width: `${(watchAmount / (watchAmount + emiResult.totalInterest)) * 100}%`,
														float: "left",
													}}
													role="progressbar"
													aria-valuenow={
														(watchAmount /
															(watchAmount + emiResult.totalInterest)) *
														100
													}
													aria-valuemin={0}
													aria-valuemax={100}
												></div>
												<div
													className="h-full bg-red-500"
													style={{
														width: `${(emiResult.totalInterest / (watchAmount + emiResult.totalInterest)) * 100}%`,
														float: "left",
													}}
												></div>
											</div>
										</div>

										<div className="mt-6">
											<h4 className="text-md font-medium text-gray-900 mb-2">
												Monthly Payment
											</h4>
											<div className="bg-gray-50 p-4 rounded-lg">
												<p className="text-sm text-gray-500 mb-2">
													Your monthly EMI of {formatCurrency(emiResult.emi)}{" "}
													consists of:
												</p>

												{schedule.length > 0 && (
													<>
														<div className="flex items-center justify-between mb-2">
															<div className="flex items-center">
																<div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
																<span className="text-sm text-gray-500">
																	Principal component (first month):{" "}
																	{formatCurrency(schedule[0].principal)}
																</span>
															</div>
														</div>
														<div className="flex items-center justify-between">
															<div className="flex items-center">
																<div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
																<span className="text-sm text-gray-500">
																	Interest component (first month):{" "}
																	{formatCurrency(schedule[0].interest)}
																</span>
															</div>
														</div>

														<div className="mt-4 h-6 bg-gray-200 rounded-full overflow-hidden">
															<div
																className="h-full bg-green-500"
																style={{
																	width: `${(schedule[0].principal / schedule[0].amount) * 100}%`,
																	float: "left",
																}}
																role="progressbar"
																aria-valuenow={
																	(schedule[0].principal / schedule[0].amount) *
																	100
																}
																aria-valuemin={0}
																aria-valuemax={100}
															></div>
															<div
																className="h-full bg-yellow-500"
																style={{
																	width: `${(schedule[0].interest / schedule[0].amount) * 100}%`,
																	float: "left",
																}}
															></div>
														</div>
													</>
												)}
											</div>
										</div>
									</div>

									<div>
										<h4 className="text-md font-medium text-gray-900 mb-2">
											Payment Schedule Insights
										</h4>
										<div className="bg-gray-50 p-4 rounded-lg space-y-4">
											<p className="text-sm text-gray-700">
												<strong>Total Payments:</strong> {watchTenure} monthly
												payments of {formatCurrency(emiResult.emi)}
											</p>

											<p className="text-sm text-gray-700">
												<strong>First Payment Date:</strong>{" "}
												{formatDate(watchStartDate)}
											</p>

											<p className="text-sm text-gray-700">
												<strong>Last Payment Date:</strong>{" "}
												{schedule.length > 0 &&
													formatDate(schedule[schedule.length - 1].dueDate)}
											</p>

											<p className="text-sm text-gray-700">
												<strong>Interest-to-Principal Ratio:</strong>{" "}
												{(emiResult.totalInterest / watchAmount).toFixed(2)}
											</p>

											{watchInterestType === "DIMINISHING" && (
												<div className="pt-2 border-t border-gray-200">
													<p className="text-sm text-gray-700 font-medium mb-2">
														Principal-Interest Breakdown Over Time:
													</p>

													<div className="space-y-2">
														<div>
															<p className="text-xs text-gray-500">
																First Payment
															</p>
															<div className="h-4 bg-gray-200 rounded-full overflow-hidden">
																{schedule.length > 0 && (
																	<>
																		<div
																			className="h-full bg-green-500"
																			style={{
																				width: `${(schedule[0].principal / schedule[0].amount) * 100}%`,
																				float: "left",
																			}}
																		></div>
																		<div
																			className="h-full bg-yellow-500"
																			style={{
																				width: `${(schedule[0].interest / schedule[0].amount) * 100}%`,
																				float: "left",
																			}}
																		></div>
																	</>
																)}
															</div>
														</div>

														{schedule.length > Math.floor(watchTenure / 2) && (
															<div>
																<p className="text-xs text-gray-500">
																	Middle Payment
																</p>
																<div className="h-4 bg-gray-200 rounded-full overflow-hidden">
																	<div
																		className="h-full bg-green-500"
																		style={{
																			width: `${(schedule[Math.floor(watchTenure / 2)].principal / schedule[Math.floor(watchTenure / 2)].amount) * 100}%`,
																			float: "left",
																		}}
																	></div>
																	<div
																		className="h-full bg-yellow-500"
																		style={{
																			width: `${(schedule[Math.floor(watchTenure / 2)].interest / schedule[Math.floor(watchTenure / 2)].amount) * 100}%`,
																			float: "left",
																		}}
																	></div>
																</div>
															</div>
														)}

														{schedule.length > 0 && (
															<div>
																<p className="text-xs text-gray-500">
																	Last Payment
																</p>
																<div className="h-4 bg-gray-200 rounded-full overflow-hidden">
																	<div
																		className="h-full bg-green-500"
																		style={{
																			width: `${(schedule[schedule.length - 1].principal / schedule[schedule.length - 1].amount) * 100}%`,
																			float: "left",
																		}}
																	></div>
																	<div
																		className="h-full bg-yellow-500"
																		style={{
																			width: `${(schedule[schedule.length - 1].interest / schedule[schedule.length - 1].amount) * 100}%`,
																			float: "left",
																		}}
																	></div>
																</div>
															</div>
														)}
													</div>

													<div className="mt-2 flex items-center text-xs text-gray-500">
														<div className="flex items-center mr-4">
															<div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
															<span>Principal</span>
														</div>
														<div className="flex items-center">
															<div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
															<span>Interest</span>
														</div>
													</div>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						</Card>
					)}

					{/* Calculation History Tab */}
					{activeTab === "history" && (
						<Card>
							<div className="px-4 py-5 sm:p-6">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-medium leading-6 text-gray-900">
										Calculation History
									</h3>
									<Button
										variant="danger-outline"
										size="sm"
										onClick={handleClearHistory}
										disabled={
											isLoadingHistory || !calculationHistory?.data?.length
										}
									>
										Clear History
									</Button>
								</div>

								{isLoadingHistory || isLoadingStats ? (
									<div className="text-center py-8">
										<p className="text-gray-500">Loading history...</p>
									</div>
								) : (
									<>
										{calculationStats && (
											<div className="bg-gray-50 rounded-lg p-4 mb-6">
												<h4 className="text-md font-medium text-gray-900 mb-3">
													Statistics
												</h4>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
													<div>
														<p className="text-sm text-gray-500">
															Total Calculations
														</p>
														<p className="text-lg font-semibold text-gray-900">
															{calculationStats.totalCalculations}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">
															Average Loan Amount
														</p>
														<p className="text-lg font-semibold text-gray-900">
															{calculationStats.averages.amount
																? formatCurrency(
																		calculationStats.averages.amount,
																	)
																: "N/A"}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">
															Average Interest Rate
														</p>
														<p className="text-lg font-semibold text-gray-900">
															{calculationStats.averages.interestRate
																? `${calculationStats.averages.interestRate.toFixed(2)}%`
																: "N/A"}
														</p>
													</div>
													<div>
														<p className="text-sm text-gray-500">
															Average Tenure
														</p>
														<p className="text-lg font-semibold text-gray-900">
															{calculationStats.averages.tenure
																? `${Math.round(calculationStats.averages.tenure)} months`
																: "N/A"}
														</p>
													</div>
												</div>
											</div>
										)}

										{calculationHistory?.data &&
										calculationHistory.data.length > 0 ? (
											<div className="overflow-x-auto">
												<table className="min-w-full divide-y divide-gray-200">
													<thead className="bg-gray-50">
														<tr>
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
																Loan Amount
															</th>
															<th
																scope="col"
																className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
															>
																Tenure
															</th>
															<th
																scope="col"
																className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
															>
																Interest Rate
															</th>
															<th
																scope="col"
																className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
															>
																EMI
															</th>
															<th
																scope="col"
																className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
															>
																Total Interest
															</th>
														</tr>
													</thead>
													<tbody className="bg-white divide-y divide-gray-200">
														{calculationHistory.data.map((entry: any) => (
															<tr key={entry.id}>
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																	{new Date(
																		entry.calculatedAt,
																	).toLocaleString()}
																</td>
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																	{formatCurrency(entry.amount)}
																</td>
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																	{entry.tenure} months
																</td>
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																	{entry.interestRate}% (
																	{entry.interestType === "FLAT"
																		? "Flat"
																		: "Reducing"}
																	)
																</td>
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																	{formatCurrency(entry.emi)}
																</td>
																<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
																	{formatCurrency(entry.totalInterest)}
																</td>
															</tr>
														))}
													</tbody>
												</table>
											</div>
										) : (
											<div className="text-center py-8 bg-gray-50 rounded-lg">
												<ClockIcon className="h-12 w-12 mx-auto text-gray-400" />
												<h3 className="mt-2 text-sm font-medium text-gray-900">
													No calculation history
												</h3>
												<p className="mt-1 text-sm text-gray-500">
													Your calculation history will appear here after you
													use the calculator.
												</p>
											</div>
										)}

										{calculationHistory?.pagination?.pages &&
											calculationHistory.pagination.pages > 1 && (
												<div className="mt-4 flex justify-center">
													<nav
														className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px"
														aria-label="Pagination"
													>
														{Array.from({
															length: calculationHistory.pagination.pages,
														}).map((_, index) => (
															<button
																type="button"
																key={`page-${index + 1}`}
																onClick={() => {
																	if (user?.id) {
																		loanService
																			.getUserCalculationHistory(
																				user.id,
																				index + 1,
																			)
																			.then((data) => {
																				queryClient.setQueryData(
																					["calculationHistory", user.id],
																					data,
																				);
																			});
																	}
																}}
																className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
																	calculationHistory.pagination?.page ===
																	index + 1
																		? "z-10 bg-primary-50 border-primary-500 text-primary-600"
																		: "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
																}`}
															>
																{index + 1}
															</button>
														))}
													</nav>
												</div>
											)}
									</>
								)}
							</div>
						</Card>
					)}

					{/* Saved Presets Tab */}
					{activeTab === "presets" && (
						<Card>
							<div className="px-4 py-5 sm:p-6">
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-lg font-medium leading-6 text-gray-900">
										Saved Presets
									</h3>
									<Button
										variant="outline"
										size="sm"
										icon={<BookmarkIcon className="h-4 w-4 mr-1" />}
										onClick={() => setShowSavePresetModal(true)}
									>
										Save Current Settings
									</Button>
								</div>

								{isLoadingPresets ? (
									<div className="text-center py-8">
										<p className="text-gray-500">Loading presets...</p>
									</div>
								) : presets && presets.length > 0 ? (
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{presets.map((preset) => (
											<div
												key={preset.id}
												className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden ${
													preset.isDefault
														? "border-primary-500"
														: "border-gray-200"
												}`}
											>
												<div className="p-4">
													<div className="flex justify-between items-start">
														<h4 className="text-md font-medium text-gray-900 mb-1 truncate">
															{preset.name}
														</h4>
														{preset.isDefault && (
															<span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-100 text-primary-800">
																Default
															</span>
														)}
													</div>

													<p className="text-sm text-gray-500 mb-3">
														Created on{" "}
														{new Date(preset.createdAt).toLocaleDateString()}
													</p>

													<div className="space-y-2">
														<div className="flex justify-between">
															<span className="text-sm text-gray-500">
																Loan Amount:
															</span>
															<span className="text-sm font-medium text-gray-900">
																{formatCurrency(preset.amount)}
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-sm text-gray-500">
																Tenure:
															</span>
															<span className="text-sm font-medium text-gray-900">
																{preset.tenure} months
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-sm text-gray-500">
																Interest Rate:
															</span>
															<span className="text-sm font-medium text-gray-900">
																{preset.interestRate}%
															</span>
														</div>
														<div className="flex justify-between">
															<span className="text-sm text-gray-500">
																Interest Type:
															</span>
															<span className="text-sm font-medium text-gray-900">
																{preset.interestType === "FLAT"
																	? "Flat Rate"
																	: "Reducing Balance"}
															</span>
														</div>
														{preset.loanType && (
															<div className="flex justify-between">
																<span className="text-sm text-gray-500">
																	Loan Type:
																</span>
																<span className="text-sm font-medium text-gray-900">
																	{preset.loanType.name}
																</span>
															</div>
														)}
													</div>

													<div className="mt-4 flex justify-between">
														<Button
															variant="outline"
															size="sm"
															onClick={() => handleLoadPreset(preset)}
														>
															Load
														</Button>
														<Button
															variant="danger-outline"
															size="sm"
															onClick={() => handleDeletePreset(preset.id)}
														>
															Delete
														</Button>
													</div>
												</div>
											</div>
										))}
									</div>
								) : (
									<div className="text-center py-8 bg-gray-50 rounded-lg">
										<BookmarkIcon className="h-12 w-12 mx-auto text-gray-400" />
										<h3 className="mt-2 text-sm font-medium text-gray-900">
											No presets saved
										</h3>
										<p className="mt-1 text-sm text-gray-500">
											Save your calculator settings for quick access in the
											future.
										</p>
										<div className="mt-6">
											<Button
												variant="primary"
												size="sm"
												onClick={() => setShowSavePresetModal(true)}
											>
												Save Current Settings
											</Button>
										</div>
									</div>
								)}
							</div>
						</Card>
					)}
				</div>
			)}

			{/* Save Preset Modal */}
			{showSavePresetModal && (
				<div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
						<h3 className="text-lg font-medium text-gray-900 mb-4">
							Save Calculator Preset
						</h3>

						<div className="space-y-4">
							<div>
								<label
									htmlFor="presetName"
									className="block text-sm font-medium text-gray-700"
								>
									Preset Name
								</label>
								<input
									type="text"
									id="presetName"
									value={presetName}
									onChange={(e) => setPresetName(e.target.value)}
									className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
									placeholder="e.g., Home Loan 2024"
								/>
							</div>

							<div className="flex items-center">
								<input
									id="makeDefault"
									type="checkbox"
									checked={makeDefaultPreset}
									onChange={(e) => setMakeDefaultPreset(e.target.checked)}
									className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
								/>
								<label
									htmlFor="makeDefault"
									className="ml-2 block text-sm text-gray-900"
								>
									Make this my default preset
								</label>
							</div>

							<div className="bg-gray-50 p-3 rounded-md">
								<h4 className="text-sm font-medium text-gray-900 mb-2">
									Settings to be saved:
								</h4>
								<div className="space-y-1 text-sm text-gray-500">
									<p>Loan Amount: {formatCurrency(watch("amount"))}</p>
									<p>Tenure: {watch("tenure")} months</p>
									<p>Interest Rate: {watch("interestRate")}%</p>
									<p>
										Interest Type:{" "}
										{watch("interestType") === "FLAT"
											? "Flat Rate"
											: "Reducing Balance"}
									</p>
									{watch("loanTypeId") && loanTypes && (
										<p>
											Loan Type:{" "}
											{
												loanTypes.data?.find(
													(lt: any) => lt.id === watch("loanTypeId"),
												)?.name
											}
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="mt-5 sm:mt-6 flex justify-end space-x-3">
							<Button
								variant="outline"
								onClick={() => {
									setShowSavePresetModal(false);
									setPresetName("");
									setMakeDefaultPreset(false);
								}}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								onClick={handleSavePreset}
								disabled={!presetName.trim() || createPresetMutation.isLoading}
							>
								{createPresetMutation.isLoading ? "Saving..." : "Save Preset"}
							</Button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default LoanCalculator;
