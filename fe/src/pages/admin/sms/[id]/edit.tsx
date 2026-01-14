import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SmsTemplateEditor from "@/components/sms/SmsTemplateEditor";
import {
	getSmsTemplateById,
	updateSmsTemplate,
	getSmsEvents,
	SmsTemplate,
	SmsEvent,
} from "@/services/sms.service";
import { toast } from "react-hot-toast";

const EditSmsTemplatePage: React.FC = () => {
	const router = useRouter();
	const { id } = router.query;
	const [loading, setLoading] = useState(false);
	const [template, setTemplate] = useState<SmsTemplate | null>(null);
	const [smsEvents, setSmsEvents] = useState<SmsEvent[]>([]);
	const [loadingData, setLoadingData] = useState(true);

	useEffect(() => {
		const fetchData = async () => {
			if (!id) return;

			try {
				setLoadingData(true);
				const [templateData, eventsData] = await Promise.all([
					getSmsTemplateById(id as string),
					getSmsEvents(),
				]);

				setTemplate(templateData);
				setSmsEvents(eventsData);
			} catch (error) {
				console.error("Failed to fetch data:", error);
				toast.error("Failed to load template data");
				router.push("/admin/sms");
			} finally {
				setLoadingData(false);
			}
		};

		fetchData();
	}, [id, router]);

	const handleSave = async (data: {
		name: string;
		content: string;
		variables: Record<string, string>;
		category: string;
		smsEventId?: string;
		isActive: boolean;
	}) => {
		if (!template) return;

		try {
			setLoading(true);

			await updateSmsTemplate(template.id, {
				name: data.name,
				content: data.content,
				variables: data.variables,
				category: data.category,
				smsEventId: data.smsEventId,
				isActive: data.isActive,
			});

			toast.success("SMS template updated successfully");
			router.push("/admin/sms");
		} catch (error: any) {
			console.error("Failed to update SMS template:", error);
			toast.error(error.message || "Failed to update SMS template");
		} finally {
			setLoading(false);
		}
	};

	if (loadingData) {
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
						<h1 className="text-2xl font-semibold text-gray-900">
							Edit SMS Template
						</h1>
						<p className="mt-2 text-sm text-gray-700">
							Edit the SMS template:{" "}
							<span className="font-medium">{template.name}</span>
						</p>
					</div>

					<SmsTemplateEditor
						initialContent={template.content}
						initialVariables={template.variables || {}}
						initialName={template.name}
						initialCategory={template.category}
						initialActive={template.isActive}
						onSave={handleSave}
						smsEvents={smsEvents}
						isEditing={true}
					/>
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

export default EditSmsTemplatePage;
