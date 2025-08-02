import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Typography,
} from '@mui/material';
import { LoanType } from '@/services/loanService';
import { formatCurrency, formatDate } from '@/utils/format';

interface LoanTypeDetailsProps {
  loanType: LoanType;
}

const LoanTypeDetails: React.FC<LoanTypeDetailsProps> = ({ loanType }) => {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="h2">
            {loanType.name}
          </Typography>
          <Chip
            label={loanType.isActive ? 'Active' : 'Inactive'}
            color={loanType.isActive ? 'success' : 'default'}
          />
        </Box>
        
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Code: {loanType.code}
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Interest Details
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Interest Type:</strong> {loanType.interestType === 'FLAT' ? 'Flat Rate' : 'Reducing Balance'}
              </Typography>
              <Typography variant="body2">
                <strong>Interest Rate:</strong> {loanType.interestRate}% per annum
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Amount Range
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Minimum Amount:</strong> {formatCurrency(loanType.minAmount)}
              </Typography>
              <Typography variant="body2">
                <strong>Maximum Amount:</strong> {formatCurrency(loanType.maxAmount)}
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Tenure Range
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Minimum Tenure:</strong> {loanType.minTenure} months
              </Typography>
              <Typography variant="body2">
                <strong>Maximum Tenure:</strong> {loanType.maxTenure} months
              </Typography>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" fontWeight="bold">
              Fees & Charges
            </Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">
                <strong>Processing Fee:</strong> {loanType.processingFeePercent}% of loan amount
              </Typography>
              <Typography variant="body2">
                <strong>Late Payment Fee:</strong> {formatCurrency(loanType.lateFeeAmount)} per occurrence
              </Typography>
            </Box>
          </Grid>
        </Grid>
        
        {loanType.createdAt && (
          <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed rgba(0, 0, 0, 0.12)' }}>
            <Typography variant="caption" color="text.secondary">
              Created: {formatDate(new Date(loanType.createdAt))}
              {loanType.updatedAt && ` • Last Updated: ${formatDate(new Date(loanType.updatedAt))}`}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanTypeDetails;