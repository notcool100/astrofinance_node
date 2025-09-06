import React, { useState, useRef, useEffect } from "react";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

interface SmsTemplateEditorProps {
	initialContent?: string;
	initialVariables?: Record<string, string>;
	initialName?: string;
	initialCategory?: string;
	initialEvent?: string;
	initialActive?: boolean;
	onContentChange?: (
		content: string,
		variables: Record<string, string>,
	) => void;
	onSave?: (data: {
		name: string;
		content: string;
		variables: Record<string, string>;
		category: string;
		smsEventId?: string;
		isActive: boolean;
	}) => void;
	isEditing?: boolean;
	categories?: string[];
	smsEvents?: Array<{ id: string; eventCode: string; description: string }>;
}

interface Variable {
	key: string;
	label: string;
	description?: string;
}

const SmsTemplateEditor: React.FC<SmsTemplateEditorProps> = ({
	initialContent = "",
	initialVariables = {},
	initialName = "",
	initialCategory = "",
	initialEvent = "",
	initialActive = true,
	onContentChange,
	onSave,
	isEditing = false,
	categories = ["Account", "Transaction", "Loan", "Marketing", "System"],
	smsEvents = [],
}) => {
	const [content, setContent] = useState(initialContent);
	const [variables, setVariables] =
		useState<Record<string, string>>(initialVariables);
	const [templateName, setTemplateName] = useState(initialName);
	const [selectedCategory, setSelectedCategory] = useState(initialCategory);
	const [selectedEvent, setSelectedEvent] = useState(initialEvent);
	const [isActive, setIsActive] = useState(initialActive);
	const [previewMode, setPreviewMode] = useState(false);
	const [previewValues, setPreviewValues] = useState<Record<string, string>>(
		{},
	);
	const [showVariablePanel, setShowVariablePanel] = useState(false);

	const editorRef = useRef<HTMLTextAreaElement>(null);

	// Predefined variables for different categories
	const predefinedVariables: Record<string, Variable[]> = {
		Account: [
			{ key: "name", label: "User Name", description: "Full name of the user" },
			{
				key: "accountNumber",
				label: "Account Number",
				description: "User account number",
			},
			{
				key: "balance",
				label: "Account Balance",
				description: "Current account balance",
			},
			{ key: "date", label: "Date", description: "Current date" },
			{ key: "time", label: "Time", description: "Current time" },
		],
		Transaction: [
			{ key: "name", label: "User Name", description: "Full name of the user" },
			{
				key: "accountNumber",
				label: "Account Number",
				description: "User account number",
			},
			{ key: "amount", label: "Amount", description: "Transaction amount" },
			{
				key: "balance",
				label: "Balance",
				description: "Account balance after transaction",
			},
			{ key: "date", label: "Date", description: "Transaction date" },
			{ key: "time", label: "Time", description: "Transaction time" },
			{
				key: "transactionType",
				label: "Transaction Type",
				description: "Type of transaction (Deposit/Withdrawal)",
			},
		],
		Loan: [
			{ key: "name", label: "User Name", description: "Full name of the user" },
			{
				key: "loanNumber",
				label: "Loan Number",
				description: "Loan account number",
			},
			{ key: "amount", label: "Loan Amount", description: "Loan amount" },
			{
				key: "emiAmount",
				label: "EMI Amount",
				description: "Monthly EMI amount",
			},
			{ key: "dueDate", label: "Due Date", description: "EMI due date" },
			{
				key: "applicationNumber",
				label: "Application Number",
				description: "Loan application number",
			},
			{
				key: "interestRate",
				label: "Interest Rate",
				description: "Loan interest rate",
			},
			{ key: "tenure", label: "Tenure", description: "Loan tenure in months" },
		],
		Marketing: [
			{ key: "name", label: "User Name", description: "Full name of the user" },
			{ key: "offer", label: "Offer", description: "Special offer details" },
			{
				key: "validUntil",
				label: "Valid Until",
				description: "Offer validity date",
			},
			{
				key: "contactNumber",
				label: "Contact Number",
				description: "Contact number for queries",
			},
		],
		System: [
			{ key: "name", label: "User Name", description: "Full name of the user" },
			{
				key: "systemMessage",
				label: "System Message",
				description: "System generated message",
			},
			{ key: "date", label: "Date", description: "Current date" },
			{ key: "time", label: "Time", description: "Current time" },
		],
	};

	const availableVariables = selectedCategory
		? predefinedVariables[selectedCategory] || []
		: [];

	useEffect(() => {
		if (onContentChange) {
			onContentChange(content, variables);
		}
	}, [content, variables, onContentChange]);

	const insertVariable = (variable: Variable) => {
		const placeholder = `{{${variable.key}}}`;
		const textarea = editorRef.current;

		if (textarea) {
			const start = textarea.selectionStart;
			const end = textarea.selectionEnd;
			const newContent =
				content.substring(0, start) + placeholder + content.substring(end);

			setContent(newContent);

			// Update variables if not already present
			if (!variables[variable.key]) {
				setVariables((prev: Record<string, string>) => ({
					...prev,
					[variable.key]: variable.label,
				}));
			}

			// Set cursor position after the inserted placeholder
			setTimeout(() => {
				textarea.focus();
				textarea.setSelectionRange(
					start + placeholder.length,
					start + placeholder.length,
				);
			}, 0);
		}
	};

	const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newContent = e.target.value;
		setContent(newContent);

		// Extract variables from content
		const variableMatches = newContent.match(/\{\{(\w+)\}\}/g);
		if (variableMatches) {
			const extractedVariables: Record<string, string> = {};
			variableMatches.forEach((match: string) => {
				const key = match.replace(/\{\{|\}\}/g, "");
				extractedVariables[key] = variables[key] || key;
			});
			setVariables(extractedVariables);
		}
	};

	const handlePreview = () => {
		setPreviewMode(!previewMode);
		if (!previewMode) {
			// Initialize preview values with sample data
			const sampleValues: Record<string, string> = {};
			Object.keys(variables).forEach((key) => {
				sampleValues[key] = getSampleValue(key);
			});
			setPreviewValues(sampleValues);
		}
	};

	const getSampleValue = (key: string): string => {
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
	};

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

	const getCharacterCount = () => {
		return content.length;
	};

	const getSmsCount = () => {
		// Standard SMS is 160 characters, but can be longer with concatenation
		const length = content.length;
		if (length <= 160) return 1;
		if (length <= 306) return 2; // 153 characters per SMS in concatenated mode
		if (length <= 459) return 3;
		return Math.ceil(length / 153);
	};

	const handleSave = () => {
		if (onSave) {
			onSave({
				name: templateName,
				content,
				variables,
				category: selectedCategory,
				smsEventId: selectedEvent || undefined,
				isActive,
			});
		}
	};

	return (
		<div className="space-y-6">
			{/* Template Configuration */}
			<Card>
				<div className="space-y-4">
					<h3 className="text-lg font-medium text-gray-900">
						Template Configuration
					</h3>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label
								htmlFor="template-name"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Template Name
							</label>
							<input
								id="template-name"
								type="text"
								value={templateName}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setTemplateName(e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
								placeholder="Enter template name"
							/>
						</div>

						<div>
							<label
								htmlFor="template-category"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								Category
							</label>
							<select
								id="template-category"
								value={selectedCategory}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
									setSelectedCategory(e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select category</option>
								{categories.map((category) => (
									<option key={category} value={category}>
										{category}
									</option>
								))}
							</select>
						</div>

						<div>
							<label
								htmlFor="template-event"
								className="block text-sm font-medium text-gray-700 mb-1"
							>
								SMS Event
							</label>
							<select
								id="template-event"
								value={selectedEvent}
								onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
									setSelectedEvent(e.target.value)
								}
								className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
							>
								<option value="">Select event</option>
								{smsEvents.map((event) => (
									<option key={event.id} value={event.id}>
										{event.eventCode} - {event.description}
									</option>
								))}
							</select>
						</div>

						<div className="flex items-center">
							<input
								type="checkbox"
								id="isActive"
								checked={isActive}
								onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
									setIsActive(e.target.checked)
								}
								className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
							/>
							<label
								htmlFor="isActive"
								className="ml-2 block text-sm text-gray-900"
							>
								Active
							</label>
						</div>
					</div>
				</div>
			</Card>

			{/* Editor Section */}
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				{/* Editor */}
				<div className="lg:col-span-2">
					<Card>
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<h3 className="text-lg font-medium text-gray-900">
									Message Content
								</h3>
								<div className="flex space-x-2">
									<Button
										type="button"
										variant="secondary"
										onClick={() => setShowVariablePanel(!showVariablePanel)}
									>
										{showVariablePanel ? "Hide" : "Show"} Variables
									</Button>
									<Button
										type="button"
										variant="secondary"
										onClick={handlePreview}
									>
										{previewMode ? "Edit" : "Preview"}
									</Button>
								</div>
							</div>

							{previewMode ? (
								<div className="min-h-[200px] p-4 bg-gray-50 border border-gray-300 rounded-md">
									<div className="whitespace-pre-wrap text-gray-900">
										{renderPreview()}
									</div>
								</div>
							) : (
								<div className="space-y-2">
									<textarea
										ref={editorRef}
										value={content}
										onChange={handleContentChange}
										className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
										placeholder="Type your SMS message here... Use the variables panel to insert dynamic placeholders."
									/>

									<div className="flex justify-between text-sm text-gray-500">
										<span>Characters: {getCharacterCount()}</span>
										<span>SMS Count: {getSmsCount()}</span>
									</div>
								</div>
							)}

							{/* Variable Panel */}
							{showVariablePanel && !previewMode && (
								<div className="border-t pt-4">
									<h4 className="text-sm font-medium text-gray-700 mb-2">
										Available Variables
									</h4>
									<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
										{availableVariables.map((variable) => (
											<button
												key={variable.key}
												type="button"
												onClick={() => insertVariable(variable)}
												className="text-left p-2 text-sm bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors"
												title={variable.description}
											>
												<div className="font-medium text-blue-900">
													{variable.label}
												</div>
												<div className="text-blue-600">
													{"{{" + variable.key + "}}"}
												</div>
											</button>
										))}
									</div>
								</div>
							)}
						</div>
					</Card>
				</div>

				{/* Variables and Actions */}
				<div className="space-y-4">
					{/* Current Variables */}
					<Card>
						<h3 className="text-lg font-medium text-gray-900 mb-3">
							Used Variables
						</h3>
						{Object.keys(variables).length === 0 ? (
							<p className="text-sm text-gray-500">No variables used yet</p>
						) : (
							<div className="space-y-2">
								{Object.entries(variables).map(([key, label]) => (
									<div
										key={key}
										className="flex justify-between items-center p-2 bg-gray-50 rounded"
									>
										<div>
											<div className="text-sm font-medium text-gray-900">
												{label}
											</div>
											<div className="text-xs text-gray-500">
												{"{{" + key + "}}"}
											</div>
										</div>
										<button
											type="button"
											onClick={() => {
												const newVariables = { ...variables };
												delete newVariables[key];
												setVariables(newVariables);
												setContent(
													content.replace(
														new RegExp(`\\{\\{${key}\\}\\}`, "g"),
														"",
													),
												);
											}}
											className="text-red-500 hover:text-red-700 text-xs"
										>
											Remove
										</button>
									</div>
								))}
							</div>
						)}
					</Card>

					{/* Actions */}
					<Card>
						<div className="space-y-3">
							<Button
								type="button"
								variant="primary"
								onClick={handleSave}
								className="w-full"
								disabled={!templateName || !content.trim()}
							>
								{isEditing ? "Update Template" : "Create Template"}
							</Button>

							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setContent("");
									setVariables({});
									setTemplateName("");
									setSelectedCategory("");
									setSelectedEvent("");
								}}
								className="w-full"
							>
								Clear All
							</Button>
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default SmsTemplateEditor;
