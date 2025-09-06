import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SmsTemplateEditor from "@/components/sms/SmsTemplateEditor";
import SmsTemplatePreview from "@/components/sms/SmsTemplatePreview";
import Card from "@/components/common/Card";

const SmsTemplateDemoPage: React.FC = () => {
	const [content, setContent] = useState(
		"Dear {{name}}, your account {{accountNumber}} has been credited with Rs. {{amount}} on {{date}}. Available balance: Rs. {{balance}}.",
	);
	const [variables, setVariables] = useState<Record<string, string>>({
		name: "User Name",
		accountNumber: "Account Number",
		amount: "Amount",
		date: "Date",
		balance: "Balance",
	});

	const handleContentChange = (
		newContent: string,
		newVariables: Record<string, string>,
	) => {
		setContent(newContent);
		setVariables(newVariables);
	};

	return (
		<ProtectedRoute adminOnly>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-6">
						<h1 className="text-2xl font-semibold text-gray-900">
							SMS Template Demo
						</h1>
						<p className="mt-2 text-sm text-gray-700">
							This is a demonstration of the WYSIWYG SMS template editor with
							dynamic placeholders.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Editor */}
						<div>
							<Card>
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Template Editor
								</h3>
								<SmsTemplateEditor
									initialContent={content}
									initialVariables={variables}
									onContentChange={handleContentChange}
									categories={[
										"Account",
										"Transaction",
										"Loan",
										"Marketing",
										"System",
									]}
									smsEvents={[]}
								/>
							</Card>
						</div>

						{/* Preview */}
						<div>
							<Card>
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Live Preview
								</h3>
								<SmsTemplatePreview content={content} variables={variables} />
							</Card>
						</div>
					</div>

					{/* Features */}
					<div className="mt-8">
						<Card>
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								Features
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								<div className="p-4 bg-blue-50 rounded-lg">
									<h4 className="font-medium text-blue-900 mb-2">
										Dynamic Variables
									</h4>
									<p className="text-sm text-blue-700">
										Insert dynamic placeholders like{" "}
										{`{{ name }}, {{ amount }}`} that get replaced with actual
										values.
									</p>
								</div>
								<div className="p-4 bg-green-50 rounded-lg">
									<h4 className="font-medium text-green-900 mb-2">
										Live Preview
									</h4>
									<p className="text-sm text-green-700">
										See exactly how your SMS will look with sample data in
										real-time.
									</p>
								</div>
								<div className="p-4 bg-purple-50 rounded-lg">
									<h4 className="font-medium text-purple-900 mb-2">
										Character Count
									</h4>
									<p className="text-sm text-purple-700">
										Track character count and SMS segments to optimize message
										length.
									</p>
								</div>
								<div className="p-4 bg-yellow-50 rounded-lg">
									<h4 className="font-medium text-yellow-900 mb-2">
										Category-based Variables
									</h4>
									<p className="text-sm text-yellow-700">
										Different variable sets for Account, Transaction, Loan,
										Marketing, and System messages.
									</p>
								</div>
								<div className="p-4 bg-red-50 rounded-lg">
									<h4 className="font-medium text-red-900 mb-2">Test SMS</h4>
									<p className="text-sm text-red-700">
										Send test SMS messages to verify templates before using them
										in production.
									</p>
								</div>
								<div className="p-4 bg-indigo-50 rounded-lg">
									<h4 className="font-medium text-indigo-900 mb-2">
										WYSIWYG Editing
									</h4>
									<p className="text-sm text-indigo-700">
										What You See Is What You Get - edit templates with a
										user-friendly interface.
									</p>
								</div>
							</div>
						</Card>
					</div>
				</div>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default SmsTemplateDemoPage;
