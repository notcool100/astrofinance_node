import { Request, Response } from 'express';
import * as centerService from './center.service';

export const createCenter = async (req: Request, res: Response) => {
    try {
        const center = await centerService.createCenter(req.body);
        res.status(201).json(center);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCenters = async (req: Request, res: Response) => {
    try {
        const centers = await centerService.getCenters();
        res.status(200).json(centers);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getCenterById = async (req: Request, res: Response) => {
    try {
        const center = await centerService.getCenterById(req.params.id);
        if (!center) return res.status(404).json({ message: 'Center not found' });
        res.status(200).json(center);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateCenter = async (req: Request, res: Response) => {
    try {
        const center = await centerService.updateCenter(req.params.id, req.body);
        res.status(200).json(center);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteCenter = async (req: Request, res: Response) => {
    try {
        await centerService.deleteCenter(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
