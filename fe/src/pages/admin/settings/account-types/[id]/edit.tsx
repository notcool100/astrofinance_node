import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import MainLayout from "@/components/layout/MainLayout";
import AccountTypeForm from "@/components/modules/settings/AccountTypeForm";
import accountTypeService, { AccountType } from "@/services/account-type.service";

const EditAccountTypePage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [accountType, setAccountType] = useState<AccountType | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id && typeof id === "string") {
            loadAccountType(id);
        }
    }, [id]);

    const loadAccountType = async (typeId: string) => {
        try {
            setLoading(true);
            const data = await accountTypeService.getAccountTypeById(typeId);
            setAccountType(data);
        } catch (error) {
            console.error("Error loading account type:", error);
            toast.error("Failed to load account type");
            router.push("/admin/settings/account-types");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <MainLayout title="Edit Account Type">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="text-center py-12">
                        <p className="text-gray-500">Loading...</p>
                    </div>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout title="Edit Account Type">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    {accountType && (
                        <AccountTypeForm accountType={accountType} isEdit={true} />
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default EditAccountTypePage;
