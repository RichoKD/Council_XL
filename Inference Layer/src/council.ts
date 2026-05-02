import { create0gOpenAIClient } from './client.js';
import { COUNCIL_AGENTS, SYNTHESIZER_PROMPT } from './agents.js';

export class CouncilEngine {
    private openai: any;
    private model: string;

    constructor(broker: any, providerAddress: string, endpointUrl: string, model: string = 'deepseek-coder') {
        this.openai = create0gOpenAIClient(broker, providerAddress, endpointUrl);
        this.model = model;
    }

    async stressTestWithAgent(agentName: string, systemPrompt: string, idea: string): Promise<string> {
        console.log(`[Council] Dispatching idea to ${agentName}...`);
        const completion = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: idea }
            ],
            temperature: 0.7,
        });

        return completion.choices[0]?.message?.content || 'No response generated.';
    }

    async runCouncil(idea: string): Promise<{ critiques: Record<string, string>; finalPlan: string }> {
        console.log('[Council] Idea received. Initiating stress tests.');

        // 1. Run parallel critiques
        const agents = [COUNCIL_AGENTS.SECURITY, COUNCIL_AGENTS.SCALABILITY, COUNCIL_AGENTS.PRODUCT];

        const critiques: Record<string, string> = {};
        const critiquePromises = agents.map(async (agent) => {
            try {
                const response = await this.stressTestWithAgent(agent.name, agent.systemPrompt, idea);
                critiques[agent.id] = response;
            } catch (err: any) {
                console.error(`[Council] Agent ${agent.name} failed:`, err.message);
                critiques[agent.id] = `Failed to generate critique: ${err.message}`;
            }
        });

        await Promise.all(critiquePromises);

        console.log('[Council] Critiques received. Feeding to Synthesizer...');

        // 2. Format context for Synthesizer
        let synthesisContext = `USER IDEA:\n${idea}\n\n`;
        synthesisContext += `--- COUNCIL CRITIQUES ---\n`;
        for (const agent of agents) {
            synthesisContext += `\n[${agent.name}]:\n${critiques[agent.id]}\n`;
        }

        // 3. Run Synthesizer
        const synthesisResponse = await this.openai.chat.completions.create({
            model: this.model,
            messages: [
                { role: 'system', content: SYNTHESIZER_PROMPT },
                { role: 'user', content: synthesisContext }
            ],
            temperature: 0.5,
        });

        const finalPlan = synthesisResponse.choices[0]?.message?.content || 'Synthesis failed.';
        console.log('[Council] Synthesis complete.');

        return {
            critiques,
            finalPlan
        };
    }
}
