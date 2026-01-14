import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Button from "@/components/common/Button";
import {
	getSmsTemplates,
	deleteSmsTemplate,
	SmsTemplate,
} from "@/services/sms.service";
import Link from "next/link";
import { toast } from "react-hot-toast";

const SmsTemplatesPage: React.FC = () => {
	const [templates, setTemplates] = useState<SmsTemplate[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [deletingId, setDeletingId] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				setLoading(true);
				const data = await getSmsTemplates();
				setTemplates(data);
			} catch (e: any) {
				setError(e.message || "Failed to load SMS templates");
			} finally {
				setLoading(false);
			}
		})();
	}, []);

	const handleDelete = async (id: string, name: string) => {
		if (!confirm(`Are you sure you want to delete the template "${name}"?`)) {
			return;
		}

		try {
			setDeletingId(id);
			await deleteSmsTemplate(id);
			setTemplates(templates.filter((t) => t.id !== id));
			toast.success("Template deleted successfully");
		} catch (error: any) {
			toast.error(error.message || "Failed to delete template");
		} finally {
			setDeletingId(null);
		}
	};

	return (
		<ProtectedRoute adminOnly>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="sm:flex sm:items-center mb-6">
						<div className="sm:flex-auto">
							<h1 className="text-2xl font-semibold text-gray-900">
								SMS Templates
							</h1>
							<p className="mt-2 text-sm text-gray-700">
								Manage SMS templates used for system notifications.
							</p>
						</div>
						<div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none flex space-x-3">
							<Link href="/admin/sms/demo">
								<Button variant="outline">Demo</Button>
							</Link>
							<Link href="/admin/sms/new">
								<Button variant="primary">Create Template</Button>
							</Link>
						</div>
					</div>

					{error && <div className="text-red-600 mb-4">{error}</div>}

					{loading ? (
						<div>Loading...</div>
					) : templates.length === 0 ? (
						<div>No SMS templates found.</div>
					) : (
						<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
							<table className="min-w-full divide-y divide-gray-300">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											Name
										</th>
										<th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											Category
										</th>
										<th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											Content Preview
										</th>
										<th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											Characters
										</th>
										<th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											Active
										</th>
										<th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
											Actions
										</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-200 bg-white">
									{templates.map((t) => (
										<tr key={t.id}>
											<td className="px-3 py-4 text-sm text-gray-900 font-medium">
												{t.name}
											</td>
											<td className="px-3 py-4 text-sm text-gray-500">
												<span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
													{t.category}
												</span>
											</td>
											<td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
												{t.content.length > 50
													? `${t.content.substring(0, 50)}...`
													: t.content}
											</td>
											<td className="px-3 py-4 text-sm text-gray-500">
												{t.characterCount}
											</td>
											<td className="px-3 py-4 text-sm text-gray-500">
												<span
													className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
														t.isActive
															? "bg-green-100 text-green-800"
															: "bg-red-100 text-red-800"
													}`}
												>
													{t.isActive ? "Yes" : "No"}
												</span>
											</td>
											<td className="px-3 py-4 text-sm text-gray-500">
												<div className="flex space-x-2">
													<Link href={`/admin/sms/${t.id}`}>
														<Button variant="outline" size="sm">
															View
														</Button>
													</Link>
													<Link href={`/admin/sms/${t.id}/edit`}>
														<Button variant="secondary" size="sm">
															Edit
														</Button>
													</Link>
													<Button
														variant="danger"
														size="sm"
														onClick={() => handleDelete(t.id, t.name)}
														disabled={deletingId === t.id}
													>
														{deletingId === t.id ? "Deleting..." : "Delete"}
													</Button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
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

export default SmsTemplatesPage;
