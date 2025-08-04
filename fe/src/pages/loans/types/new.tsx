import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useMutation } from 'react-query';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Typography,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

import MainLayout from '@/components/layout/MainLayout';
import LoanTypeForm from '@/components/loan/LoanTypeForm';
import loanService from '@/services/loanService';
import { useAuth } from '@/contexts/AuthContext';

// Form validation schema
const schema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
  code: yup
    .string()
    .required('Code is required')
    .min(2, 'Code must be at least 2 characters')
    .max(20, 'Code must be at most 20 characters')
    .matches(/^[A-Z0-9]+$/, 'Code must contain only uppercase letters and numbers'),
  interestType: yup
    .string()
    .oneOf(['FLAT', 'DIMINISHING'], 'Invalid interest type')
    .required('Interest type is required'),
  minAmount: yup
    .number()
    .required('Minimum amount is required')
    .positive('Minimum amount must be positive'),
  maxAmount: yup
    .number()
    .required('Maximum amount is required')
    .positive('Maximum amount must be positive')
    .test(
      'is-greater-than-min',
      'Maximum amount must be greater than minimum amount',
      function (value) {
        const { minAmount } = this.parent;
        return !minAmount || !value || value > minAmount;
      }
    ),
  minTenure: yup
    .number()
    .required('Minimum tenure is required')
    .positive('Minimum tenure must be positive')
    .integer('Minimum tenure must be a whole number'),
  maxTenure: yup
    .number()
    .required('Maximum tenure is required')
    .positive('Maximum tenure must be positive')
    .integer('Maximum tenure must be a whole number')
    .test(
      'is-greater-than-min',
      'Maximum tenure must be greater than minimum tenure',
      function (value) {
        const { minTenure } = this.parent;
        return !minTenure || !value || value > minTenure;
      }
    ),
  interestRate: yup
    .number()
    .required('Interest rate is required')
    .positive('Interest rate must be positive'),
  processingFeePercent: yup
    .number()
    .required('Processing fee is required')
    .min(0, 'Processing fee cannot be negative')
    .max(100, 'Processing fee cannot exceed 100%'),
  lateFeeAmount: yup
    .number()
    .required('Late fee is required')
    .min(0, 'Late fee cannot be negative'),
  isActive: yup.boolean(),
});

type FormData = yup.InferType<typeof schema>;

const NewLoanTypePage: React.FC = () => {
  const router = useRouter();
  const { hasPermission } = useAuth();
  const [hasAccess, setHasAccess] = useState(true);
  
  useEffect(() => {
    // Check if user has permission to create loan types
    if (router.isReady && !hasPermission('loans.create')) {
      setHasAccess(false);
      router.push('/loans/types');
      toast.error('You do not have permission to create loan types');
    }
  }, [router.isReady, hasPermission, router]);
  
  const form = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      interestType: 'DIMINISHING',
      processingFeePercent: 0,
      lateFeeAmount: 0,
      isActive: true,
    },
  });

  const { handleSubmit, formState: { isSubmitting } } = form;
  
  if (!hasAccess) {
    return null;
  }

  const createMutation = useMutation(
    (data: FormData) => loanService.createLoanType(data),
    {
      onSuccess: () => {
        toast.success('Loan type created successfully');
        router.push('/loans/types');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to create loan type');
      },
    }
  );

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <MainLayout title="Create New Loan Type">
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ mb: 2 }}
          >
            Back to Loan Types
          </Button>
          
          <Typography variant="h4" component="h1" gutterBottom>
            Create New Loan Type
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Define a new loan product with its terms and conditions
          </Typography>
        </Box>

        <Card>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)}>
              <LoanTypeForm form={form} />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 3 }}>
                <Button
                  variant="outlined"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isSubmitting || createMutation.isLoading}
                >
                  {isSubmitting || createMutation.isLoading ? 'Creating...' : 'Create Loan Type'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Container>
    </MainLayout>
  );
};

// Use dynamic import with SSR disabled to prevent router issues during static generation
export default dynamic(() => Promise.resolve(NewLoanTypePage), { ssr: false });

// Disable automatic static optimization for this page
export const config = {
  unstable_runtimeJS: true,
};

// Tell Next.js to skip static generation for this page
export async function getStaticProps() {
  return {
    notFound: process.env.NODE_ENV === 'production', // Only in production builds
  };
}