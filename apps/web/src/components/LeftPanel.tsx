import { useEffect, useState } from 'react';
import { useApp } from '../App';
import { Section } from './Section';
import { CustomSelect } from './CustomSelect';
import { SERVER_URL, upscalePng } from '../api';
import { exportMeshAsGLB } from '../exporters';

export function LeftPanel() {
  const layers = useApp(s => s.layers);
  const activeLayerId = useApp(s => s.activeLayerId);
  const composedCanvas = useApp(s => s.composedCanvas);
  const modelChoice = useApp(s => s.modelChoice);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    useApp.getState().composeLayers();
  }, [layers.length]);

  const onDownload = async () => {
    if (!composedCanvas) return;
    setDownloading(true);
    try {
      const blob = await new Promise<Blob>((resolve) => composedCanvas.toBlob(b => resolve(b!), 'image/png'));
      const up = await upscalePng(blob, 2).catch(() => blob);
      const url = URL.createObjectURL(up);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'closset-texture-upscaled.png';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  const decals = useApp((s:any) => s.decals || []);
  const activeDecalId = useApp((s:any) => s.activeDecalId || null);
  const addDecalFromFile = (useApp.getState() as any).addDecalFromFile;
  const selectDecal = (useApp.getState() as any).selectDecal;
  const updateDecal = (useApp.getState() as any).updateDecal;
  const removeDecal = (useApp.getState() as any).removeDecal;
  const addLayer = (useApp.getState() as any).addLayer;
  const nudgeModel = (useApp.getState() as any).nudgeModel;
  const rotateModel = (useApp.getState() as any).rotateModel;
  const resetModelTransform = (useApp.getState() as any).resetModelTransform;
  const setModelScale = (useApp.getState() as any).setModelScale;
  const modelScale = useApp(s => (s as any).modelScale || 1);
  const modelBoundsHeight = useApp(s => (s as any).modelBoundsHeight || null);
  const snapModelToOrigin = (useApp.getState() as any).snapModelToOrigin;
  const snapModelRotation90 = (useApp.getState() as any).snapModelRotation90;
  const setCameraView = (useApp.getState() as any).setCameraView;
  const toggleLayerVisibility = (useApp.getState() as any).toggleLayerVisibility;
  const setActiveLayerLock = (useApp.getState() as any).setActiveLayerLock;
  // selection UI removed

  return (
    <div>
      <Section title="Model Choice">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button className={`btn ${modelChoice === 'tshirt' ? 'active' : ''}`} onClick={() => useApp.getState().setModelChoice('tshirt')}>T‑Shirt</button>
          <button className={`btn ${modelChoice === 'sphere' ? 'active' : ''}`} onClick={() => useApp.getState().setModelChoice('sphere')}>Sphere</button>
        </div>
        <button className="btn" onClick={() => useApp.getState().openModelManager()}>
          Manage Models
        </button>
        {modelChoice === 'custom' && (
          <div style={{ marginTop: 8, fontSize: '12px', color: 'var(--muted)' }}>
            Custom model loaded
          </div>
        )}
        {modelChoice === 'custom' && (
          <button 
            className="btn" 
            onClick={() => useApp.getState().generateBaseLayer()}
            style={{ marginTop: 8 }}
          >
            Generate Base Layer
          </button>
        )}
      </Section>

              <Section title="Background Scene" defaultOpen={false}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '8px' }}>
              Current: {useApp(s => s.backgroundScene)}
            </div>
            <button className="btn" onClick={() => useApp.getState().openBackgroundManager()}>
              Change Background
            </button>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Intensity:</label>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={useApp(s => s.backgroundIntensity)}
                onChange={(e) => useApp.getState().setBackgroundIntensity(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <label style={{ fontSize: '12px', color: 'var(--muted)' }}>Rotation:</label>
              <input
                type="range"
                min="0"
                max="6.28"
                step="0.1"
                value={useApp(s => s.backgroundRotation)}
                onChange={(e) => useApp.getState().setBackgroundRotation(parseFloat(e.target.value))}
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px', padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px' }}>
              <strong>💡 Pro Tip:</strong> Use HDR (.hdr) files for professional lighting quality. 
              Default scenes use industry-standard HDR environment maps.
            </div>
          </div>
        </Section>

      <Section title="Layers">
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button className="btn" onClick={() => addLayer && addLayer()}>+ Add Layer</button>
        </div>
        <div>
          {layers.map(l => (
            <div key={l.id} style={{ display: 'grid', gridTemplateColumns: '36px 1fr', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <button
                className="btn"
                aria-label={l.visible ? 'Hide layer' : 'Show layer'}
                title={l.visible ? 'Hide layer' : 'Show layer'}
                onClick={() => toggleLayerVisibility && toggleLayerVisibility(l.id)}
                style={{ padding: 6, width: 36 }}
              >
                {l.visible ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#67e8f9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7Z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94M9.9 4.24A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.8 21.8 0 0 1-3.23 4.49"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
              <div style={{ display: 'grid', gap: 6 }}>
                <button className={`btn ${activeLayerId === l.id ? 'active' : ''}`} onClick={() => { useApp.setState({ activeLayerId: l.id }); (useApp.getState() as any).selectLayerForTransform(l.id); }}>{l.name}</button>
                {activeLayerId === l.id && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <button className="btn" onClick={()=> setActiveLayerLock(!l.lockTransparent)}>{l.lockTransparent ? 'Unlock Alpha' : 'Lock Alpha'}</button>
                    {/* mask controls removed */}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Export">
        <button className="btn" onClick={onDownload} disabled={downloading}>{downloading ? 'Exporting…' : 'Export Texture PNG'}</button>
        <div style={{ marginTop: 8 }}>
          <button className="btn" onClick={async () => {
            const textureCanvas = useApp.getState().composedCanvas;
            if (!textureCanvas) return;
            await exportMeshAsGLB(textureCanvas);
          }}>Export GLB</button>
        </div>
      </Section>



      <Section title="Decals (Images)">
        <input type="file" accept="image/*" onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f || !addDecalFromFile) return;
          await addDecalFromFile(f, undefined, activeLayerId);
        }} />
        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
          {decals.filter((d:any)=> d.layerId === activeLayerId).map((d: any) => (
            <div key={d.id} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button className={`btn ${activeDecalId === d.id ? 'active' : ''}`} onClick={() => selectDecal && selectDecal(d.id)}>{d.name}</button>
              <input type="range" min={0.1} max={2} step={0.05} value={d.scale} onChange={(e) => updateDecal && updateDecal(d.id, { scale: Number(e.target.value) })} />
              <input type="range" min={0} max={1} step={0.05} value={d.opacity} onChange={(e) => updateDecal && updateDecal(d.id, { opacity: Number(e.target.value) })} />
              <button className="btn" onClick={() => removeDecal && removeDecal(d.id)}>Remove</button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Navigate Model">
        <div style={{ display:'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
          <button className="btn" onClick={()=> nudgeModel('x', -0.05)}>X-</button>
          <button className="btn" onClick={()=> nudgeModel('x', +0.05)}>X+</button>
          <button className="btn" onClick={()=> rotateModel('x', 15)}>Rot X</button>
          <button className="btn" onClick={()=> nudgeModel('y', -0.05)}>Y-</button>
          <button className="btn" onClick={()=> nudgeModel('y', +0.05)}>Y+</button>
          <button className="btn" onClick={()=> rotateModel('y', 15)}>Rot Y</button>
          <button className="btn" onClick={()=> nudgeModel('z', -0.05)}>Z-</button>
          <button className="btn" onClick={()=> nudgeModel('z', +0.05)}>Z+</button>
          <button className="btn" onClick={()=> rotateModel('z', 15)}>Rot Z</button>
        </div>
        <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
          <button className="btn" onClick={()=> resetModelTransform()}>Reset</button>
          <button className="btn" onClick={()=> snapModelToOrigin()}>Snap Origin</button>
          <button className="btn" onClick={()=> snapModelRotation90()}>Snap Rot 90°</button>
        </div>
        <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
          <CustomSelect
            value=""
            placeholder="Camera View…"
            onChange={(v)=> setCameraView(v)}
            options={[
              { value: 'front', label: 'Front' },
              { value: 'back', label: 'Back' },
              { value: 'left', label: 'Left' },
              { value: 'right', label: 'Right' },
              { value: 'top', label: 'Top' },
              { value: 'bottom', label: 'Bottom' },
            ]}
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <div className="label">Model Scale ({modelScale.toFixed(2)}×)</div>
          <input type="range" min={0.25} max={2} step={0.05} value={modelScale} onChange={(e)=> setModelScale && setModelScale(Number(e.target.value))} />
          {modelBoundsHeight && (<div className="label">Model Height ≈ {(modelBoundsHeight * modelScale).toFixed(2)} m</div>)}
        </div>
      </Section>

      {/* Selection section removed */}
    </div>
  );
}


