import React from "react";
import { Controller, UseFormReturn } from "react-hook-form";
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
} from "@mui/material";
import { LoanType } from "@/services/loanService";

interface LoanTypeFormProps {
	form: UseFormReturn<any>;
	isEditMode?: boolean;
	loanType?: LoanType;
}

const LoanTypeForm: React.FC<LoanTypeFormProps> = ({
	form,
	isEditMode = false,
	loanType,
}) => {
	const {
		control,
		formState: { errors },
	} = form;

	return (
		<Box sx={{ display: "flex", flexWrap: "wrap", gap: 3 }}>
			{!isEditMode && (
				<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
					<Controller
						name="code"
						control={control}
						render={({ field }) => (
							<TextField
								{...field}
								label="Loan Type Code"
								fullWidth
								error={!!errors.code}
								helperText={
									errors.code?.message?.toString() ||
									"Use uppercase letters and numbers only"
								}
								placeholder="e.g., PL, HL, GOLD"
								disabled={isEditMode}
							/>
						)}
					/>
				</Box>
			)}

			<Box sx={{ flex: isEditMode ? "1 1 100%" : "1 1 300px", minWidth: 0 }}>
				<Controller
					name="name"
					control={control}
					render={({ field }) => (
						<TextField
							{...field}
							label="Loan Type Name"
							fullWidth
							error={!!errors.name}
							helperText={errors.name?.message?.toString()}
							placeholder="e.g., Personal Loan, Home Loan"
						/>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 100%", minWidth: 0 }}>
				<Divider sx={{ my: 1 }}>
					<Typography variant="subtitle2" color="text.secondary">
						Interest Details
					</Typography>
				</Divider>
			</Box>

			<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
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
							<FormHelperText>
								{errors.interestType?.message?.toString()}
							</FormHelperText>
						</FormControl>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
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
							helperText={errors.interestRate?.message?.toString()}
						/>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 100%", minWidth: 0 }}>
				<Divider sx={{ my: 1 }}>
					<Typography variant="subtitle2" color="text.secondary">
						Amount Range
					</Typography>
				</Divider>
			</Box>

			<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
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
								startAdornment: (
									<InputAdornment position="start">$</InputAdornment>
								),
							}}
							error={!!errors.minAmount}
							helperText={errors.minAmount?.message?.toString()}
						/>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
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
								startAdornment: (
									<InputAdornment position="start">$</InputAdornment>
								),
							}}
							error={!!errors.maxAmount}
							helperText={errors.maxAmount?.message?.toString()}
						/>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 100%", minWidth: 0 }}>
				<Divider sx={{ my: 1 }}>
					<Typography variant="subtitle2" color="text.secondary">
						Tenure Range (in months)
					</Typography>
				</Divider>
			</Box>

			<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
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
							helperText={errors.minTenure?.message?.toString()}
						/>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
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
							helperText={errors.maxTenure?.message?.toString()}
						/>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 100%", minWidth: 0 }}>
				<Divider sx={{ my: 1 }}>
					<Typography variant="subtitle2" color="text.secondary">
						Fees & Charges
					</Typography>
				</Divider>
			</Box>

			<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
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
							helperText={errors.processingFeePercent?.message?.toString()}
						/>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 300px", minWidth: 0 }}>
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
								startAdornment: (
									<InputAdornment position="start">$</InputAdornment>
								),
							}}
							error={!!errors.lateFeeAmount}
							helperText={errors.lateFeeAmount?.message?.toString()}
						/>
					)}
				/>
			</Box>

			<Box sx={{ flex: "1 1 100%", minWidth: 0 }}>
				<Divider sx={{ my: 1 }} />
			</Box>

			<Box sx={{ flex: "1 1 100%", minWidth: 0 }}>
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
			</Box>
		</Box>
	);
};

export default LoanTypeForm;
