import React, { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import Button from "@/components/common/Button";
import accountTypeService, {
    AccountType,
    CreateAccountTypeData,
    UpdateAccountTypeData,
} from "@/services/account-type.service";

interface AccountTypeFormProps {
    accountType?: AccountType;
    isEdit?: boolean;
    onSuccess?: () => void;
}

const AccountTypeForm: React.FC<AccountTypeFormProps> = ({
    accountType,
    isEdit = false,
    onSuccess,
}) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [code, setCode] = useState(accountType?.code || "");
    const [name, setName] = useState(accountType?.name || "");
    const [description, setDescription] = useState(
        accountType?.description || "",
    );
    const [isActive, setIsActive] = useState(
        accountType?.isActive !== undefined ? accountType.isActive : true,
    );

    // Validation states
    const [errors, setErrors] = useState<Record<string, string>>({});

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!code && !isEdit) {
            newErrors.code = "Code is required";
        } else if (code && !/^[A-Z_]+$/.test(code)) {
            newErrors.code = "Code must be uppercase letters and underscores only";
        } else if (code && (code.length < 2 || code.length > 10)) {
            newErrors.code = "Code must be between 2 and 10 characters";
        }

        if (!name) {
            newErrors.name = "Name is required";
        } else if (name.length < 3 || name.length > 100) {
            newErrors.name = "Name must be between 3 and 100 characters";
        }

        if (description && description.length > 500) {
            newErrors.description = "Description cannot exceed 500 characters";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) {
            return;
        }

        setLoading(true);

        try {
            if (isEdit && accountType) {
                // Update existing account type
                const updateData: UpdateAccountTypeData = {
                    name,
                    description: description || undefined,
                    isActive,
                };

                await accountTypeService.updateAccountType(accountType.id, updateData);
                toast.success("Account type updated successfully");
            } else {
                // Create new account type
                const createData: CreateAccountTypeData = {
                    code: code.toUpperCase(),
                    name,
                    description: description || undefined,
                    isActive,
                };

                await accountTypeService.createAccountType(createData);
                toast.success("Account type created successfully");
            }

            if (onSuccess) {
                onSuccess();
            } else {
                router.push("admin/settings/account-types");
            }
        } catch (error: any) {
            console.error("Error saving account type:", error);
            toast.error(
                error.response?.data?.message ||
                "Failed to save account type. Please try again.",
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
                <div className="md:grid md:grid-cols-3 md:gap-6">
                    <div className="md:col-span-1">
                        <h3 className="text-lg font-medium leading-6 text-gray-900">
                            {isEdit ? "Edit Account Type" : "Create New Account Type"}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                            {isEdit
                                ? "Update the account type details below."
                                : "Define a new account type that can be used when creating user accounts."}
                        </p>
                    </div>

                    <div className="mt-5 md:mt-0 md:col-span-2">
                        <div className="grid grid-cols-6 gap-6">
                            {/* Code Field */}
                            <div className="col-span-6 sm:col-span-3">
                                <label
                                    htmlFor="code"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Code<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="code"
                                    id="code"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    disabled={isEdit}
                                    placeholder="e.g., CS, PS"
                                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                />
                                {errors.code && (
                                    <p className="mt-1 text-sm text-red-600">{errors.code}</p>
                                )}
                                {!isEdit && (
                                    <p className="mt-1 text-xs text-gray-500">
                                        Uppercase letters and underscores only (2-10 characters)
                                    </p>
                                )}
                            </div>

                            {/* Name Field */}
                            <div className="col-span-6 sm:col-span-3">
                                <label
                                    htmlFor="name"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Name<span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Custom Savings"
                                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            {/* Description Field */}
                            <div className="col-span-6">
                                <label
                                    htmlFor="description"
                                    className="block text-sm font-medium text-gray-700"
                                >
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    id="description"
                                    rows={3}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Enter a brief description of this account type"
                                    className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {errors.description}
                                    </p>
                                )}
                                <p className="mt-1 text-xs text-gray-500">
                                    {description.length}/500 characters
                                </p>
                            </div>

                            {/* Active Status */}
                            <div className="col-span-6">
                                <div className="flex items-start">
                                    <div className="flex items-center h-5">
                                        <input
                                            id="isActive"
                                            name="isActive"
                                            type="checkbox"
                                            checked={isActive}
                                            onChange={(e) => setIsActive(e.target.checked)}
                                            className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300 rounded"
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label
                                            htmlFor="isActive"
                                            className="font-medium text-gray-700"
                                        >
                                            Active
                                        </label>
                                        <p className="text-gray-500">
                                            Only active account types will be available for creating
                                            new accounts
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end space-x-3">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : isEdit ? "Update" : "Create"}
                </Button>
            </div>
        </form>
    );
};

export default AccountTypeForm;
