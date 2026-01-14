import React from "react";
import MainLayout from "@/components/layout/MainLayout";
import AccountTypeForm from "@/components/modules/settings/AccountTypeForm";

const NewAccountTypePage = () => {
    return (
        <MainLayout title="Create Account Type">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="max-w-3xl mx-auto">
                    <AccountTypeForm />
                </div>
            </div>
        </MainLayout>
    );
};

export default NewAccountTypePage;
