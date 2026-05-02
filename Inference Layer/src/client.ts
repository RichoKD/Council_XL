import OpenAI from 'openai';

export function create0gOpenAIClient(broker: any, providerAddress: string, endpointUrl: string): OpenAI {
    return new OpenAI({
        baseURL: endpointUrl,
        // The OpenAI Node SDK requires an API key, we can provide a dummy one since the 0G headers overwrite authentication.
        apiKey: '0g-dynamic-auth',
        fetch: async (url: any, config?: RequestInit) => {
            let contentToSign = '';

            if (config?.body) {
                // We typically sign the stringified body or the last message
                contentToSign = typeof config.body === 'string' ? config.body : JSON.stringify(config.body);
            }

            // Generate the single-use header from the broker
            const { headers: zeroGHeaders } = await broker.inference.getRequestHeaders(providerAddress, contentToSign);

            const newHeaders = {
                ...config?.headers,
                ...zeroGHeaders,
            };

            const newConfig = {
                ...config,
                headers: newHeaders,
            };

            // Perform the actual POST request
            return fetch(url, newConfig);
        }
    });
}
