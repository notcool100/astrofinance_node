import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Column } from "react-table";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import Button from "@/components/common/Button";
import Table from "@/components/common/Table";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import ProtectedRoute from "@/components/common/ProtectedRoute";
import settingsService, {
	SystemSetting,
	getSettingValue,
	DEFAULT_SETTINGS,
} from "@/services/settings.service";
import {
	CogIcon,
	PlusIcon,
	PencilIcon,
	TrashIcon,
	ClockIcon,
	DocumentTextIcon,
	ShieldCheckIcon,
	BellIcon,
	CurrencyDollarIcon,
	BuildingOfficeIcon,
	GlobeAltIcon,
	ChartBarIcon,
} from "@heroicons/react/24/outline";

// Form validation schema
const settingSchema = yup.object().shape({
	key: yup.string().required("Key is required"),
	value: yup.string().required("Value is required"),
	description: yup
		.string()
		.optional()
		.max(500, "Description must not exceed 500 characters"),
	category: yup.string().required("Category is required"),
	dataType: yup
		.string()
		.oneOf([
			"STRING",
			"NUMBER",
			"BOOLEAN",
			"JSON",
			"DATE",
			"EMAIL",
			"URL",
			"PHONE",
		])
		.required("Data type is required"),
	isPublic: yup.boolean().optional(),
	isEncrypted: yup.boolean().optional(),
});

interface SettingFormData {
	key: string;
	value: string;
	description?: string;
	category: string;
	dataType:
		| "STRING"
		| "NUMBER"
		| "BOOLEAN"
		| "JSON"
		| "DATE"
		| "EMAIL"
		| "URL"
		| "PHONE";
	isPublic?: boolean;
	isEncrypted?: boolean;
}

const SettingsPage: React.FC = () => {
	const [activeTab, setActiveTab] = useState("general");
	const [selectedCategory, setSelectedCategory] = useState<string>("GENERAL");
	const [searchTerm, setSearchTerm] = useState("");
	const [showCreateModal, setShowCreateModal] = useState(false);
	const [showEditModal, setShowEditModal] = useState(false);
	const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(
		null,
	);

	const queryClient = useQueryClient();

	// Fetch settings
	const { data: settingsData, isLoading: isLoadingSettings } = useQuery(
		["settings", selectedCategory, searchTerm],
		() =>
			settingsService.getSettings({
				category: selectedCategory,
				search: searchTerm || undefined,
			}),
		{
			keepPreviousData: true,
		},
	);

	// Mutations
	const createSettingMutation = useMutation(settingsService.createSetting, {
		onSuccess: () => {
			queryClient.invalidateQueries(["settings"]);
			setShowCreateModal(false);
		},
	});

	const updateSettingMutation = useMutation(
		({ key, data }: { key: string; data: any }) =>
			settingsService.updateSetting(key, data),
		{
			onSuccess: () => {
				queryClient.invalidateQueries(["settings"]);
				setShowEditModal(false);
				setSelectedSetting(null);
			},
		},
	);

	const deleteSettingMutation = useMutation(settingsService.deleteSetting, {
		onSuccess: () => {
			queryClient.invalidateQueries(["settings"]);
		},
	});

	// Form setup
	const form = useForm<SettingFormData>({
		resolver: yupResolver(settingSchema),
		defaultValues: {
			key: "",
			value: "",
			description: "",
			category: "GENERAL",
			dataType: "STRING",
			isPublic: false,
			isEncrypted: false,
		},
	});

	// Handle form submission
	const handleSubmit = (data: SettingFormData) => {
		if (selectedSetting) {
			updateSettingMutation.mutate({
				key: selectedSetting.key,
				data: {
					value: data.value,
					description: data.description,
					category: data.category,
					dataType: data.dataType,
					isPublic: data.isPublic,
					isEncrypted: data.isEncrypted,
				},
			});
		} else {
			createSettingMutation.mutate(data);
		}
	};

	// Handle edit setting
	const handleEditSetting = (setting: SystemSetting) => {
		setSelectedSetting(setting);
		form.reset({
			key: setting.key,
			value: setting.value,
			description: setting.description || "",
			category: setting.category,
			dataType: setting.dataType,
			isPublic: setting.isPublic,
			isEncrypted: setting.isEncrypted,
		});
		setShowEditModal(true);
	};

	// Handle delete setting
	const handleDeleteSetting = (key: string) => {
		if (confirm("Are you sure you want to delete this setting?")) {
			deleteSettingMutation.mutate(key);
		}
	};

	// Table columns
	const columns: Column<SystemSetting>[] = [
		{
			Header: "Key",
			accessor: "key",
			Cell: ({ value }: { value: string }) => (
				<span className="font-mono text-sm">{value}</span>
			),
		},
		{
			Header: "Value",
			accessor: "value",
			Cell: ({ row }: { row: any }) => {
				const setting = row.original;
				const displayValue = setting.isEncrypted
					? "••••••••"
					: getSettingValue(setting);

				if (setting.dataType === "BOOLEAN") {
					return (
						<Badge variant={displayValue ? "success" : "secondary"}>
							{displayValue ? "Yes" : "No"}
						</Badge>
					);
				}

				return (
					<span
						className="text-sm max-w-xs truncate"
						title={String(displayValue)}
					>
						{String(displayValue)}
					</span>
				);
			},
		},
		{
			Header: "Category",
			accessor: "category",
			Cell: ({ value }: { value: string }) => (
				<Badge variant="primary">{value}</Badge>
			),
		},
		{
			Header: "Type",
			accessor: "dataType",
			Cell: ({ value }: { value: string }) => (
				<span className="text-xs text-gray-500">{value}</span>
			),
		},
		{
			Header: "Public",
			accessor: "isPublic",
			Cell: ({ value }: { value: boolean }) => (
				<Badge variant={value ? "success" : "secondary"}>
					{value ? "Yes" : "No"}
				</Badge>
			),
		},
		{
			Header: "Actions",
			accessor: "id" as keyof SystemSetting,
			Cell: ({ row }: { row: any }) => {
				const setting = row.original;
				return (
					<div className="flex space-x-2">
						<Button
							variant="primary"
							size="sm"
							onClick={() => handleEditSetting(setting)}
							icon={<PencilIcon className="h-4 w-4" />}
						>
							Edit
						</Button>
						<Button
							variant="danger"
							size="sm"
							onClick={() => handleDeleteSetting(setting.key)}
							icon={<TrashIcon className="h-4 w-4" />}
						>
							Delete
						</Button>
					</div>
				);
			},
		},
	];

	// Category tabs
	const categoryTabs = [
		{ id: "general", name: "General", icon: CogIcon, category: "GENERAL" },
		{
			id: "business",
			name: "Business",
			icon: BuildingOfficeIcon,
			category: "BUSINESS",
		},
		{ id: "contact", name: "Contact", icon: GlobeAltIcon, category: "CONTACT" },
		{ id: "loan", name: "Loan", icon: CurrencyDollarIcon, category: "LOAN" },
		{
			id: "notification",
			name: "Notifications",
			icon: BellIcon,
			category: "NOTIFICATION",
		},
		{
			id: "security",
			name: "Security",
			icon: ShieldCheckIcon,
			category: "SECURITY",
		},
		{ id: "system", name: "System", icon: ChartBarIcon, category: "SYSTEM" },
	];

	return (
		<ProtectedRoute adminOnly>
			<MainLayout title="System Settings">
				<div className="px-4 sm:px-6 lg:px-8 py-8">
					<div className="mb-6">
						<h1 className="text-2xl font-semibold text-gray-900">
							System Settings
						</h1>
						<p className="mt-2 text-sm text-gray-700">
							Configure system-wide settings and preferences
						</p>
					</div>

					{/* Category Tabs */}
					<div className="border-b border-gray-200 mb-6">
						<nav className="-mb-px flex space-x-8">
							{categoryTabs.map((tab) => {
								const Icon = tab.icon;
								return (
									<button
										key={tab.id}
										onClick={() => {
											setActiveTab(tab.id);
											setSelectedCategory(tab.category);
										}}
										className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
											activeTab === tab.id
												? "border-primary-500 text-primary-600"
												: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
										}`}
									>
										<Icon className="h-4 w-4" />
										<span>{tab.name}</span>
									</button>
								);
							})}
						</nav>
					</div>

					{/* Search and Actions */}
					<div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
						<div className="flex-1 max-w-lg">
							<input
								type="text"
								placeholder="Search settings..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="form-input w-full"
							/>
						</div>
						<div className="flex space-x-3">
							<Button
								variant="primary"
								onClick={() => {
									setSelectedSetting(null);
									form.reset();
									setShowCreateModal(true);
								}}
								icon={<PlusIcon className="h-4 w-4" />}
							>
								Add Setting
							</Button>
						</div>
					</div>

					{/* Settings Table */}
					<Card
						title={`${categoryTabs.find((t) => t.id === activeTab)?.name} Settings`}
					>
						{isLoadingSettings ? (
							<div className="text-center py-8">Loading settings...</div>
						) : (
							<Table
								data={settingsData?.data || []}
								columns={columns}
								pagination={!!settingsData?.pagination}
							/>
						)}
					</Card>
				</div>

				{/* Create/Edit Setting Modal */}
				<Modal
					isOpen={showCreateModal || showEditModal}
					onClose={() => {
						setShowCreateModal(false);
						setShowEditModal(false);
						setSelectedSetting(null);
					}}
					title={selectedSetting ? "Edit Setting" : "Create New Setting"}
				>
					<form
						onSubmit={form.handleSubmit(handleSubmit)}
						className="space-y-4"
					>
						<div>
							<label className="form-label">Key</label>
							<input
								type="text"
								{...form.register("key")}
								className={`form-input ${form.formState.errors.key ? "border-red-300" : ""}`}
								placeholder="e.g., app.name"
								disabled={!!selectedSetting}
							/>
							{form.formState.errors.key && (
								<p className="form-error">
									{form.formState.errors.key.message}
								</p>
							)}
						</div>

						<div>
							<label className="form-label">Value</label>
							<input
								type="text"
								{...form.register("value")}
								className={`form-input ${form.formState.errors.value ? "border-red-300" : ""}`}
								placeholder="Enter value"
							/>
							{form.formState.errors.value && (
								<p className="form-error">
									{form.formState.errors.value.message}
								</p>
							)}
						</div>

						<div>
							<label className="form-label">Description</label>
							<textarea
								{...form.register("description")}
								className={`form-input ${form.formState.errors.description ? "border-red-300" : ""}`}
								rows={3}
								placeholder="Optional description"
							/>
							{form.formState.errors.description && (
								<p className="form-error">
									{form.formState.errors.description.message}
								</p>
							)}
						</div>

						<div className="grid grid-cols-2 gap-4">
							<div>
								<label className="form-label">Category</label>
								<select
									{...form.register("category")}
									className={`form-input ${form.formState.errors.category ? "border-red-300" : ""}`}
								>
									<option value="GENERAL">General</option>
									<option value="BUSINESS">Business</option>
									<option value="CONTACT">Contact</option>
									<option value="LOAN">Loan</option>
									<option value="NOTIFICATION">Notification</option>
									<option value="SECURITY">Security</option>
									<option value="SYSTEM">System</option>
								</select>
								{form.formState.errors.category && (
									<p className="form-error">
										{form.formState.errors.category.message}
									</p>
								)}
							</div>

							<div>
								<label className="form-label">Data Type</label>
								<select
									{...form.register("dataType")}
									className={`form-input ${form.formState.errors.dataType ? "border-red-300" : ""}`}
								>
									<option value="STRING">String</option>
									<option value="NUMBER">Number</option>
									<option value="BOOLEAN">Boolean</option>
									<option value="JSON">JSON</option>
									<option value="DATE">Date</option>
									<option value="EMAIL">Email</option>
									<option value="URL">URL</option>
									<option value="PHONE">Phone</option>
								</select>
								{form.formState.errors.dataType && (
									<p className="form-error">
										{form.formState.errors.dataType.message}
									</p>
								)}
							</div>
						</div>

						<div className="flex space-x-4">
							<label className="flex items-center">
								<input
									type="checkbox"
									{...form.register("isPublic")}
									className="form-checkbox"
								/>
								<span className="ml-2 text-sm">Public Setting</span>
							</label>

							<label className="flex items-center">
								<input
									type="checkbox"
									{...form.register("isEncrypted")}
									className="form-checkbox"
								/>
								<span className="ml-2 text-sm">Encrypted Value</span>
							</label>
						</div>

						<div className="flex justify-end space-x-3">
							<Button
								type="button"
								variant="secondary"
								onClick={() => {
									setShowCreateModal(false);
									setShowEditModal(false);
									setSelectedSetting(null);
								}}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								variant="primary"
								loading={
									createSettingMutation.isLoading ||
									updateSettingMutation.isLoading
								}
							>
								{selectedSetting ? "Update Setting" : "Create Setting"}
							</Button>
						</div>
					</form>
				</Modal>
			</MainLayout>
		</ProtectedRoute>
	);
};

export default SettingsPage;
