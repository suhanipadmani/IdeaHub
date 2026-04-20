import axios from 'axios';

const MODELS = [
    'gemini-3.1-flash',
    'gemini-2.5-flash',
    'gemini-3.1-pro',
    'gemini-2.0-flash-exp'
];

const MAX_RETRIES = 2; 
const INITIAL_DELAY = 1000;

interface AIRequestConfig {
    prompt: string;
    apiKey: string;
    generationConfig?: any;
}

export async function callAiWithFallback(config: AIRequestConfig) {
    let lastError: any = null;

    for (const model of MODELS) {
        let retryCount = 0;
        
        while (retryCount < MAX_RETRIES) {
            try {
                const modelPath = model.startsWith('models/') ? model : `models/${model}`;
                const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${config.apiKey}`;
                
                const response = await axios.post(url, {
                    contents: [{ parts: [{ text: config.prompt }] }],
                    generationConfig: config.generationConfig || {
                        responseMimeType: "application/json",
                    }
                }, {
                    timeout: 20000, 
                });

                const text = response.data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!text) throw new Error("No response content from AI API");

                return {
                    text,
                    modelUsed: model
                };

            } catch (error: any) {
                lastError = error;
                const statusCode = error.response?.status;
                const errorMessage = error.response?.data?.error?.message || error.message;

                // Log every failure for diagnostics
                console.error(`AI Diagnostic: Model ${model} failed. Status: ${statusCode}. Message: ${errorMessage}`);

                if (statusCode === 429 || statusCode === 500 || statusCode === 503 || !statusCode) {
                    retryCount++;
                    if (retryCount < MAX_RETRIES) {
                        const delay = INITIAL_DELAY * Math.pow(2, retryCount - 1);
                        await new Promise(resolve => setTimeout(resolve, delay));
                        continue;
                    }
                }
                break; 
            }
        }
    }

    const finalMessage = lastError.response?.data?.error?.message || lastError.message;
    throw new Error(`AI System Unavailable: All models failed. Last error: ${finalMessage}`);
}
