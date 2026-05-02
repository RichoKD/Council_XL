import { Wallet, JsonRpcProvider } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { CouncilEngine } from './council.js';
import * as readline from 'readline';

export { CouncilEngine } from './council.js';
export { create0gOpenAIClient } from './client.js';
export * from './agents.js';

// If run directly (e.g. `node src/index.js`)
if (process.argv[1] && process.argv[1].endsWith('index.js')) {
    const PK = process.env.PRIVATE_KEY;
    const RPC_URL = process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai';
    const PROVIDER_ADDRESS = process.env.PROVIDER_ADDRESS; // The GPU provider address
    const ENDPOINT_URL = process.env.ENDPOINT_URL || 'http://localhost:11434/v1';

    if (!PK || !PROVIDER_ADDRESS) {
        console.error("Missing required env vars: PRIVATE_KEY, PROVIDER_ADDRESS");
        process.exit(1);
    }

    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = new Wallet(PK, provider);

    const init = async () => {
        console.log(`[Init] Creating 0G Compute Broker for signer ${wallet.address}...`);
        const broker = await createZGComputeNetworkBroker(wallet as any);

        const engine = new CouncilEngine(broker, PROVIDER_ADDRESS, ENDPOINT_URL);

        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });

        rl.question('\nSubmit an idea to the AI Council: ', async (idea) => {
            rl.close();

            try {
                const { critiques, finalPlan } = await engine.runCouncil(idea);
                console.log('\n======================================');
                console.log('         COUNCIL CRITIQUES            ');
                console.log('======================================');
                for (const [agentId, text] of Object.entries(critiques)) {
                    console.log(`\n--- ${agentId.toUpperCase()} ---`);
                    console.log(text);
                }

                console.log('\n======================================');
                console.log('         FINAL IMPLEMENTATION PLAN    ');
                console.log('======================================\n');
                console.log(finalPlan);

            } catch (err) {
                console.error("Council execution failed:", err);
            }
        });
    };

    init().catch(console.error);
}
