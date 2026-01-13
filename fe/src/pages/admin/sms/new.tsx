import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import SmsTemplateEditor from "@/components/sms/SmsTemplateEditor";
import {
	createSmsTemplate,
	getSmsEvents,
	SmsEvent,
} from "@/services/sms.service";
import { toast } from "react-hot-toast";

const NewSmsTemplatePage: React.FC = () => {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [smsEvents, setSmsEvents] = useState<SmsEvent[]>([]);
	const [loadingEvents, setLoadingEvents] = useState(true);

	useEffect(() => {
		const fetchSmsEvents = async () => {
			try {
				setLoadingEvents(true);
				const events = await getSmsEvents();
				setSmsEvents(events);
			} catch (error) {
				console.error("Failed to fetch SMS events:", error);
				toast.error("Failed to load SMS events");
			} finally {
				setLoadingEvents(false);
			}
		};

		fetchSmsEvents();
	}, []);

	const handleSave = async (data: {
		name: string;
		content: string;
		variables: Record<string, string>;
		category: string;
		smsEventId?: string;
		isActive: boolean;
	}) => {
		try {
			setLoading(true);

			await createSmsTemplate({
				name: data.name,
				content: data.content,
				variables: data.variables,
				category: data.category,
				smsEventId: data.smsEventId,
				isActive: data.isActive,
			});

			toast.success("SMS template created successfully");
			router.push("/admin/sms");
		} catch (error: any) {
			console.error("Failed to create SMS template:", error);
			toast.error(error.message || "Failed to create SMS template");
		} finally {
			setLoading(false);
		}
	};

	if (loadingEvents) {
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

	return (
		<ProtectedRoute adminOnly>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-6">
						<h1 className="text-2xl font-semibold text-gray-900">
							Create SMS Template
						</h1>
						<p className="mt-2 text-sm text-gray-700">
							Create a new SMS template with dynamic placeholders for different
							notification types.
						</p>
					</div>

					<SmsTemplateEditor
						onSave={handleSave}
						smsEvents={smsEvents}
						isEditing={false}
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

export default NewSmsTemplatePage;
