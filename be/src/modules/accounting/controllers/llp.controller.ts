import { Request, Response } from "express";
import { LLPService } from "../services/llp.service";
import logger from "../../../config/logger";

export const generateProvisions = async (req: Request, res: Response) => {
    try {
        const count = await LLPService.calculateProvisions();
        res.status(200).json({
            success: true,
            message: `LLP generated successfully. Processed loans: ${count}`
        });
    } catch (error) {
        logger.error(`Error generating LLP: ${error}`);
        res.status(500).json({
            success: false,
            message: "Failed to generate provisions"
        });
    }
};

export const getProvisionReport = async (req: Request, res: Response) => {
    try {
        const data = await LLPService.getProvisionSummary();
        res.status(200).json({
            success: true,
            data
        });
    } catch (error) {
        logger.error(`Error getting LLP report: ${error}`);
        res.status(500).json({
            success: false,
            message: "Failed to get provision report"
        });
    }
};
