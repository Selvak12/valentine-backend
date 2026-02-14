const { GoogleGenerativeAI } = require('@google/generative-ai');
import AILog from '../models/AILog.model';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({
    model: "gemini-1.5-pro",
    generationConfig: {
        temperature: 0.7,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 1024,
    }
});

export const generateValentineMessage = async (userId: string, recipientName: string, relationship: string, tone: string, length: string) => {
    const prompt = `Generate a ${tone} Valentine's message for ${recipientName} who is my ${relationship}. The length should be ${length}.`;

    const startTime = Date.now();
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const duration = Date.now() - startTime;

        await AILog.create({
            userId,
            type: 'message',
            input: { recipientName, relationship, tone, length },
            output: text,
            aiModel: 'gemini-1.5-pro',
            duration
        });

        return text;
    } catch (error: any) {
        console.error('AI Generation Error:', error);
        throw error;
    }
};
