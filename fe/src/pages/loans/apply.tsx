import React, { useState } from "react";
import { useRouter } from "next/router";
import MainLayout from "@/components/layout/MainLayout";
import Card from "@/components/common/Card";
import LoanApplicationForm from "@/components/forms/LoanApplicationForm";
import ProtectedRoute from "@/components/common/ProtectedRoute";

const LoanApplicationPage = () => {
	const router = useRouter();
	const [applicationId, setApplicationId] = useState<string | null>(null);

	const handleApplicationSuccess = (id: string) => {
		setApplicationId(id);
		// Redirect to application status page after a delay
		setTimeout(() => {
			router.push(`/loans/applications/${id}`);
		}, 3000);
	};

	return (
		<ProtectedRoute>
			<MainLayout title="Apply for a Loan">
				<div className="max-w-3xl mx-auto">
					<Card title="Loan Application">
						<div className="px-4 py-5 sm:p-6">
							<LoanApplicationForm onSuccess={handleApplicationSuccess} />
						</div>
					</Card>
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

export default LoanApplicationPage;
