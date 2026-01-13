import { Request, Response } from 'express';
import prisma from '../../../config/database';
import logger from '../../../config/logger';
import { ApiError } from '../../../common/middleware/error.middleware';
import { AccountType_COA } from '@prisma/client';
import {
  calculateAccountBalance,
  generateTrialBalance,
  generateIncomeStatement,
  generateBalanceSheet
} from '../utils/accounting.utils';
import { FiscalYearService } from '../../system/fiscal-year/services/fiscal-year.service';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { format as formatDate } from 'date-fns';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

/**
 * Get account balance
 */
export const getAccountBalance = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    // Check if account exists
    const account = await prisma.account_COA.findUnique({
      where: { id }
    });

    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    // Parse date parameters
    let startDateObj = startDate ? new Date(startDate as string) : undefined;
    let endDateObj = endDate ? new Date(endDate as string) : undefined;

    // Handle fiscal year filter
    if (req.query.fiscalYearId) {
      const fiscalYearService = new FiscalYearService();
      const fy = await fiscalYearService.getFiscalYearById(req.query.fiscalYearId as string);
      if (fy) {
        if (!startDate) startDateObj = new Date(fy.startDateAD);
        if (!endDate) endDateObj = new Date(fy.endDateAD);
      }
    }

    // Calculate balance
    const balance = await calculateAccountBalance(
      id,
      account.accountType,
      startDateObj,
      endDateObj
    );

    return res.json({
      account,
      balance,
      period: {
        startDate: startDateObj,
        endDate: endDateObj
      }
    });
  } catch (error) {
    logger.error(`Get account balance error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to calculate account balance');
  }
};

/**
 * Generate trial balance
 */
export const getTrialBalance = async (req: Request, res: Response) => {
  try {
    const { asOfDate } = req.query;

    // Parse date parameter
    let asOfDateObj = asOfDate ? new Date(asOfDate as string) : new Date();

    // Handle fiscal year filter
    if (req.query.fiscalYearId) {
      const fiscalYearService = new FiscalYearService();
      const fy = await fiscalYearService.getFiscalYearById(req.query.fiscalYearId as string);
      if (fy && !asOfDate) {
        asOfDateObj = new Date(fy.endDateAD);
      }
    }

    // Generate trial balance
    const trialBalanceData = await generateTrialBalance(asOfDateObj);

    return res.json({
      asOfDate: asOfDateObj,
      accounts: trialBalanceData.accounts,
      totals: {
        debit: trialBalanceData.totalDebits,
        credit: trialBalanceData.totalCredits,
        difference: trialBalanceData.totalDebits - trialBalanceData.totalCredits
      }
    });
  } catch (error) {
    logger.error(`Generate trial balance error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate trial balance');
  }
};

/**
 * Generate income statement
 */
export const getIncomeStatement = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    // Parse date parameters
    let startDateObj = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), 0, 1);
    let endDateObj = endDate ? new Date(endDate as string) : new Date();

    // Handle fiscal year filter
    if (req.query.fiscalYearId) {
      const fiscalYearService = new FiscalYearService();
      const fy = await fiscalYearService.getFiscalYearById(req.query.fiscalYearId as string);
      if (fy) {
        if (!startDate) startDateObj = new Date(fy.startDateAD);
        if (!endDate) endDateObj = new Date(fy.endDateAD);
      }
    }

    // Generate income statement
    const incomeStatement = await generateIncomeStatement(startDateObj, endDateObj);

    return res.json({
      period: {
        startDate: startDateObj,
        endDate: endDateObj
      },
      ...incomeStatement
    });
  } catch (error) {
    logger.error(`Generate income statement error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate income statement');
  }
};

/**
 * Generate balance sheet
 */
export const getBalanceSheet = async (req: Request, res: Response) => {
  try {
    const { asOfDate } = req.query;

    // Parse date parameter
    let asOfDateObj = asOfDate ? new Date(asOfDate as string) : new Date();

    // Handle fiscal year filter
    if (req.query.fiscalYearId) {
      const fiscalYearService = new FiscalYearService();
      const fy = await fiscalYearService.getFiscalYearById(req.query.fiscalYearId as string);
      if (fy && !asOfDate) {
        asOfDateObj = new Date(fy.endDateAD);
      }
    }

    // Generate balance sheet
    const balanceSheet = await generateBalanceSheet(asOfDateObj);

    return res.json({
      asOfDate: asOfDateObj,
      ...balanceSheet
    });
  } catch (error) {
    logger.error(`Generate balance sheet error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate balance sheet');
  }
};

/**
 * Generate general ledger
 */
export const getGeneralLedger = async (req: Request, res: Response) => {
  try {
    const { accountId, startDate, endDate } = req.query;

    // Build filter conditions
    const where: any = {};

    // Only include posted entries
    where.status = 'POSTED';

    // Date filters
    let startDateObj = startDate ? new Date(startDate as string) : undefined;
    let endDateObj = endDate ? new Date(endDate as string) : undefined;

    // Handle fiscal year filter
    if (req.query.fiscalYearId) {
      const fiscalYearService = new FiscalYearService();
      const fy = await fiscalYearService.getFiscalYearById(req.query.fiscalYearId as string);
      if (fy) {
        if (!startDate) startDateObj = new Date(fy.startDateAD);
        if (!endDate) endDateObj = new Date(fy.endDateAD);
      }
    }

    if (startDateObj && endDateObj) {
      where.entryDate = {
        gte: startDateObj,
        lte: endDateObj
      };
    } else if (startDateObj) {
      where.entryDate = {
        gte: startDateObj
      };
    } else if (endDateObj) {
      where.entryDate = {
        lte: endDateObj
      };
    }

    // Get journal entries with lines
    const journalEntries = await prisma.journalEntry.findMany({
      where,
      include: {
        journalEntryLines: {
          include: {
            account: true
          }
        }
      },
      orderBy: {
        entryDate: 'asc'
      }
    });

    // If filtering by account, calculate opening balance
    let openingBalance = 0;
    if (accountId) {
      const account = await prisma.account_COA.findUnique({
        where: { id: accountId as string }
      });

      if (!account) {
        throw new ApiError(404, 'Account not found');
      }

      // Calculate opening balance as of startDate
      if (startDate) {
        openingBalance = await calculateAccountBalance(
          accountId as string,
          account.accountType,
          undefined,
          new Date(new Date(startDate as string).setDate(new Date(startDate as string).getDate() - 1))
        );
      }
    }

    // Format ledger entries
    const ledgerEntries = journalEntries.map(entry => {
      // Filter lines for the specified account if needed
      const relevantLines = accountId
        ? entry.journalEntryLines.filter(line => line.accountId === accountId)
        : entry.journalEntryLines;

      // Group by debit and credit
      const debitLines = relevantLines.filter(line => Number(line.debitAmount) > 0);
      const creditLines = relevantLines.filter(line => Number(line.creditAmount) > 0);

      return {
        entryDate: entry.entryDate,
        entryNumber: entry.entryNumber,
        reference: entry.reference,
        narration: entry.narration,
        debitAmount: debitLines.reduce((sum, line) => sum + Number(line.debitAmount), 0),
        creditAmount: creditLines.reduce((sum, line) => sum + Number(line.creditAmount), 0),
        debitAccounts: debitLines.map(line => line.account),
        creditAccounts: creditLines.map(line => line.account)
      };
    });

    return res.json({
      period: {
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined
      },
      account: accountId ? await prisma.account_COA.findUnique({
        where: { id: accountId as string }
      }) : null,
      openingBalance,
      entries: ledgerEntries
    });
  } catch (error) {
    logger.error(`Generate general ledger error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to generate general ledger');
  }
};

/**
 * Export report to PDF/Excel
 */
export const exportReport = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const { format, ...params } = req.query;

    // Validate report type
    const validReportTypes = ['balance-sheet', 'income-statement', 'trial-balance', 'general-ledger'];
    if (!validReportTypes.includes(type)) {
      throw new ApiError(400, 'Invalid report type');
    }

    // Validate export format
    const validFormats = ['pdf', 'excel'];
    if (!validFormats.includes(format as string)) {
      throw new ApiError(400, 'Invalid export format');
    }

    // Generate report data
    let reportData;
    let fileName;

    switch (type) {
      case 'balance-sheet':
        const asOfDateBS = params.asOfDate ? new Date(params.asOfDate as string) : new Date();
        reportData = await generateBalanceSheet(asOfDateBS);
        reportData.asOfDate = asOfDateBS;
        fileName = `balance-sheet-${formatDate(asOfDateBS, 'yyyy-MM-dd')}`;
        break;

      case 'income-statement':
        const startDateIS = params.startDate ? new Date(params.startDate as string) : new Date(new Date().getFullYear(), 0, 1);
        const endDateIS = params.endDate ? new Date(params.endDate as string) : new Date();
        reportData = await generateIncomeStatement(startDateIS, endDateIS);
        reportData.period = { startDate: startDateIS, endDate: endDateIS };
        fileName = `income-statement-${formatDate(startDateIS, 'yyyy-MM-dd')}-to-${formatDate(endDateIS, 'yyyy-MM-dd')}`;
        break;

      case 'trial-balance':
        const asOfDateTB = params.asOfDate ? new Date(params.asOfDate as string) : new Date();
        const tbData = await generateTrialBalance(asOfDateTB);
        reportData = {
          asOfDate: asOfDateTB,
          accounts: tbData.accounts,
          totalDebits: tbData.totalDebits,
          totalCredits: tbData.totalCredits
        };
        fileName = `trial-balance-${formatDate(asOfDateTB, 'yyyy-MM-dd')}`;
        break;

      case 'general-ledger':
        // Handle general ledger export
        const startDateGL = params.startDate ? new Date(params.startDate as string) : undefined;
        const endDateGL = params.endDate ? new Date(params.endDate as string) : new Date();

        // Build filter conditions for journal entries
        const where: any = { status: 'POSTED' };

        if (startDateGL && endDateGL) {
          where.entryDate = {
            gte: startDateGL,
            lte: endDateGL
          };
        } else if (startDateGL) {
          where.entryDate = { gte: startDateGL };
        } else if (endDateGL) {
          where.entryDate = { lte: endDateGL };
        }

        // Get journal entries
        const journalEntries = await prisma.journalEntry.findMany({
          where,
          include: {
            journalEntryLines: {
              include: {
                account: true
              }
            }
          },
          orderBy: {
            entryDate: 'asc'
          }
        });

        // If filtering by account
        let account = null;
        let openingBalance = 0;

        if (params.accountId) {
          account = await prisma.account_COA.findUnique({
            where: { id: params.accountId as string }
          });

          if (!account) {
            throw new ApiError(404, 'Account not found');
          }

          // Calculate opening balance
          if (startDateGL) {
            openingBalance = await calculateAccountBalance(
              params.accountId as string,
              account.accountType,
              undefined,
              new Date(new Date(startDateGL).setDate(new Date(startDateGL).getDate() - 1))
            );
          }
        }

        // Format ledger entries
        const ledgerEntries = journalEntries.map(entry => {
          const relevantLines = params.accountId
            ? entry.journalEntryLines.filter(line => line.accountId === params.accountId)
            : entry.journalEntryLines;

          const debitLines = relevantLines.filter(line => Number(line.debitAmount) > 0);
          const creditLines = relevantLines.filter(line => Number(line.creditAmount) > 0);

          return {
            entryDate: entry.entryDate,
            entryNumber: entry.entryNumber,
            reference: entry.reference,
            narration: entry.narration,
            debitAmount: debitLines.reduce((sum, line) => sum + Number(line.debitAmount), 0),
            creditAmount: creditLines.reduce((sum, line) => sum + Number(line.creditAmount), 0),
            debitAccounts: debitLines.map(line => line.account),
            creditAccounts: creditLines.map(line => line.account)
          };
        });

        reportData = {
          account,
          openingBalance,
          entries: ledgerEntries,
          period: {
            startDate: startDateGL,
            endDate: endDateGL
          }
        };

        fileName = account
          ? `general-ledger-${account.accountCode}-${formatDate(startDateGL || new Date(), 'yyyy-MM-dd')}-to-${formatDate(endDateGL, 'yyyy-MM-dd')}`
          : `general-ledger-${formatDate(startDateGL || new Date(), 'yyyy-MM-dd')}-to-${formatDate(endDateGL, 'yyyy-MM-dd')}`;
        break;
    }

    // Export based on format
    if (format === 'excel') {
      const buffer = await generateExcelReport(type, reportData);

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.xlsx"`);
      res.send(buffer);
    } else {
      const buffer = await generatePdfReport(type, reportData);

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}.pdf"`);
      res.send(buffer);
    }
  } catch (error) {
    logger.error(`Export report error: ${error}`);
    if (error instanceof ApiError) throw error;
    throw new ApiError(500, 'Failed to export report');
  }
};

/**
 * Generate Excel report
 */
const generateExcelReport = async (type: string, data: any): Promise<Buffer> => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(type);

  // Format currency
  const formatCurrency = (amount: number) => {
    const formattedNumber = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `Rs ${formattedNumber}`;
  };

  // Format date
  const formatDateString = (date: Date) => {
    return formatDate(date, 'MMMM d, yyyy');
  };

  switch (type) {
    case 'balance-sheet':
      // Add title
      worksheet.addRow(['Balance Sheet']);
      worksheet.addRow([`As of ${formatDateString(data.asOfDate)}`]);
      worksheet.addRow([]);

      // Add assets section
      worksheet.addRow(['Assets']);
      data.assetAccounts.forEach((account: any) => {
        worksheet.addRow([`${account.accountCode} - ${account.name}`, '', formatCurrency(account.balance)]);
      });
      worksheet.addRow(['Total Assets', '', formatCurrency(data.totalAssets)]);
      worksheet.addRow([]);

      // Add liabilities section
      worksheet.addRow(['Liabilities']);
      data.liabilityAccounts.forEach((account: any) => {
        worksheet.addRow([`${account.accountCode} - ${account.name}`, '', formatCurrency(account.balance)]);
      });
      worksheet.addRow(['Total Liabilities', '', formatCurrency(data.totalLiabilities)]);
      worksheet.addRow([]);

      // Add equity section
      worksheet.addRow(['Equity']);
      data.equityAccounts.forEach((account: any) => {
        worksheet.addRow([`${account.accountCode} - ${account.name}`, '', formatCurrency(account.balance)]);
      });
      worksheet.addRow(['Total Equity', '', formatCurrency(data.totalEquity)]);
      worksheet.addRow([]);

      // Add total liabilities and equity
      worksheet.addRow(['Total Liabilities and Equity', '', formatCurrency(data.liabilitiesAndEquity)]);
      break;

    case 'income-statement':
      // Add title
      worksheet.addRow(['Income Statement']);
      worksheet.addRow([`For the period ${formatDateString(data.period.startDate)} to ${formatDateString(data.period.endDate)}`]);
      worksheet.addRow([]);

      // Add revenue section
      worksheet.addRow(['Revenue']);
      data.incomeAccounts.forEach((account: any) => {
        worksheet.addRow([`${account.accountCode} - ${account.name}`, '', formatCurrency(account.balance)]);
      });
      worksheet.addRow(['Total Revenue', '', formatCurrency(data.totalIncome)]);
      worksheet.addRow([]);

      // Add expenses section
      worksheet.addRow(['Expenses']);
      data.expenseAccounts.forEach((account: any) => {
        worksheet.addRow([`${account.accountCode} - ${account.name}`, '', formatCurrency(account.balance)]);
      });
      worksheet.addRow(['Total Expenses', '', formatCurrency(data.totalExpenses)]);
      worksheet.addRow([]);

      // Add net income
      worksheet.addRow(['Net Income', '', formatCurrency(data.netIncome)]);
      break;

    case 'trial-balance':
      // Add title
      worksheet.addRow(['Trial Balance']);
      worksheet.addRow([`As of ${formatDateString(data.asOfDate)}`]);
      worksheet.addRow([]);

      // Add headers
      worksheet.addRow(['Account Code', 'Account Name', 'Type', 'Debit', 'Credit']);

      // Add accounts
      data.accounts.forEach((account: any) => {
        const { accountType, balance } = account;
        let debit = 0;
        let credit = 0;

        // For asset and expense accounts, positive balance is debit, negative is credit
        if (accountType === 'ASSET' || accountType === 'EXPENSE') {
          debit = balance > 0 ? balance : 0;
          credit = balance < 0 ? Math.abs(balance) : 0;
        } else {
          // For liability, equity, and income accounts, positive balance is credit, negative is debit
          debit = balance < 0 ? Math.abs(balance) : 0;
          credit = balance > 0 ? balance : 0;
        }

        worksheet.addRow([
          account.accountCode,
          account.name,
          account.accountType,
          debit > 0 ? formatCurrency(debit) : '',
          credit > 0 ? formatCurrency(credit) : ''
        ]);
      });

      // Add totals
      worksheet.addRow([
        'Totals',
        '',
        '',
        formatCurrency(data.totalDebits),
        formatCurrency(data.totalCredits)
      ]);

      // Add difference
      worksheet.addRow([
        'Difference',
        '',
        '',
        '',
        formatCurrency(Math.abs(data.totalDebits - data.totalCredits))
      ]);
      break;

    case 'general-ledger':
      // Add title
      worksheet.addRow(['General Ledger']);

      if (data.account) {
        worksheet.addRow([`Account: ${data.account.accountCode} - ${data.account.name}`]);
      }

      worksheet.addRow([`For the period ${data.period.startDate ? formatDateString(data.period.startDate) : ''} to ${data.period.endDate ? formatDateString(data.period.endDate) : ''}`]);
      worksheet.addRow([]);

      // Add opening balance if filtering by account
      if (data.account) {
        worksheet.addRow(['Opening Balance', '', '', '', formatCurrency(data.openingBalance)]);
        worksheet.addRow([]);
      }

      // Add headers
      if (data.account) {
        worksheet.addRow(['Date', 'Entry Number', 'Description', 'Debit', 'Credit']);
      } else {
        worksheet.addRow(['Date', 'Entry Number', 'Description', 'Debit Account', 'Credit Account', 'Debit', 'Credit']);
      }

      // Add entries
      data.entries.forEach((entry: any) => {
        if (data.account) {
          worksheet.addRow([
            formatDateString(entry.entryDate),
            entry.entryNumber,
            entry.narration,
            entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '',
            entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''
          ]);
        } else {
          worksheet.addRow([
            formatDateString(entry.entryDate),
            entry.entryNumber,
            entry.narration,
            entry.debitAccounts.map((a: any) => `${a.accountCode} - ${a.name}`).join(', '),
            entry.creditAccounts.map((a: any) => `${a.accountCode} - ${a.name}`).join(', '),
            entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '',
            entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''
          ]);
        }
      });

      // Add totals
      const totalDebit = data.entries.reduce((sum: number, entry: any) => sum + entry.debitAmount, 0);
      const totalCredit = data.entries.reduce((sum: number, entry: any) => sum + entry.creditAmount, 0);

      if (data.account) {
        worksheet.addRow([
          'Totals',
          '',
          '',
          formatCurrency(totalDebit),
          formatCurrency(totalCredit)
        ]);

        // Add closing balance
        const closingBalance = data.openingBalance + totalDebit - totalCredit;
        worksheet.addRow([
          'Closing Balance',
          '',
          '',
          '',
          formatCurrency(closingBalance)
        ]);
      } else {
        worksheet.addRow([
          'Totals',
          '',
          '',
          '',
          '',
          formatCurrency(totalDebit),
          formatCurrency(totalCredit)
        ]);
      }
      break;
  }

  // Apply some styling
  worksheet.getColumn(1).width = 20;
  worksheet.getColumn(2).width = 20;
  worksheet.getColumn(3).width = 30;
  worksheet.getColumn(4).width = 15;
  worksheet.getColumn(5).width = 15;

  // Generate buffer
  return await workbook.xlsx.writeBuffer() as unknown as Buffer;
};

/**
 * Generate PDF report
 */
const generatePdfReport = async (type: string, data: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const doc = new PDFDocument({ margin: 50 });

    // Collect data chunks
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Format currency
    const formatCurrency = (amount: number) => {
      const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      return `Rs ${formattedNumber}`;
    };

    // Format date
    const formatDateString = (date: Date) => {
      return formatDate(date, 'MMMM d, yyyy');
    };

    // Helper to draw table
    const drawTable = (headers: string[], rows: any[][], startY: number) => {
      const columnWidth = 100;
      const rowHeight = 20;
      let y = startY;

      // Draw headers
      doc.font('Helvetica-Bold');
      headers.forEach((header, i) => {
        doc.text(header, 50 + (i * columnWidth), y);
      });
      y += rowHeight;

      // Draw rows
      doc.font('Helvetica');
      rows.forEach(row => {
        row.forEach((cell, i) => {
          doc.text(cell || '', 50 + (i * columnWidth), y);
        });
        y += rowHeight;
      });

      return y;
    };

    switch (type) {
      case 'balance-sheet':
        // Add title
        doc.fontSize(16).text('Balance Sheet', { align: 'center' });
        doc.fontSize(12).text(`As of ${formatDateString(data.asOfDate)}`, { align: 'center' });
        doc.moveDown(2);

        // Add assets section
        doc.fontSize(14).text('Assets');
        doc.moveDown(0.5);

        data.assetAccounts.forEach((account: any) => {
          doc.fontSize(10).text(`${account.accountCode} - ${account.name}`, 50);
          doc.moveUp();
          doc.fontSize(10).text(formatCurrency(account.balance), { align: 'right' });
        });

        doc.moveDown(0.5);
        doc.fontSize(12).text('Total Assets', 50);
        doc.moveUp();
        doc.fontSize(12).text(formatCurrency(data.totalAssets), { align: 'right' });
        doc.moveDown(2);

        // Add liabilities section
        doc.fontSize(14).text('Liabilities');
        doc.moveDown(0.5);

        data.liabilityAccounts.forEach((account: any) => {
          doc.fontSize(10).text(`${account.accountCode} - ${account.name}`, 50);
          doc.moveUp();
          doc.fontSize(10).text(formatCurrency(account.balance), { align: 'right' });
        });

        doc.moveDown(0.5);
        doc.fontSize(12).text('Total Liabilities', 50);
        doc.moveUp();
        doc.fontSize(12).text(formatCurrency(data.totalLiabilities), { align: 'right' });
        doc.moveDown(2);

        // Add equity section
        doc.fontSize(14).text('Equity');
        doc.moveDown(0.5);

        data.equityAccounts.forEach((account: any) => {
          doc.fontSize(10).text(`${account.accountCode} - ${account.name}`, 50);
          doc.moveUp();
          doc.fontSize(10).text(formatCurrency(account.balance), { align: 'right' });
        });

        doc.moveDown(0.5);
        doc.fontSize(12).text('Total Equity', 50);
        doc.moveUp();
        doc.fontSize(12).text(formatCurrency(data.totalEquity), { align: 'right' });
        doc.moveDown(2);

        // Add total liabilities and equity
        doc.fontSize(12).text('Total Liabilities and Equity', 50);
        doc.moveUp();
        doc.fontSize(12).text(formatCurrency(data.liabilitiesAndEquity), { align: 'right' });
        break;

      case 'income-statement':
        // Add title
        doc.fontSize(16).text('Income Statement', { align: 'center' });
        doc.fontSize(12).text(`For the period ${formatDateString(data.period.startDate)} to ${formatDateString(data.period.endDate)}`, { align: 'center' });
        doc.moveDown(2);

        // Add revenue section
        doc.fontSize(14).text('Revenue');
        doc.moveDown(0.5);

        data.incomeAccounts.forEach((account: any) => {
          doc.fontSize(10).text(`${account.accountCode} - ${account.name}`, 50);
          doc.moveUp();
          doc.fontSize(10).text(formatCurrency(account.balance), { align: 'right' });
        });

        doc.moveDown(0.5);
        doc.fontSize(12).text('Total Revenue', 50);
        doc.moveUp();
        doc.fontSize(12).text(formatCurrency(data.totalIncome), { align: 'right' });
        doc.moveDown(2);

        // Add expenses section
        doc.fontSize(14).text('Expenses');
        doc.moveDown(0.5);

        data.expenseAccounts.forEach((account: any) => {
          doc.fontSize(10).text(`${account.accountCode} - ${account.name}`, 50);
          doc.moveUp();
          doc.fontSize(10).text(formatCurrency(account.balance), { align: 'right' });
        });

        doc.moveDown(0.5);
        doc.fontSize(12).text('Total Expenses', 50);
        doc.moveUp();
        doc.fontSize(12).text(formatCurrency(data.totalExpenses), { align: 'right' });
        doc.moveDown(2);

        // Add net income
        doc.fontSize(14).text('Net Income', 50);
        doc.moveUp();
        doc.fontSize(14).text(formatCurrency(data.netIncome), { align: 'right' });
        break;

      case 'trial-balance':
        // Add title
        doc.fontSize(16).text('Trial Balance', { align: 'center' });
        doc.fontSize(12).text(`As of ${formatDateString(data.asOfDate)}`, { align: 'center' });
        doc.moveDown(2);

        // Prepare table data
        const tbHeaders = ['Account', 'Type', 'Debit', 'Credit'];
        const tbRows: any[][] = [];

        data.accounts.forEach((account: any) => {
          const { accountType, balance } = account;
          let debit = 0;
          let credit = 0;

          // For asset and expense accounts, positive balance is debit, negative is credit
          if (accountType === 'ASSET' || accountType === 'EXPENSE') {
            debit = balance > 0 ? balance : 0;
            credit = balance < 0 ? Math.abs(balance) : 0;
          } else {
            // For liability, equity, and income accounts, positive balance is credit, negative is debit
            debit = balance < 0 ? Math.abs(balance) : 0;
            credit = balance > 0 ? balance : 0;
          }

          tbRows.push([
            `${account.accountCode} - ${account.name}`,
            account.accountType,
            debit > 0 ? formatCurrency(debit) : '',
            credit > 0 ? formatCurrency(credit) : ''
          ]);
        });

        // Add totals
        tbRows.push([
          'Totals',
          '',
          formatCurrency(data.totalDebits),
          formatCurrency(data.totalCredits)
        ]);

        // Add difference
        tbRows.push([
          'Difference',
          '',
          '',
          formatCurrency(Math.abs(data.totalDebits - data.totalCredits))
        ]);

        // Draw table
        drawTable(tbHeaders, tbRows, doc.y);
        break;

      case 'general-ledger':
        // Add title
        doc.fontSize(16).text('General Ledger', { align: 'center' });

        if (data.account) {
          doc.fontSize(12).text(`Account: ${data.account.accountCode} - ${data.account.name}`, { align: 'center' });
        }

        doc.fontSize(12).text(`For the period ${data.period.startDate ? formatDateString(data.period.startDate) : ''} to ${data.period.endDate ? formatDateString(data.period.endDate) : ''}`, { align: 'center' });
        doc.moveDown(2);

        // Add opening balance if filtering by account
        if (data.account) {
          doc.fontSize(12).text(`Opening Balance: ${formatCurrency(data.openingBalance)}`);
          doc.moveDown(1);
        }

        // Prepare table data
        let glHeaders: string[];
        const glRows: any[][] = [];

        if (data.account) {
          glHeaders = ['Date', 'Entry Number', 'Description', 'Debit', 'Credit'];

          data.entries.forEach((entry: any) => {
            glRows.push([
              formatDateString(entry.entryDate),
              entry.entryNumber,
              entry.narration,
              entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '',
              entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''
            ]);
          });
        } else {
          glHeaders = ['Date', 'Entry Number', 'Description', 'Debit', 'Credit'];

          data.entries.forEach((entry: any) => {
            glRows.push([
              formatDateString(entry.entryDate),
              entry.entryNumber,
              entry.narration,
              entry.debitAmount > 0 ? formatCurrency(entry.debitAmount) : '',
              entry.creditAmount > 0 ? formatCurrency(entry.creditAmount) : ''
            ]);
          });
        }

        // Add totals
        const totalDebit = data.entries.reduce((sum: number, entry: any) => sum + entry.debitAmount, 0);
        const totalCredit = data.entries.reduce((sum: number, entry: any) => sum + entry.creditAmount, 0);

        glRows.push([
          'Totals',
          '',
          '',
          formatCurrency(totalDebit),
          formatCurrency(totalCredit)
        ]);

        // Add closing balance if filtering by account
        if (data.account) {
          const closingBalance = data.openingBalance + totalDebit - totalCredit;
          glRows.push([
            'Closing Balance',
            '',
            '',
            '',
            formatCurrency(closingBalance)
          ]);
        }

        // Draw table
        drawTable(glHeaders, glRows, doc.y);
        break;
    }

    // Finalize PDF
    doc.end();
  });
};