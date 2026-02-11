import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validate = (schema: any) => {
    return (req: any, res: any, next: any) => {
        const { error } = schema.validate(req.body, { abortEarly: false });
        if (error) {
            const errorMessage = error.details.map((detail: any) => detail.message).join(', ');
            return res.status(400).json({
                success: false,
                error: errorMessage
            });
        }
        next();
    };
};
