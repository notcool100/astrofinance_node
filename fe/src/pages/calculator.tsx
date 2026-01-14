import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import LoanCalculator from '@/components/modules/loan/LoanCalculator';

const CalculatorPage = () => {
  return (
    <MainLayout title="Loan Calculator">
      <LoanCalculator />
    </MainLayout>
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

export default CalculatorPage;
