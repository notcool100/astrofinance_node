import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation } from 'react-query';
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
  Alert,
} from '@mui/material';
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import dynamic from 'next/dynamic';

import MainLayout from '@/components/layout/MainLayout';
import LoadingScreen from '@/components/common/LoadingScreen';
import ErrorScreen from '@/components/common/ErrorScreen';
import LoanTypeForm from '@/components/loan/LoanTypeForm';
import LoanTypeDetails from '@/components/loan/LoanTypeDetails';
import loanService, { LoanType } from '@/services/loanService';
import { useAuth } from '@/contexts/AuthContext';

// Form validation schema
const schema = yup.object().shape({
  name: yup
    .string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(100, 'Name must be at most 100 characters'),
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

const EditLoanTypePage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const { hasPermission } = useAuth();
  const [hasAccess, setHasAccess] = useState(true);
  
  useEffect(() => {
    // Check if user has permission to edit loan types
    if (router.isReady && !hasPermission('loans.edit')) {
      setHasAccess(false);
      router.push('/loans/types');
      toast.error('You do not have permission to edit loan types');
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

  const { handleSubmit, reset, formState: { isSubmitting } } = form;
  
  if (!hasAccess) {
    return null;
  }

  // Fetch loan type data
  const { data: loanType, isLoading, error } = useQuery(
    ['loanType', id],
    () => loanService.getLoanTypeById(id as string).then(res => res.data),
    {
      enabled: !!id,
      onSuccess: (data) => {
        // Reset form with fetched data
        reset({
          name: data.name,
          interestType: data.interestType,
          minAmount: data.minAmount,
          maxAmount: data.maxAmount,
          minTenure: data.minTenure,
          maxTenure: data.maxTenure,
          interestRate: data.interestRate,
          processingFeePercent: data.processingFeePercent,
          lateFeeAmount: data.lateFeeAmount,
          isActive: data.isActive,
        });
      },
    }
  );

  const updateMutation = useMutation(
    (data: FormData) => loanService.updateLoanType(id as string, data),
    {
      onSuccess: () => {
        toast.success('Loan type updated successfully');
        router.push('/loans/types');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update loan type');
      },
    }
  );

  const onSubmit = (data: FormData) => {
    updateMutation.mutate(data);
  };

  if (isLoading) return <LoadingScreen />;
  if (error) return <ErrorScreen error={error as Error} />;

  return (
    <MainLayout title="Edit Loan Type">
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
            Edit Loan Type
          </Typography>
          <Typography variant="body1" color="text.secondary" gutterBottom>
            Update the details of {loanType?.name}
          </Typography>
        </Box>

        {loanType && (
          <Box sx={{ mb: 4 }}>
            <LoanTypeDetails loanType={loanType} />
          </Box>
        )}

        <Card>
          <CardContent>
            {loanType && (
              <Box sx={{ mb: 3 }}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Loan Type Code:</strong> {loanType.code} (cannot be changed)
                  </Typography>
                </Alert>
              </Box>
            )}

            <form onSubmit={handleSubmit(onSubmit)}>
              <LoanTypeForm 
                form={form} 
                isEditMode={true} 
                loanType={loanType} 
              />
              
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
                  disabled={isSubmitting || updateMutation.isLoading}
                >
                  {isSubmitting || updateMutation.isLoading ? 'Updating...' : 'Update Loan Type'}
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
export default dynamic(() => Promise.resolve(EditLoanTypePage), { ssr: false });

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

// Required for dynamic routes
export async function getStaticPaths() {
  return {
    paths: [],
    fallback: 'blocking',
  };
}