import React, { useState } from "react";
import { User, CreateUserData, UpdateUserData } from "@/services/user.service";
import Button from "@/components/common/Button";
import DualDatePicker from "@/components/common/DualDatePicker";
import DocumentUploadField from "@/components/common/DocumentUploadField";
import { useTranslation } from 'next-i18next';
import { toast } from "react-toastify";

interface UserFormProps {
	user?: User;
	onSubmit: (data: any) => void;
	isSubmitting: boolean;
	isEditMode: boolean;
	fieldErrors?: Record<string, string>;
}

const UserForm: React.FC<UserFormProps> = ({
	user,
	onSubmit,
	isSubmitting,
	isEditMode,
	fieldErrors = {},
}) => {
	const { t } = useTranslation(['user', 'common']);
	const [localErrors, setLocalErrors] = useState<Record<string, string>>({});

	const [formData, setFormData] = useState<CreateUserData | UpdateUserData>({
		fullName: user?.fullName || "",
		dateOfBirth: user?.dateOfBirth || "",
		dateOfBirth_bs: (user as any)?.dateOfBirth_bs || "",
		gender: user?.gender || "",
		contactNumber: user?.contactNumber || "",
		email: user?.email || "",
		address: user?.address || "",
		identificationNumber: user?.idNumber || "",
		identificationType: user?.idType || "NATIONAL_ID",
		isActive: user?.isActive !== undefined ? user.isActive : true,
		groupId: (user as any)?.groupId || "",
	});

	// State for document uploads
	const [documents, setDocuments] = useState<Record<string, File | null>>({});

	// Groups state
	const [groups, setGroups] = React.useState<any[]>([]);

	React.useEffect(() => {
		// Fetch groups for dropdown
		import("@/services/group.service").then(({ getAllGroups }) => {
			getAllGroups().then((res) => {
				if (Array.isArray(res)) {
					setGroups(res);
				} else {
					console.error("Groups response is not an array:", res);
					setGroups([]);
				}
			}).catch(console.error);
		});
	}, []);

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, checked } = e.target;
		setFormData((prev) => ({ ...prev, [name]: checked }));
	};

	const handleDualDateChange = (adDate: Date | null, bsDate: string | null) => {
		if (adDate) {
			setFormData((prev) => ({
				...prev,
				dateOfBirth: adDate.toISOString(),
				dateOfBirth_bs: bsDate || undefined
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				dateOfBirth: "",
				dateOfBirth_bs: undefined
			}));
		}
	};

	const handleDocumentChange = (documentType: string, file: File | null) => {
		setDocuments((prev) => ({
			...prev,
			[documentType]: file,
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Validate email
		if (!formData.email) {
			setLocalErrors({ ...localErrors, email: t('common:validation.required', "Email is required") });
			return;
		} else {
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				setLocalErrors({ ...localErrors, email: t('common:validation.email') });
				return;
			}
		}

		if (!formData.dateOfBirth) {
			toast.error(t('user:validation.dob_required', "Date of Birth is required"));
			return;
		}

		setLocalErrors({});
		// Pass both formData and documents to parent
		onSubmit({ formData, documents });
	};

	return (
		<form onSubmit={handleSubmit} className="bg-white shadow sm:rounded-lg" >
			<div className="px-4 py-5 sm:p-6">
				<div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
					{/* Full Name */}
					<div className="sm:col-span-3">
						<label
							htmlFor="fullName"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.full_name')}
						</label>
						<div className="mt-1">
							<input
								type="text"
								name="fullName"
								id="fullName"
								value={formData.fullName || ""}
								onChange={handleChange}
								required
								className={`block w-full rounded-md shadow-sm focus:ring-primary-500 sm:text-sm ${fieldErrors.fullName
									? "border-red-300 focus:border-red-500"
									: "border-gray-300 focus:border-primary-500"
									}`}
							/>
							{fieldErrors.fullName && (
								<p className="mt-1 text-sm text-red-600">
									{fieldErrors.fullName}
								</p>
							)}
						</div>
					</div>

					{/* Date of Birth */}
					<div className="sm:col-span-3">
						<label
							htmlFor="dateOfBirth"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.date_of_birth')}
						</label>
						<div className="mt-1">
							<DualDatePicker
								id="dateOfBirth"
								selectedAd={
									formData.dateOfBirth ? new Date(formData.dateOfBirth) : null
								}
								selectedBs={(formData as any).dateOfBirth_bs}
								onChange={handleDualDateChange}
								defaultCalendar="bs"
								showBothDates={true}
								className={`block w-full rounded-md shadow-sm focus:ring-primary-500 sm:text-sm ${fieldErrors.dateOfBirth
									? "border-red-300 focus:border-red-500"
									: "border-gray-300 focus:border-primary-500"
									}`}
							/>
							{fieldErrors.dateOfBirth && (
								<p className="mt-1 text-sm text-red-600">
									{fieldErrors.dateOfBirth}
								</p>
							)}
						</div>
					</div>

					{/* Gender */}
					<div className="sm:col-span-3">
						<label
							htmlFor="gender"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.gender')}
						</label>
						<div className="mt-1">
							<select
								id="gender"
								name="gender"
								value={formData.gender || ""}
								onChange={handleChange}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
							>
								<option value="">{t('user:gender_options.select')}</option>
								<option value="MALE">{t('user:gender_options.male')}</option>
								<option value="FEMALE">{t('user:gender_options.female')}</option>
								<option value="OTHER">{t('user:gender_options.other')}</option>
							</select>
						</div>
					</div>

					{/* Contact Number */}
					<div className="sm:col-span-3">
						<label
							htmlFor="contactNumber"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.contact_number')}
						</label>
						<div className="mt-1">
							<input
								type="text"
								name="contactNumber"
								id="contactNumber"
								value={formData.contactNumber || ""}
								onChange={(e) => {
									const value = e.target.value;
									// Only allow numbers
									if (/^\d*$/.test(value)) {
										// Limit to 10 characters
										if (value.length <= 10) {
											setFormData((prev) => ({ ...prev, contactNumber: value }));
										}
									}
								}}
								placeholder={t('user:placeholders.contact_number')}
								required
								maxLength={10}
								className={`block w-full rounded-md shadow-sm focus:ring-primary-500 sm:text-sm ${fieldErrors.contactNumber
									? "border-red-300 focus:border-red-500"
									: "border-gray-300 focus:border-primary-500"
									}`}
							/>
							{fieldErrors.contactNumber && (
								<p className="mt-1 text-sm text-red-600">
									{fieldErrors.contactNumber}
								</p>
							)}
						</div>
					</div>

					{/* Email */}
					<div className="sm:col-span-3">
						<label
							htmlFor="email"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.email')}
						</label>
						<div className="mt-1">
							<input
								type="text"
								name="email"
								id="email"
								value={formData.email || ""}
								onChange={handleChange}
								required
								className={`block w-full rounded-md shadow-sm focus:ring-primary-500 sm:text-sm ${fieldErrors.email || localErrors.email
									? "border-red-300 focus:border-red-500"
									: "border-gray-300 focus:border-primary-500"
									}`}
							/>
							{(fieldErrors.email || localErrors.email) && (
								<p className="mt-1 text-sm text-red-600">
									{fieldErrors.email || localErrors.email}
								</p>
							)}
						</div>
					</div>

					{/* Group Assignment */}
					<div className="sm:col-span-3">
						<label
							htmlFor="groupId"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.group', 'Group')} ({t('common:optional')})
						</label>
						<div className="mt-1">
							<select
								id="groupId"
								name="groupId"
								value={(formData as any).groupId || ""}
								onChange={handleChange}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
							>
								<option value="">{t('user:group_options.select', 'Select a Group')}</option>
								{groups.map((group) => (
									<option key={group.id} value={group.id}>
										{group.name} ({group.code})
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Address */}
					<div className="sm:col-span-6">
						<label
							htmlFor="address"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.address')} ({t('common:optional')})
						</label>
						<div className="mt-1">
							<textarea
								name="address"
								id="address"
								rows={3}
								value={formData.address || ""}
								onChange={handleChange}
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
							/>
						</div>
					</div>

					{/* Identification Type */}
					<div className="sm:col-span-3">
						<label
							htmlFor="identificationType"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.identification_type')}
						</label>
						<div className="mt-1">
							<select
								id="identificationType"
								name="identificationType"
								value={formData.identificationType || ""}
								onChange={handleChange}
								required
								className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
							>
								<option value="NATIONAL_ID">{t('user:id_type_options.national_id')}</option>
								<option value="PASSPORT">{t('user:id_type_options.passport')}</option>
								<option value="DRIVING_LICENSE">{t('user:id_type_options.driving_license')}</option>
								<option value="OTHER">{t('user:id_type_options.other')}</option>
							</select>
						</div>
					</div>

					{/* Identification Number */}
					<div className="sm:col-span-3">
						<label
							htmlFor="identificationNumber"
							className="block text-sm font-medium text-gray-700"
						>
							{t('user:fields.identification_number')}
						</label>
						<div className="mt-1">
							<input
								type="text"
								name="identificationNumber"
								id="identificationNumber"
								value={formData.identificationNumber || ""}
								onChange={handleChange}
								required
								className={`block w-full rounded-md shadow-sm focus:ring-primary-500 sm:text-sm ${fieldErrors.identificationNumber
									? "border-red-300 focus:border-red-500"
									: "border-gray-300 focus:border-primary-500"
									}`}
							/>
							{fieldErrors.identificationNumber && (
								<p className="mt-1 text-sm text-red-600">
									{fieldErrors.identificationNumber}
								</p>
							)}
						</div>
					</div>

					{/* Document Uploads Section - Only for new users */}
					{!isEditMode && (
						<>
							<div className="sm:col-span-6 border-t pt-6">
								<h3 className="text-lg font-medium text-gray-900 mb-4">
									{t('user:documents.title', 'Document Uploads')}
								</h3>
								<p className="text-sm text-gray-500 mb-4">
									{t('user:documents.description', 'Upload identification documents for verification')}
								</p>
							</div>

							{/* National ID / Citizenship */}
							<div className="sm:col-span-3">
								<DocumentUploadField
									documentType="NATIONAL_ID"
									label={t('user:documents.national_id', 'National ID / Citizenship')}
									onFileChange={(file) => handleDocumentChange("NATIONAL_ID", file)}
								/>
							</div>

							{/* Passport */}
							<div className="sm:col-span-3">
								<DocumentUploadField
									documentType="PASSPORT"
									label={t('user:documents.passport', 'Passport')}
									onFileChange={(file) => handleDocumentChange("PASSPORT", file)}
								/>
							</div>

							{/* Driving License */}
							<div className="sm:col-span-3">
								<DocumentUploadField
									documentType="DRIVING_LICENSE"
									label={t('user:documents.driving_license', 'Driving License')}
									onFileChange={(file) => handleDocumentChange("DRIVING_LICENSE", file)}
								/>
							</div>

							{/* Other Document */}
							<div className="sm:col-span-3">
								<DocumentUploadField
									documentType="OTHER"
									label={t('user:documents.other', 'Other Document')}
									onFileChange={(file) => handleDocumentChange("OTHER", file)}
								/>
							</div>
						</>
					)}

					{/* Status */}
					<div className="sm:col-span-3">
						<div className="flex items-center h-full mt-4">
							<input
								id="isActive"
								name="isActive"
								type="checkbox"
								checked={formData.isActive === true}
								onChange={handleCheckboxChange}
								className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
							/>
							<label
								htmlFor="isActive"
								className="ml-2 block text-sm text-gray-700"
							>
								{t('user:fields.is_active')}
							</label>
						</div>
					</div>
				</div>
			</div>
			<div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
				<Button
					type="submit"
					variant="primary"
					isLoading={isSubmitting}
					disabled={isSubmitting}
				>
					{isEditMode ? t('user:update_user') : t('user:create_user')}
				</Button>
			</div>
		</form >
	);
};

export default UserForm;
