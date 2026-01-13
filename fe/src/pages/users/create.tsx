import React, { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import MainLayout from "@/components/layout/MainLayout";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import Button from "@/components/common/Button";
import UserForm from "@/components/modules/users/UserForm";
import userService from "@/services/user.service";
import { toast } from "react-toastify";
import { useTranslation } from "next-i18next";

const CreateUserPage: React.FC = () => {
	const router = useRouter();
	const { t } = useTranslation(["user", "common"]);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	const handleSubmit = async (data: any) => {
		try {
			setIsSubmitting(true);
			setError(null);
			setFieldErrors({});

			// Create the user first
			const createdUser = await userService.create(data.formData);
			toast.success(t("user:user_created_successfully"));

			console.log("=== Document Upload Debug (Frontend) ===");
			console.log("data.documents:", data.documents);
			console.log("Object.keys(data.documents).length:", Object.keys(data.documents || {}).length);

			// Upload documents if any
			if (data.documents && Object.keys(data.documents).length > 0) {
				const documentsToUpload = Object.entries(data.documents).filter(
					([_, file]) => file !== null,
				) as [string, File][];

				console.log("documentsToUpload:", documentsToUpload);
				console.log("documentsToUpload.length:", documentsToUpload.length);

				if (documentsToUpload.length > 0) {
					const formData = new FormData();
					documentsToUpload.forEach(([documentType, file]) => {
						formData.append("documents", file);
						formData.append("documentTypes", documentType);
					});
					formData.append("category", "profile");

					console.log("FormData created, calling uploadMultipleDocuments...");
					console.log("userId:", createdUser.id);

					try {
						const response = await userService.uploadMultipleDocuments(createdUser.id, formData);
						console.log("Upload response:", response);
						toast.success(
							t(
								"user:documents_uploaded_successfully",
								"Documents uploaded successfully",
							),
						);
					} catch (error: any) {
						console.error("Document upload error:", error);
						// Just log the error, don't fail user creation
						toast.warning(
							t(
								"user:user_created_but_documents_failed",
								"User created successfully, but some documents failed to upload",
							),
						);
					}
				} else {
					console.log("No documents to upload (all null)");
				}
			} else {
				console.log("No documents object or empty");
			}

			// Redirect to the user details page
			router.push(`/users/${createdUser.id}`);
		} catch (err: any) {
			console.error("Error creating user:", err);

			// Handle validation errors
			if (err.response?.status === 400 && err.response?.data?.details) {
				const validationErrors: Record<string, string> = {};
				err.response.data.details.forEach((error: any) => {
					validationErrors[error.field] = error.message;
				});
				setFieldErrors(validationErrors);
				setError("Please fix the validation errors below.");
			} else if (err.fieldErrors) {
				setFieldErrors(err.fieldErrors);
				setError(err.message || t("user:create_user_error"));
			} else {
				setError(
					err.response?.data?.message ||
					t("user:create_user_error", "Failed to create user. Please try again."),
				);
				setFieldErrors({});
			}

			toast.error(err.message || t("user:create_user_error"));
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<ProtectedRoute>
			<MainLayout>
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-6">
						<Link href="/users">
							<Button variant="outline" className="flex items-center">
								<ArrowLeftIcon
									className="-ml-1 mr-2 h-5 w-5"
									aria-hidden="true"
								/>
								Back to Users List
							</Button>
						</Link>
					</div>

					<div className="md:grid md:grid-cols-3 md:gap-6">
						<div className="md:col-span-1">
							<div className="px-4 sm:px-0">
								<h3 className="text-lg font-medium leading-6 text-gray-900">
									Create New User
								</h3>
								<p className="mt-1 text-sm text-gray-600">
									Add a new user to the system. Users can have accounts and
									apply for loans.
								</p>
								{error && (
									<div className="mt-4 rounded-md bg-red-50 p-4">
										<div className="flex">
											<div className="ml-3">
												<h3 className="text-sm font-medium text-red-800">
													Error
												</h3>
												<div className="mt-2 text-sm text-red-700">
													<p>{error}</p>
												</div>
											</div>
										</div>
									</div>
								)}
							</div>
						</div>
						<div className="mt-5 md:mt-0 md:col-span-2">
							<UserForm
								onSubmit={handleSubmit}
								isSubmitting={isSubmitting}
								isEditMode={false}
								fieldErrors={fieldErrors}
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
			...(await import("next-i18next/serverSideTranslations").then((m) =>
				m.serverSideTranslations(locale, ["common", "user"]),
			)),
		},
	};
}

export default CreateUserPage;
