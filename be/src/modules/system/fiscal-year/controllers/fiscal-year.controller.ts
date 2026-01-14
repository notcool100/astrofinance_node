import { Request, Response, NextFunction } from 'express';
import { fiscalYearService } from '../services/fiscal-year.service';

export const createFiscalYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fiscalYear = await fiscalYearService.createFiscalYear(req.body);
        res.status(201).json(fiscalYear);
    } catch (error) {
        next(error);
    }
};

export const getAllFiscalYears = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fiscalYears = await fiscalYearService.getAllFiscalYears();
        res.json(fiscalYears);
    } catch (error) {
        next(error);
    }
};

export const getFiscalYearById = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const fiscalYear = await fiscalYearService.getFiscalYearById(id);
        if (!fiscalYear) {
            res.status(404).json({ message: 'Fiscal year not found' });
            return;
        }
        res.json(fiscalYear);
    } catch (error) {
        next(error);
    }
};

export const updateFiscalYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const fiscalYear = await fiscalYearService.updateFiscalYear(id, req.body);
        res.json(fiscalYear);
    } catch (error) {
        next(error);
    }
};

export const deleteFiscalYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        await fiscalYearService.deleteFiscalYear(id);
        res.json({ message: 'Fiscal year deleted successfully' });
    } catch (error) {
        next(error);
    }
};

export const getCurrentFiscalYear = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const fiscalYear = await fiscalYearService.getCurrentFiscalYear();
        if (!fiscalYear) {
            res.status(404).json({ message: 'No current fiscal year set' });
            return;
        }
        res.json(fiscalYear);
    } catch (error) {
        next(error);
    }
};
