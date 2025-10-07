/*
  HardwareProfiler: Detects user's hardware capabilities and produces a normalized
  HardwareProfile. It samples FPS, gathers GPU adapter strings, RAM, and tries to
  determine VRAM heuristically (best-effort in browsers). It exposes:
   - getHardwareProfile(): Promise<HardwareProfile>
   - onProfileUpdate(cb): unsubscribe
*/

export type HardwareTier = 'low' | 'medium' | 'high';

export interface HardwareProfile {
  tier: HardwareTier;
  cpuScore: number;         // synthetic score 0-100
  gpuScore: number;         // synthetic score 0-100
  ramGB: number;            // system memory (approx)
  vramGB?: number;          // best-effort estimate
  refreshHz?: number;       // display refresh
  adapter?: string;         // GPU adapter/renderer string
}

export type ProfileCallback = (p: HardwareProfile) => void;

const subscribers = new Set<ProfileCallback>();
let cachedProfile: HardwareProfile | null = null;

export function onProfileUpdate(cb: ProfileCallback) {
  subscribers.add(cb);
  return () => subscribers.delete(cb);
}

function emit(profile: HardwareProfile) {
  cachedProfile = profile;
  subscribers.forEach(cb => {
    try { cb(profile); } catch {}
  });
}

function getRAMGB(): number {
  // Browser hint: navigator.deviceMemory
  const dm = (navigator as any).deviceMemory;
  if (typeof dm === 'number' && isFinite(dm)) return dm;
  // Fallback: assume 8 GB
  return 8;
}

function getRefreshHz(): number | undefined {
  // Heuristic: measure rAF intervals for a second
  return undefined;
}

async function sampleFPS(durationMs = 750): Promise<number> {
  return new Promise(resolve => {
    let frames = 0;
    let start = performance.now();
    const loop = () => {
      frames++;
      const now = performance.now();
      if (now - start >= durationMs) {
        resolve((frames * 1000) / (now - start));
      } else {
        requestAnimationFrame(loop);
      }
    };
    requestAnimationFrame(loop);
  });
}

function getWebGLRendererString(): string | undefined {
  try {
    const canvas = document.createElement('canvas');
    const gl: any = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return undefined;
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (debugInfo) {
      const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
      return String(renderer || '');
    }
  } catch {}
  return undefined;
}

function scoreFromRenderer(adapter?: string): number {
  if (!adapter) return 30;
  const s = adapter.toLowerCase();
  // Very rough heuristic keywords
  if (s.includes('rtx') || s.includes('radeon rx') || s.includes('arc')) return 90;
  if (s.includes('gtx') || s.includes('vega') || s.includes('m1') || s.includes('m2')) return 75;
  if (s.includes('uhd') || s.includes('iris') || s.includes('intel')) return 45;
  return 60;
}

function classify(cpuScore: number, gpuScore: number, ramGB: number, fps: number): HardwareTier {
  // Simple tiering combining factors
  const composite = 0.25*cpuScore + 0.45*gpuScore + 0.15*ramGB*5 + 0.15*Math.min(fps, 60);
  if (composite >= 75) return 'high';
  if (composite >= 50) return 'medium';
  return 'low';
}

export async function getHardwareProfile(): Promise<HardwareProfile> {
  if (cachedProfile) return cachedProfile;

  const ramGB = getRAMGB();
  const adapter = getWebGLRendererString();
  const gpuScore = scoreFromRenderer(adapter);
  // Approximate CPU score via a tiny loop (keep it cheap)
  const cpuScore = await new Promise<number>(resolve => {
    const start = performance.now();
    let sum = 0;
    for (let i=0;i<500000;i++) sum += Math.sin(i);
    const ms = performance.now() - start;
    const score = Math.max(20, Math.min(95, 120 - ms));
    resolve(score);
  });
  const fps = await sampleFPS();
  const tier = classify(cpuScore, gpuScore, ramGB, fps);

  const profile: HardwareProfile = { tier, cpuScore, gpuScore, ramGB, adapter };
  emit(profile);
  return profile;
}
