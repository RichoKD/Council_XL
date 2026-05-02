import { useState } from 'react';

const INFERENCE_URL = import.meta.env.VITE_INFERENCE_URL ?? 'http://localhost:3001';

interface CouncilResult {
    critiques: Record<string, string>;
    finalPlan: string;
}

const AGENT_LABELS: Record<string, string> = {
    'security-auditor': '🔒 Security Auditor',
    'scalability-architect': '📐 Scalability Architect',
    'product-manager': '🎯 Product Manager',
};

export function CouncilUI() {
    const [idea, setIdea] = useState<string>('');
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [result, setResult] = useState<CouncilResult | null>(null);
    const [openAgent, setOpenAgent] = useState<string | null>(null);

    const handleSubmit = async () => {
        if (!idea.trim()) {
            setStatus('Please enter an idea before submitting.');
            return;
        }

        setLoading(true);
        setResult(null);
        setStatus('Submitting to the AI Council…');

        try {
            const res = await fetch(`${INFERENCE_URL}/council`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: idea.trim() }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: res.statusText }));
                throw new Error(err.error ?? `Server error ${res.status}`);
            }

            const data: CouncilResult = await res.json();
            setResult(data);
            setStatus('');
        } catch (err: any) {
            setStatus(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="council-ui glass-panel">
            <h2>Submit to the Council</h2>

            <div className="form-group prompt-group">
                <label>Your Idea</label>
                <textarea
                    rows={5}
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    placeholder="Describe your idea for the council to brutally stress-test…"
                    disabled={loading}
                />
            </div>

            <button
                className="submit-btn"
                onClick={handleSubmit}
                disabled={loading || !idea.trim()}
            >
                {loading ? (
                    <span className="spinner-text">⏳ Council deliberating…</span>
                ) : (
                    'Submit to Council'
                )}
            </button>

            {status && <div className="status-indicator">{status}</div>}

            {result && (
                <div className="results-container">
                    {/* Per-agent critiques */}
                    <h3 className="results-heading">Council Critiques</h3>
                    <div className="critiques-list">
                        {Object.entries(result.critiques).map(([agentId, text]) => (
                            <div key={agentId} className="critique-card glass-panel">
                                <button
                                    className="critique-toggle"
                                    onClick={() =>
                                        setOpenAgent(openAgent === agentId ? null : agentId)
                                    }
                                >
                                    {AGENT_LABELS[agentId] ?? agentId}
                                    <span className="chevron">
                                        {openAgent === agentId ? '▲' : '▼'}
                                    </span>
                                </button>
                                {openAgent === agentId && (
                                    <pre className="critique-body">{text}</pre>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Final implementation plan */}
                    <h3 className="results-heading">Implementation Plan</h3>
                    <div className="final-plan glass-panel">
                        <pre>{result.finalPlan}</pre>
                    </div>
                </div>
            )}
        </div>
    );
}
