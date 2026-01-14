import Joi from 'joi';
import { TransactionType } from '@prisma/client';

// Validation schema for creating a new transaction
export const createTransactionSchema = Joi.object({
  accountId: Joi.string().uuid().required().messages({
    'string.uuid': 'Account ID must be a valid UUID',
    'any.required': 'Account ID is required'
  }),
  transactionType: Joi.string().valid(
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.INTEREST_CREDIT,
    TransactionType.FEE_DEBIT,
    TransactionType.ADJUSTMENT,
    TransactionType.TRANSFER_IN,
    TransactionType.TRANSFER_OUT
  ).required().messages({
    'any.only': 'Transaction type must be one of the valid types',
    'any.required': 'Transaction type is required'
  }),
  amount: Joi.number().positive().precision(2).required().messages({
    'number.base': 'Amount must be a number',
    'number.positive': 'Amount must be positive',
    'number.precision': 'Amount must have at most 2 decimal places',
    'any.required': 'Amount is required'
  }),
  description: Joi.string().max(500).allow('', null).messages({
    'string.max': 'Description must be at most 500 characters'
  }),
  referenceNumber: Joi.string().max(50).allow('', null).messages({
    'string.max': 'Reference number must be at most 50 characters'
  }),
  transactionMethod: Joi.string().max(50).allow('', null).messages({
    'string.max': 'Transaction method must be at most 50 characters'
  }),
  transactionDate: Joi.date().iso().max('now').messages({
    'date.base': 'Transaction date must be a valid date',
    'date.max': 'Transaction date cannot be in the future'
  }),
  transactionDate_bs: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).messages({
    'string.pattern.base': 'BS date must be in YYYY-MM-DD format'
  })
});

// Validation schema for getting transactions by account ID
export const getTransactionsByAccountSchema = Joi.object({
  accountId: Joi.string().uuid().required().messages({
    'string.uuid': 'Account ID must be a valid UUID',
    'any.required': 'Account ID is required'
  }),
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'Page must be a number',
    'number.integer': 'Page must be an integer',
    'number.min': 'Page must be at least 1'
  }),
  limit: Joi.number().integer().min(1).max(100).default(10).messages({
    'number.base': 'Limit must be a number',
    'number.integer': 'Limit must be an integer',
    'number.min': 'Limit must be at least 1',
    'number.max': 'Limit must be at most 100'
  }),
  startDate: Joi.date().iso().messages({
    'date.base': 'Start date must be a valid date'
  }),
  endDate: Joi.date().iso().min(Joi.ref('startDate')).messages({
    'date.base': 'End date must be a valid date',
    'date.min': 'End date must be after start date'
  }),
  transactionType: Joi.string().valid(
    TransactionType.DEPOSIT,
    TransactionType.WITHDRAWAL,
    TransactionType.INTEREST_CREDIT,
    TransactionType.FEE_DEBIT,
    TransactionType.ADJUSTMENT,
    TransactionType.TRANSFER_IN,
    TransactionType.TRANSFER_OUT
  ).messages({
    'any.only': 'Transaction type must be one of the valid types'
  })
});

// Validation schema for getting a transaction by ID
export const getTransactionByIdSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Transaction ID must be a valid UUID',
    'any.required': 'Transaction ID is required'
  })
});

// Validation schema for canceling a transaction
export const cancelTransactionSchema = Joi.object({
  id: Joi.string().uuid().required().messages({
    'string.uuid': 'Transaction ID must be a valid UUID',
    'any.required': 'Transaction ID is required'
  }),
  reason: Joi.string().max(500).required().messages({
    'string.max': 'Reason must be at most 500 characters',
    'any.required': 'Reason is required'
  })
});