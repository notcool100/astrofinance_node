import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SmsTemplatePreview from "@/components/sms/SmsTemplatePreview";
import Button from "@/components/common/Button";
import {
	getSmsTemplateById,
	sendTestSms,
	SmsTemplate,
} from "@/services/sms.service";
import { toast } from "react-hot-toast";
import Link from "next/link";

const SmsTemplateDetailPage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [template, setTemplate] = useState<SmsTemplate | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchTemplate = async () => {
			if (!id) return;

			try {
				setLoading(true);
				const templateData = await getSmsTemplateById(id as string);
				setTemplate(templateData);
			} catch (error) {
				console.error("Failed to fetch template:", error);
				toast.error("Failed to load template");
				router.push("/admin/sms");
			} finally {
				setLoading(false);
			}
		};

		fetchTemplate();
	}, [id, router]);

	const handleSendTest = async (
		phoneNumber: string,
		variables: Record<string, string>,
	) => {
		if (!template) return;

		try {
			await sendTestSms({
				to: phoneNumber,
				templateId: template.id,
				variables,
			});
			toast.success("Test SMS sent successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to send test SMS");
		}
	};

	if (loading) {
		return (
			<ProtectedRoute adminOnly>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center">Loading...</div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	if (!template) {
		return (
			<ProtectedRoute adminOnly>
				<MainLayout>
					<div className="px-4 sm:px-6 lg:px-8 py-8">
						<div className="text-center text-red-600">Template not found</div>
					</div>
				</MainLayout>
			</ProtectedRoute>
		);
	}

	return (
		<ProtectedRoute adminOnly>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-6">
						<div className="flex justify-between items-start">
							<div>
								<h1 className="text-2xl font-semibold text-gray-900">
									{template.name}
								</h1>
								<p className="mt-2 text-sm text-gray-700">
									Category:{" "}
									<span className="font-medium">{template.category}</span>
								</p>
							</div>
							<div className="flex space-x-3">
								<Link href={`/admin/sms/${template.id}/edit`}>
									<Button variant="secondary">Edit Template</Button>
								</Link>
								<Link href="/admin/sms">
									<Button variant="outline">Back to Templates</Button>
								</Link>
							</div>
						</div>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{/* Template Details */}
						<div className="space-y-6">
							<div className="bg-white shadow rounded-lg p-6">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Template Details
								</h3>
								<dl className="space-y-3">
									<div>
										<dt className="text-sm font-medium text-gray-500">Name</dt>
										<dd className="text-sm text-gray-900">{template.name}</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Category
										</dt>
										<dd className="text-sm text-gray-900">
											<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
												{template.category}
											</span>
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Status
										</dt>
										<dd className="text-sm text-gray-900">
											<span
												className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
													template.isActive
														? "bg-green-100 text-green-800"
														: "bg-red-100 text-red-800"
												}`}
											>
												{template.isActive ? "Active" : "Inactive"}
											</span>
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Character Count
										</dt>
										<dd className="text-sm text-gray-900">
											{template.characterCount}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Created
										</dt>
										<dd className="text-sm text-gray-900">
											{new Date(template.createdAt).toLocaleDateString()}
										</dd>
									</div>
									<div>
										<dt className="text-sm font-medium text-gray-500">
											Last Updated
										</dt>
										<dd className="text-sm text-gray-900">
											{new Date(template.updatedAt).toLocaleDateString()}
										</dd>
									</div>
								</dl>
							</div>

							{/* Raw Content */}
							<div className="bg-white shadow rounded-lg p-6">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									Raw Content
								</h3>
								<div className="bg-gray-50 p-4 rounded-md">
									<pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">
										{template.content}
									</pre>
								</div>
							</div>

							{/* Variables */}
							{template.variables &&
								Object.keys(template.variables).length > 0 && (
									<div className="bg-white shadow rounded-lg p-6">
										<h3 className="text-lg font-medium text-gray-900 mb-4">
											Variables
										</h3>
										<div className="space-y-2">
											{Object.entries(template.variables).map(
												([key, label]) => (
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
													</div>
												),
											)}
										</div>
									</div>
								)}
						</div>

						{/* Preview and Test */}
						<div>
							<SmsTemplatePreview
								content={template.content}
								variables={template.variables || {}}
								onSendTest={handleSendTest}
							/>
						</div>
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

export default SmsTemplateDetailPage;
