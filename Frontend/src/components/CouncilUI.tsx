import React, { useState } from 'react';
import { use0gBroker } from '../hooks/use0gBroker';

export function CouncilUI() {
    const broker = use0gBroker();
    const [providerAddress, setProviderAddress] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const [amount, setAmount] = useState<string>('0.001');
    const [response, setResponse] = useState<string>('');
    const [status, setStatus] = useState<string>('');

    const handleDeposit = async () => {
        if (!broker || !amount) return;
        try {
            setStatus('Depositing funds...');
            await broker.ledger.depositFund(amount);
            setStatus('Deposit successful!');
        } catch (err: any) {
            console.error(err);
            setStatus(`Deposit failed: ${err.message}`);
        }
    };

    const handleTransfer = async () => {
        if (!broker || !providerAddress || !amount) return;
        try {
            setStatus('Transferring to provider sub-account...');
            await broker.ledger.transferFund(providerAddress, 'inference', amount);
            setStatus('Transfer successful!');
        } catch (err: any) {
            console.error(err);
            setStatus(`Transfer failed: ${err.message}`);
        }
    };

    const handleCheckLedger = async () => {
        if (!broker) return;
        try {
            setStatus('Checking ledger...');
            const ledger = await broker.ledger.getLedger();
            setStatus(`Ledger info: ${JSON.stringify(ledger)}`);
        } catch (err: any) {
            console.error(err);
            setStatus(`Check Ledger failed: ${err.message}`);
        }
    };

    const handlePromptSubmit = async () => {
        if (!broker || !providerAddress || !prompt) {
            setStatus('Please set provider endpoint URL and provider address.');
            return;
        }

        // We assume the provider endpoint URL is provided as part of address for this demo, 
        // or typically we query the provider registry. 
        // For simplicity, we just ask for the URL in another field.
        const endpointUrl = promptUrl || 'http://localhost:11434/v1/chat/completions';

        try {
            setStatus('Generating request headers...');
            const content = prompt;
            const { headers } = await broker.inference.getRequestHeaders(providerAddress, content);

            setStatus('Sending request to AI Council...');
            const res = await fetch(endpointUrl, {
                method: 'POST',
                headers: {
                    ...headers,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'deepseek-coder',
                    messages: [{ role: 'user', content }],
                })
            });

            const data = await res.json();
            if (!res.ok) {
                setStatus(`API Error: ${JSON.stringify(data)}`);
                return;
            }

            setResponse(JSON.stringify(data.choices?.[0]?.message?.content || data, null, 2));
            setStatus('Response received.');
        } catch (err: any) {
            console.error(err);
            setStatus(`Inference failed: ${err.message}`);
        }
    };

    const [promptUrl, setPromptUrl] = useState<string>('');

    if (!broker) {
        return (
            <div className="council-ui">
                <p className="notice">Please connect your wallet to access the Council parameters.</p>
            </div>
        );
    }

    return (
        <div className="council-ui glass-panel">
            <h2>Council Parameters</h2>

            <div className="form-group">
                <label>Provider Endpoint URL</label>
                <input
                    type="text"
                    value={promptUrl}
                    onChange={(e) => setPromptUrl(e.target.value)}
                    placeholder="https://example.provider.com/chat/completions"
                />
            </div>

            <div className="form-group">
                <label>Provider Address (0x...)</label>
                <input
                    type="text"
                    value={providerAddress}
                    onChange={(e) => setProviderAddress(e.target.value)}
                    placeholder="0xProviderAddress"
                />
            </div>

            <div className="ledger-controls">
                <input
                    type="number"
                    value={amount}
                    step="0.001"
                    onChange={(e) => setAmount(e.target.value)}
                />
                <button className="btn" onClick={handleDeposit}>Deposit 0G</button>
                <button className="btn" onClick={handleTransfer}>Transfer to Provider</button>
                <button className="btn outline" onClick={handleCheckLedger}>Check Ledger</button>
            </div>

            <div className="form-group prompt-group">
                <label>Your Idea (Prompt)</label>
                <textarea
                    rows={5}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your idea for the council to brutally stress-test..."
                />
            </div>

            <button className="submit-btn" onClick={handlePromptSubmit}>Submit to Council</button>

            {status && <div className="status-indicator">{status}</div>}

            {response && (
                <div className="response-container">
                    <h3>Council Synthesis</h3>
                    <pre>{response}</pre>
                </div>
            )}
        </div>
    );
}
