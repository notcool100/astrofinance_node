import { Request, Response } from "express";
import { InterestService } from "../services/interest.service";
import logger from "../../../config/logger";

export const triggerDailyInterest = async (req: Request, res: Response) => {
    try {
        const count = await InterestService.calculateDailyInterest();
        res.status(200).json({
            success: true,
            message: `Daily interest calculation trigger successful. Processed accounts: ${count}`
        });
    } catch (error) {
        logger.error(`Error triggering daily interest: ${error}`);
        res.status(500).json({
            success: false,
            message: "Failed to trigger daily interest calculation"
        });
    }
};

export const triggerQuarterlyPosting = async (req: Request, res: Response) => {
    try {
        const result = await InterestService.postQuarterlyInterest();
        res.status(200).json({
            success: true,
            message: `Quarterly interest posting successful.`,
            data: result
        });
    } catch (error) {
        logger.error(`Error triggering quarterly posting: ${error}`);
        res.status(500).json({
            success: false,
            message: "Failed to trigger quarterly interest posting"
        });
    }
};
