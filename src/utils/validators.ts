import Joi from 'joi';

export const validateRegister = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    confirmPassword: Joi.string().valid(Joi.ref('password')).required()
});

export const validateLogin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

export const validateAI = Joi.object({
    recipientName: Joi.string().required(),
    relationship: Joi.string().required(),
    tone: Joi.string().required(),
    length: Joi.string().required()
});

export const validateInvitation = Joi.object({
    recipientName: Joi.string().required(),
    recipientEmail: Joi.string().email().required(),
    personalizedMessage: Joi.string().optional().allow(''),
    message: Joi.string().optional().allow(''),  // Frontend alias for personalizedMessage
    tone: Joi.string().optional(),  // Frontend sends this for AI generation context
    settings: Joi.object({
        enableButtonEvasion: Joi.boolean().default(true),
        enableAutoAdvance: Joi.boolean().default(true),
        musicAutoPlay: Joi.boolean().default(true),
        songUrl: Joi.string().uri().optional()
    }).optional(),
    carouselImages: Joi.array().items(
        Joi.alternatives().try(
            Joi.object({
                url: Joi.string().required(),
                caption: Joi.string().optional().allow(''),
                displayOrder: Joi.number().optional()
            }),
            Joi.string()
        )
    ).optional(),
    images: Joi.array().items(Joi.string()).optional()  // Frontend alias for carouselImages
});
