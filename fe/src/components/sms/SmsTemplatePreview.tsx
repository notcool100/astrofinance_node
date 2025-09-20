import React, { useState, useEffect, useCallback } from "react";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";

interface SmsTemplatePreviewProps {
	content: string;
	variables: Record<string, string>;
	onSendTest?: (phoneNumber: string, variables: Record<string, string>) => void;
}

const SmsTemplatePreview: React.FC<SmsTemplatePreviewProps> = ({
	content,
	variables,
	onSendTest,
}) => {
	const [previewValues, setPreviewValues] = useState<Record<string, string>>(
		{},
	);
	const [phoneNumber, setPhoneNumber] = useState("");
	const [sending, setSending] = useState(false);

	const getSampleValue = useCallback((key: string): string => {
		const sampleData: Record<string, string> = {
			name: "John Doe",
			accountNumber: "ACC001234567",
			balance: "25,000.00",
			amount: "5,000.00",
			date: "2024-01-15",
			time: "10:30 AM",
			transactionType: "Deposit",
			loanNumber: "LOAN001234567",
			emiAmount: "2,500.00",
			dueDate: "2024-02-15",
			applicationNumber: "APP001234567",
			interestRate: "12.5%",
			tenure: "24",
			offer: "Special 2% interest rate",
			validUntil: "2024-03-31",
			contactNumber: "+977-1-2345678",
			systemMessage: "System maintenance scheduled",
		};
		return sampleData[key] || `Sample ${key}`;
	}, []);

	useEffect(() => {
		// Initialize preview values with sample data
		const sampleValues: Record<string, string> = {};
		Object.keys(variables).forEach((key) => {
			sampleValues[key] = getSampleValue(key);
		});
		setPreviewValues(sampleValues);
	}, [variables, getSampleValue]);

	const renderPreview = () => {
		let previewContent = content;
		Object.entries(previewValues).forEach(([key, value]) => {
			previewContent = previewContent.replace(
				new RegExp(`\\{\\{${key}\\}\\}`, "g"),
				value,
			);
		});
		return previewContent;
	};

	const handleVariableChange = (key: string, value: string) => {
		setPreviewValues((prev) => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSendTest = async () => {
		if (!phoneNumber.trim()) {
			alert("Please enter a phone number");
			return;
		}

		if (onSendTest) {
			try {
				setSending(true);
				await onSendTest(phoneNumber, previewValues);
			} catch (error) {
				console.error("Failed to send test SMS:", error);
			} finally {
				setSending(false);
			}
		}
	};

	const getCharacterCount = () => {
		return renderPreview().length;
	};

	const getSmsCount = () => {
		const length = renderPreview().length;
		if (length <= 160) return 1;
		if (length <= 306) return 2;
		if (length <= 459) return 3;
		return Math.ceil(length / 153);
	};

	return (
		<div className="space-y-4">
			{/* Preview */}
			<Card>
				<div className="space-y-4">
					<div className="flex justify-between items-center">
						<h3 className="text-lg font-medium text-gray-900">Preview</h3>
						<div className="text-sm text-gray-500">
							{getCharacterCount()} characters • {getSmsCount()} SMS
						</div>
					</div>

					<div className="p-4 bg-gray-50 border border-gray-300 rounded-md">
						<div className="whitespace-pre-wrap text-gray-900 font-mono text-sm">
							{renderPreview()}
						</div>
					</div>
				</div>
			</Card>

			{/* Variable Values */}
			{Object.keys(variables).length > 0 && (
				<Card>
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Variable Values
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{Object.entries(variables).map(([key, label]) => (
							<div key={key}>
								<label
									htmlFor={`variable-${key}`}
									className="block text-sm font-medium text-gray-700 mb-1"
								>
									{label}
								</label>
								<input
									id={`variable-${key}`}
									type="text"
									value={previewValues[key] || ""}
									onChange={(e) => handleVariableChange(key, e.target.value)}
									className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
									placeholder={`Enter ${label.toLowerCase()}`}
								/>
							</div>
						))}
					</div>
				</Card>
			)}

			{/* Test SMS */}
			<Card>
				<h3 className="text-lg font-medium text-gray-900 mb-4">
					Send Test SMS
				</h3>
				<div className="space-y-4">
					<div>
						<label
							htmlFor="phone-number"
							className="block text-sm font-medium text-gray-700 mb-1"
						>
							Phone Number
						</label>
						<input
							id="phone-number"
							type="tel"
							value={phoneNumber}
							onChange={(e) => setPhoneNumber(e.target.value)}
							className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							placeholder="+977-XXXXXXXXX"
						/>
					</div>

					<Button
						variant="primary"
						onClick={handleSendTest}
						disabled={sending || !phoneNumber.trim()}
						className="w-full"
					>
						{sending ? "Sending..." : "Send Test SMS"}
					</Button>
				</div>
			</Card>
		</div>
	);
};

export default SmsTemplatePreview;
