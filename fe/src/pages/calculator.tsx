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

export default CalculatorPage;