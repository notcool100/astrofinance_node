import React, { useState } from "react";
import { useRouter } from "next/router";
import { useQuery } from "react-query";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import loanService, { LoanApplication } from "@/services/loanService";
import {
	ArrowLeftIcon,
	DocumentTextIcon,
	CheckCircleIcon,
	PrinterIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

const LoanAgreementPage = () => {
	const router = useRouter();
	const { id } = router.query;
	const [isAccepting, setIsAccepting] = useState(false);
	const [hasAccepted, setHasAccepted] = useState(false);
	const [termsAccepted, setTermsAccepted] = useState(false);

	// Fetch loan application details
	const { data: application, isLoading } = useQuery(
		["loanApplication", id],
		() => loanService.getLoanApplicationById(id as string),
		{
			enabled: !!id,
			onError: (error) => {
				toast.error("Failed to load application details");
				console.error("Error fetching application:", error);
			},
		},
	);

	// Mock data for now
	const mockApplication: LoanApplication = {
		id: (id as string) || "LA-1001",
		applicationNumber: "APP-1001",
		userId: "user-1",
		loanTypeId: "1",
		amount: 10000,
		tenure: 12,
		purpose: "Home renovation",
		status: "APPROVED",
		appliedDate: "2023-12-01T10:30:00Z",
		approvedDate: "2023-12-03T14:45:00Z",
		createdAt: "2023-12-01T10:30:00Z",
		updatedAt: "2023-12-03T14:45:00Z",
		loanType: {
			id: "1",
			name: "Personal Loan",
			code: "PL",
			interestType: "FLAT",
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

	const applicationData = application || mockApplication;

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

	// Calculate EMI
	const calculateEMI = () => {
		if (!applicationData.loanType) return 0;

		const principal = applicationData.amount;
		const ratePerMonth = applicationData.loanType.interestRate / 12 / 100;
		const tenure = applicationData.tenure;

		if (applicationData.loanType.interestType === "FLAT") {
			// Flat rate calculation
			const totalInterest =
				((principal * applicationData.loanType.interestRate) / 100) *
				(tenure / 12);
			return (principal + totalInterest) / tenure;
		} else {
			// Diminishing balance calculation
			return (
				(principal * ratePerMonth * Math.pow(1 + ratePerMonth, tenure)) /
				(Math.pow(1 + ratePerMonth, tenure) - 1)
			);
		}
	};

	const emi = calculateEMI();
	const totalInterest = emi * applicationData.tenure - applicationData.amount;
	const totalAmount = emi * applicationData.tenure;
	const processingFee = applicationData.amount * 0.01; // Assuming 1% processing fee

	const handleAcceptOffer = async () => {
		if (!termsAccepted) {
			toast.error("Please accept the terms and conditions");
			return;
		}

		setIsAccepting(true);
		try {
			// In a real implementation, we would call the API
			// await loanService.acceptLoanOffer(id as string);

			// Mock success
			await new Promise((resolve) => setTimeout(resolve, 1500));

			setHasAccepted(true);
			toast.success("Loan offer accepted successfully!");

			// Redirect to documents upload page after a delay
			setTimeout(() => {
				router.push(`/loans/applications/${id}/documents`);
			}, 3000);
		} catch (error) {
			toast.error("Failed to accept loan offer");
			console.error("Error accepting loan offer:", error);
		} finally {
			setIsAccepting(false);
		}
	};

	const handlePrint = () => {
		window.print();
	};

	if (isLoading) {
		return (
			<ProtectedRoute>
				<MainLayout title="Loan Agreement">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute>
			<MainLayout title="Loan Agreement">
				<div className="space-y-6">
					<div className="flex justify-between items-center">
						<div className="flex items-center">
							<Button
								variant="secondary"
								className="mr-4 print:hidden"
								onClick={() => router.push(`/loans/applications/${id}`)}
							>
								<ArrowLeftIcon className="h-5 w-5 mr-1" />
								Back to Application
							</Button>
							<h1 className="text-2xl font-semibold text-gray-900">
								Loan Agreement
							</h1>
						</div>
						<div className="print:hidden">
							<Button
								variant="secondary"
								icon={<PrinterIcon className="h-5 w-5 mr-1" />}
								onClick={handlePrint}
							>
								Print
							</Button>
						</div>
					</div>

					{hasAccepted ? (
						<Card>
							<div className="px-4 py-5 sm:p-6 text-center">
								<div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
									<CheckCircleIcon
										className="h-6 w-6 text-green-600"
										aria-hidden="true"
									/>
								</div>
								<h3 className="mt-3 text-lg font-medium text-gray-900">
									Loan Offer Accepted
								</h3>
								<div className="mt-2">
									<p className="text-sm text-gray-500">
										You have successfully accepted the loan offer. Please upload
										the required documents to proceed with the loan
										disbursement.
									</p>
									<p className="mt-4 text-sm text-gray-500">
										You will be redirected to the document upload page
										shortly...
									</p>
								</div>
							</div>
						</Card>
					) : (
						<>
							<Card>
								<div className="px-4 py-5 sm:p-6">
									<div className="flex justify-between items-center mb-6">
										<h3 className="text-lg font-medium leading-6 text-gray-900">
											Loan Offer Details
										</h3>
										<div className="text-sm text-gray-500">
											Application ID:{" "}
											<span className="font-medium">
												{applicationData.applicationNumber}
											</span>
										</div>
									</div>

									<div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Loan Type
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{applicationData.loanType?.name || "N/A"}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Loan Amount
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{formatCurrency(applicationData.amount)}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Interest Rate
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{applicationData.loanType?.interestRate}% per annum
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Interest Type
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{applicationData.loanType?.interestType === "FLAT"
													? "Flat Rate"
													: "Reducing Balance"}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Tenure
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{applicationData.tenure} months
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Monthly EMI
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{formatCurrency(emi)}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Processing Fee (1%)
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{formatCurrency(processingFee)}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Net Disbursement Amount
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{formatCurrency(applicationData.amount - processingFee)}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Total Interest
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{formatCurrency(totalInterest)}
											</dd>
										</div>
										<div>
											<dt className="text-sm font-medium text-gray-500">
												Total Amount Payable
											</dt>
											<dd className="mt-1 text-sm text-gray-900">
												{formatCurrency(totalAmount)}
											</dd>
										</div>
									</div>
								</div>
							</Card>

							<Card>
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
										Loan Agreement Terms
									</h3>

									<div className="prose prose-sm max-w-none text-gray-500">
										<h4>1. Loan Details</h4>
										<p>
											AstroFinance (hereinafter referred to as "the Lender")
											agrees to provide a loan to the Borrower under the
											following terms and conditions:
										</p>
										<ul>
											<li>
												Loan Amount: {formatCurrency(applicationData.amount)}
											</li>
											<li>Loan Type: {applicationData.loanType?.name}</li>
											<li>
												Interest Rate: {applicationData.loanType?.interestRate}%
												per annum (
												{applicationData.loanType?.interestType === "FLAT"
													? "Flat Rate"
													: "Reducing Balance"}
												)
											</li>
											<li>Tenure: {applicationData.tenure} months</li>
											<li>Monthly EMI: {formatCurrency(emi)}</li>
											<li>
												Processing Fee: {formatCurrency(processingFee)} (1% of
												loan amount)
											</li>
										</ul>

										<h4>2. Repayment</h4>
										<p>
											The Borrower agrees to repay the loan in{" "}
											{applicationData.tenure} equal monthly installments of{" "}
											{formatCurrency(emi)} each, starting from the date of
											disbursement. The repayment shall be made on or before the
											due date of each month.
										</p>

										<h4>3. Late Payment</h4>
										<p>
											In case of late payment, a penalty of 2% per month on the
											overdue amount will be charged. Repeated late payments may
											result in the loan being recalled and/or affect the
											Borrower's credit score.
										</p>

										<h4>4. Prepayment</h4>
										<p>
											The Borrower may prepay the loan in part or in full before
											the end of the tenure. A prepayment fee of 2% on the
											prepaid amount may be applicable if prepayment is made
											within 6 months of loan disbursement.
										</p>

										<h4>5. Default</h4>
										<p>
											If the Borrower defaults on three consecutive EMI
											payments, the entire loan amount along with interest and
											penalties shall become due and payable immediately. The
											Lender reserves the right to take appropriate legal action
											to recover the dues.
										</p>

										<h4>6. Disbursement</h4>
										<p>
											The loan amount, after deducting the processing fee, will
											be disbursed to the Borrower's bank account provided
											during the application process, subject to verification of
											all required documents.
										</p>

										<h4>7. Governing Law</h4>
										<p>
											This agreement shall be governed by and construed in
											accordance with the laws of the jurisdiction where the
											Lender operates.
										</p>
									</div>
								</div>
							</Card>

							<Card className="print:hidden">
								<div className="px-4 py-5 sm:p-6">
									<h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
										Accept Loan Offer
									</h3>

									<div className="space-y-4">
										<div className="relative flex items-start">
											<div className="flex h-5 items-center">
												<input
													id="terms"
													name="terms"
													type="checkbox"
													className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
													checked={termsAccepted}
													onChange={(e) => setTermsAccepted(e.target.checked)}
												/>
											</div>
											<div className="ml-3 text-sm">
												<label
													htmlFor="terms"
													className="font-medium text-gray-700"
												>
													I accept the terms and conditions
												</label>
												<p className="text-gray-500">
													By checking this box, I confirm that I have read,
													understood, and agree to the terms and conditions of
													this loan agreement. I acknowledge that this
													constitutes a legally binding agreement between myself
													and AstroFinance.
												</p>
											</div>
										</div>

										<div className="flex justify-end">
											<Button
												variant="primary"
												icon={<CheckCircleIcon className="h-5 w-5 mr-1" />}
												onClick={handleAcceptOffer}
												isLoading={isAccepting}
												disabled={!termsAccepted}
											>
												Accept Loan Offer
											</Button>
										</div>
									</div>
								</div>
							</Card>
						</>
					)}
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default LoanAgreementPage;
