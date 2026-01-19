import { Request, Response } from 'express';
import * as groupService from './group.service';

export const createGroup = async (req: Request, res: Response) => {
    try {
        const group = await groupService.createGroup(req.body);
        res.status(201).json(group);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getGroups = async (req: Request, res: Response) => {
    try {
        const { centerId } = req.query;
        const groups = await groupService.getGroups(centerId as string);
        res.status(200).json(groups);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const getGroupById = async (req: Request, res: Response) => {
    try {
        const group = await groupService.getGroupById(req.params.id);
        if (!group) return res.status(404).json({ message: 'Group not found' });
        res.status(200).json(group);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const updateGroup = async (req: Request, res: Response) => {
    try {
        const group = await groupService.updateGroup(req.params.id, req.body);
        res.status(200).json(group);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

export const deleteGroup = async (req: Request, res: Response) => {
    try {
        await groupService.deleteGroup(req.params.id);
        res.status(204).send();
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
