// Client for calling our server OpenRouter proxy
// Do not expose API keys here. The server reads OPENROUTER_API_KEY from env.
const SERVER_BASE = import.meta.env?.VITE_SERVER_URL || 'http://localhost:4000';
export async function chatOpenRouter(params) {
    const res = await fetch(`${SERVER_BASE}/api/ai/chat-openrouter`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: params.model || 'openrouter/sonoma-sky-alpha',
            messages: params.messages,
            temperature: params.temperature ?? 0.7,
            max_tokens: params.max_tokens ?? 1024,
        }),
    });
    if (!res.ok) {
        const text = await res.text();
        throw new Error(`OpenRouter proxy error: ${res.status} ${text}`);
    }
    return res.json();
}
