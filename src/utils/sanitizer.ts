export const sanitizeInput = (input: any): any => {
    if (typeof input === 'string') {
        return input
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/javascript:/gi, '')
            .replace(/on\w+="[^"]*"/gi, '')
            .replace(/on\w+='[^']*'/gi, '')
            .replace(/on\w+=\w+/gi, '')
            .trim();
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeInput);
    }

    if (input && typeof input === 'object') {
        const sanitized: any = {};
        for (const key in input) {
            sanitized[key] = sanitizeInput(input[key]);
        }
        return sanitized;
    }

    return input;
};
