import 'dotenv/config';
import express, { type Request, type Response } from 'express';
import cors from 'cors';
import { Wallet, JsonRpcProvider } from 'ethers';
import { createZGComputeNetworkBroker } from '@0glabs/0g-serving-broker';
import { CouncilEngine } from './council.js';

const PORT = process.env.PORT || 3001;
const PK = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL || 'https://evmrpc-testnet.0g.ai';
const PROVIDER_ADDRESS = process.env.PROVIDER_ADDRESS;
const ENDPOINT_URL = process.env.ENDPOINT_URL || 'http://localhost:11434/v1';

if (!PK || !PROVIDER_ADDRESS) {
    console.error('[Server] ❌ Missing required env vars: PRIVATE_KEY, PROVIDER_ADDRESS');
    process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

// ── Startup: initialise broker + engine once ─────────────────────────────────
let engine: CouncilEngine | null = null;

async function bootstrap() {
    console.log('[Server] Initialising 0G Compute Broker…');
    const provider = new JsonRpcProvider(RPC_URL);
    const wallet = new Wallet(PK!, provider);
    const broker = await createZGComputeNetworkBroker(wallet as any);
    engine = new CouncilEngine(broker, PROVIDER_ADDRESS!, ENDPOINT_URL);
    console.log(`[Server] ✅ Engine ready. Wallet: ${wallet.address}`);
}

// ── Routes ───────────────────────────────────────────────────────────────────

app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: engine ? 'ok' : 'initialising' });
});

app.post('/council', async (req: Request, res: Response) => {
    const { idea } = req.body as { idea?: string };

    if (!idea || typeof idea !== 'string' || !idea.trim()) {
        res.status(400).json({ error: 'Request body must include a non-empty "idea" string.' });
        return;
    }

    if (!engine) {
        res.status(503).json({ error: 'Engine is still initialising, please retry in a moment.' });
        return;
    }

    try {
        console.log(`[Council] Processing idea: "${idea.slice(0, 80)}…"`);
        const result = await engine.runCouncil(idea.trim());
        res.json(result);
    } catch (err: any) {
        console.error('[Council] Execution failed:', err.message);
        res.status(500).json({ error: err.message ?? 'Internal server error' });
    }
});

// ── Boot ─────────────────────────────────────────────────────────────────────
bootstrap()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`🚀 Council Inference Server listening on http://localhost:${PORT}`);
        });
    })
    .catch((err) => {
        console.error('[Server] Fatal initialisation error:', err);
        process.exit(1);
    });
