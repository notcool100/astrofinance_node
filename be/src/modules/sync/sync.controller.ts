import { Request, Response } from 'express';
import * as syncService from './sync.service';

export const downloadData = async (req: Request, res: Response) => {
    try {
        // userId from auth middleware (req.user.id)
        // For now, treating all requests as authorized for all data
        const data = await syncService.downloadData('user-id-placeholder');
        res.status(200).json(data);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const uploadData = async (req: Request, res: Response) => {
    try {
        const result = await syncService.uploadData(req.body);
        res.status(200).json(result);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
