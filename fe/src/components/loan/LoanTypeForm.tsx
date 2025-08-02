import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Grid,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import { LoanType } from '@/services/loanService';

interface LoanTypeFormProps {
  form: UseFormReturn<any>;
  isEditMode?: boolean;
  loanType?: LoanType;
}

const LoanTypeForm: React.FC<LoanTypeFormProps> = ({ 
  form, 
  isEditMode = false,
  loanType 
}) => {
  const { control, formState: { errors } } = form;

  return (
    <Grid container spacing={3}>
      {!isEditMode && (
        <Grid item xs={12} md={6}>
          <Controller
            name="code"
            control={control}
            render={({ field }) => (
              <TextField
                {...field}
                label="Loan Type Code"
                fullWidth
                error={!!errors.code}
                helperText={errors.code?.message || 'Use uppercase letters and numbers only'}
                placeholder="e.g., PL, HL, GOLD"
                disabled={isEditMode}
              />
            )}
          />
        </Grid>
      )}

      <Grid item xs={12} md={isEditMode ? 12 : 6}>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Loan Type Name"
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              placeholder="e.g., Personal Loan, Home Loan"
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Interest Details
          </Typography>
        </Divider>
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="interestType"
          control={control}
          render={({ field }) => (
            <FormControl fullWidth error={!!errors.interestType}>
              <InputLabel>Interest Type</InputLabel>
              <Select {...field} label="Interest Type">
                <MenuItem value="FLAT">Flat Rate</MenuItem>
                <MenuItem value="DIMINISHING">Reducing Balance</MenuItem>
              </Select>
              <FormHelperText>{errors.interestType?.message}</FormHelperText>
            </FormControl>
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="interestRate"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Interest Rate (% per annum)"
              fullWidth
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              error={!!errors.interestRate}
              helperText={errors.interestRate?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Amount Range
          </Typography>
        </Divider>
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="minAmount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Minimum Loan Amount"
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              error={!!errors.minAmount}
              helperText={errors.minAmount?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="maxAmount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Maximum Loan Amount"
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              error={!!errors.maxAmount}
              helperText={errors.maxAmount?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Tenure Range (in months)
          </Typography>
        </Divider>
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="minTenure"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Minimum Tenure (months)"
              fullWidth
              type="number"
              error={!!errors.minTenure}
              helperText={errors.minTenure?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="maxTenure"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Maximum Tenure (months)"
              fullWidth
              type="number"
              error={!!errors.maxTenure}
              helperText={errors.maxTenure?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Fees & Charges
          </Typography>
        </Divider>
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="processingFeePercent"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Processing Fee (%)"
              fullWidth
              type="number"
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              error={!!errors.processingFeePercent}
              helperText={errors.processingFeePercent?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Controller
          name="lateFeeAmount"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              label="Late Payment Fee"
              fullWidth
              type="number"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
              error={!!errors.lateFeeAmount}
              helperText={errors.lateFeeAmount?.message}
            />
          )}
        />
      </Grid>

      <Grid item xs={12}>
        <Divider sx={{ my: 1 }} />
      </Grid>

      <Grid item xs={12}>
        <Controller
          name="isActive"
          control={control}
          render={({ field }) => (
            <FormControlLabel
              control={
                <Switch
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label="Active"
            />
          )}
        />
      </Grid>
    </Grid>
  );
};

export default LoanTypeForm;