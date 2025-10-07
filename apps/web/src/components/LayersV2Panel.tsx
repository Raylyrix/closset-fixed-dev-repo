import React, { useMemo, useState } from 'react';
import { useApp } from '../App';
import { Layer as AdvLayer } from '../types/layers';

type StyleCommit = (patch: Partial<NonNullable<AdvLayer['styles']>>) => void;

const ensureStroke = (styles: NonNullable<AdvLayer['styles']>) => ({
  enabled: false,
  color: '#ffffff',
  width: 4,
  align: 'center' as const,
  join: 'miter' as const,
  cap: 'butt' as const,
  ...(styles.stroke ?? {})
});

const ensureShadow = (styles: NonNullable<AdvLayer['styles']>) => ({
  enabled: false,
  color: '#000000',
  blur: 12,
  dx: 4,
  dy: 4,
  spread: 0,
  ...(styles.dropShadow ?? {})
});

const ensureGlow = (styles: NonNullable<AdvLayer['styles']>) => ({
  enabled: false,
  color: '#ffffff',
  size: 20,
  opacity: 0.75,
  ...(styles.glow ?? {})
});

export function LayersV2Panel(): JSX.Element {
  const project = useApp(s => s.project);
  const setProject = useApp(s => s.setProject);
  const updateLayerV2 = useApp(s => s.updateLayerV2);
  const addImageV2 = useApp(s => s.addImageV2);
  const selectedLayerId = useApp(s => s.selectedLayerV2);
  const selectLayerV2 = useApp(s => s.selectLayerV2);
  const setClipMaskV2 = useApp(s => s.setClipMaskV2);
  const [stackOpen, setStackOpen] = useState(true);
  const [stylesOpen, setStylesOpen] = useState(true);
  const [actionsOpen, setActionsOpen] = useState(false);

  const selectedLayer = selectedLayerId && project ? project.layers[selectedLayerId] as AdvLayer : null;
  const selectedStyles = selectedLayer?.styles ?? { blendMode: 'source-over' };

  const clipMaskCandidates = useMemo(() => {
    if (!project || !selectedLayer || selectedLayer.type !== 'image') return [] as { id: string; name: string }[];
    const index = project.layerOrder.indexOf(selectedLayer.id);
    if (index <= 0) return [];
    return project.layerOrder
      .slice(0, index)
      .map(id => project.layers[id] as AdvLayer)
      .filter(layer => layer && layer.type === 'vector')
      .map(layer => ({ id: layer.id, name: layer.name }));
  }, [project, selectedLayer]);

  const hasClipMaskOptions = clipMaskCandidates.length > 0;

  const commitStyles: StyleCommit = (patch) => {
    if (!selectedLayerId) return;
    const merged = { ...selectedStyles, ...patch } as AdvLayer['styles'];
    updateLayerV2(selectedLayerId, { styles: merged } as Partial<AdvLayer>);
  };

  if (!project || project.layerOrder.length === 0) {
    return (
      <div style={{ padding: '12px', background: 'rgba(0,0,0,0.1)', borderRadius: '6px', margin: '8px 0' }}>
        <div style={{ fontSize: '11px', opacity: 0.7, marginBottom: '8px' }}>
          No v2 layers yet. Add an image to get started.
        </div>
        <button
          className="btn"
          onClick={async () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (event) => {
              const file = (event.target as HTMLInputElement).files?.[0];
              if (file) await addImageV2(file);
            };
            input.click();
          }}
          style={{ fontSize: '10px', padding: '6px 12px' }}
        >
          + Add Image Layer
        </button>
      </div>
    );
  }

  const blendModes = [
    'source-over', 'multiply', 'screen', 'overlay', 'darken', 'lighten',
    'color-dodge', 'color-burn', 'hard-light', 'soft-light', 'difference', 'exclusion'
  ] as GlobalCompositeOperation[];

  return (
    <div style={{ padding: '8px 0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: 600 }}>Layers (v2) - Beta</div>
        <button
          className="btn"
          onClick={async () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (event) => {
              const file = (event.target as HTMLInputElement).files?.[0];
              if (file) await addImageV2(file);
            };
            input.click();
          }}
          style={{ fontSize: '9px', padding: '4px 8px' }}
        >
          + Image
        </button>
      </div>

      <section style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
        <header
          onClick={() => setStackOpen(o => !o)}
          style={{
            padding: '6px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px'
          }}
        >
          <span>Layer Stack</span>
          <span>{stackOpen ? '▾' : '▸'}</span>
        </header>
        {stackOpen && (
          <div style={{ maxHeight: '220px', overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {project.layerOrder.slice().reverse().map((layerId) => {
              const layer = project.layers[layerId] as AdvLayer;
              if (!layer) return null;
              const isSelected = selectedLayerId === layerId;
              const isMasked = !!layer.mask?.layerId;
              const title = `${layer.name} | ${layer.type.toUpperCase()}\nBlend: ${layer.styles?.blendMode || 'source-over'}${isMasked ? `\nMask: ${layer.mask?.layerId}` : ''}`;

              return (
                <div
                  key={layerId}
                  onClick={() => selectLayerV2(layerId)}
                  title={title}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'auto auto 1fr auto',
                    gap: '6px',
                    alignItems: 'center',
                    padding: '4px 6px',
                    background: isSelected ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)',
                    borderRadius: '4px',
                    border: isSelected ? '1px solid #FFFFFF' : '1px solid transparent',
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'background 120ms ease, border 120ms ease'
                  }}
                >
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      updateLayerV2(layerId, { visible: !layer.visible });
                    }}
                    style={{
                      width: 16,
                      height: 16,
                      padding: 0,
                      background: layer.visible ? '#FFFFFF' : '#64748b',
                      border: 'none',
                      borderRadius: '2px',
                      color: 'white',
                      fontSize: '8px'
                    }}
                  >
                    {layer.visible ? '👁' : '🚫'}
                  </button>

                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      updateLayerV2(layerId, { locked: !layer.locked });
                    }}
                    style={{
                      width: 16,
                      height: 16,
                      padding: 0,
                      background: layer.locked ? '#ef4444' : '#64748b',
                      border: 'none',
                      borderRadius: '2px',
                      color: 'white',
                      fontSize: '8px'
                    }}
                  >
                    {layer.locked ? '🔒' : '🔓'}
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px' }}>
                    <span>{layer.name}</span>
                    {!layer.visible && <span style={{ opacity: 0.6 }}>• Hidden</span>}
                    {layer.locked && <span style={{ opacity: 0.6 }}>• Locked</span>}
                    {isMasked && <span style={{ opacity: 0.6 }}>• Clipped</span>}
                  </div>

                  <select
                    value={layer.styles?.blendMode || 'source-over'}
                    onChange={(event) => {
                      event.stopPropagation();
                      updateLayerV2(layerId, {
                        styles: { ...layer.styles, blendMode: event.target.value as GlobalCompositeOperation }
                      });
                    }}
                    style={{ fontSize: '8px', padding: '2px', width: '70px' }}
                  >
                    {blendModes.map(mode => (
                      <option key={mode} value={mode}>{mode.split('-')[0]}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {selectedLayer && selectedLayer.type === 'image' && (
        <section style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
          <header
            onClick={() => setStylesOpen(o => !o)}
            style={{
              padding: '6px 8px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              cursor: 'pointer',
              fontSize: '10px',
              background: 'rgba(255,255,255,0.05)',
              borderTopLeftRadius: '6px',
              borderTopRightRadius: '6px'
            }}
          >
            <span>Layer Styles</span>
            <span>{stylesOpen ? '▾' : '▸'}</span>
          </header>
          {stylesOpen && (
            <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: 600 }}>Layer Styles</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
              <span>Clip Mask</span>
              <select
                value={selectedLayer.mask?.layerId ?? ''}
                onChange={(event) => {
                  const value = event.target.value.trim();
                  setClipMaskV2(selectedLayerId!, value === '' ? null : value);
                }}
                style={{ fontSize: '10px', padding: '2px 4px' }}
                disabled={!hasClipMaskOptions}
              >
                <option value="">None</option>
                {clipMaskCandidates.map(candidate => (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                  </option>
                ))}
              </select>
            </div>
            <span style={{ opacity: 0.65 }}>
              {hasClipMaskOptions
                ? 'Select a vector layer above this image to act as a clip mask.'
                : 'Add a vector layer above this image to enable clipping.'}
            </span>
          </div>

          {(() => {
            const stroke = ensureStroke(selectedStyles as NonNullable<AdvLayer['styles']>);
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={stroke.enabled}
                    onChange={(event) => commitStyles({ stroke: { ...stroke, enabled: event.target.checked } })}
                  />
                  Stroke
                </label>
                {stroke.enabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <input
                      type="color"
                      value={stroke.color}
                      onChange={(event) => commitStyles({ stroke: { ...stroke, enabled: true, color: event.target.value } })}
                    />
                    <input
                      type="number"
                      min={0}
                      max={64}
                      value={stroke.width}
                      onChange={(event) => commitStyles({ stroke: { ...stroke, enabled: true, width: Number(event.target.value) } })}
                      style={{ width: 50, fontSize: '10px', padding: '2px 4px' }}
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {(() => {
            const dropShadow = ensureShadow(selectedStyles as NonNullable<AdvLayer['styles']>);
            return (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={dropShadow.enabled}
                    onChange={(event) => commitStyles({ dropShadow: { ...dropShadow, enabled: event.target.checked } })}
                  />
                  Drop Shadow
                </label>
                {dropShadow.enabled && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: '4px', fontSize: '9px' }}>
                    <input
                      type="color"
                      value={dropShadow.color}
                      onChange={(event) => commitStyles({ dropShadow: { ...dropShadow, enabled: true, color: event.target.value } })}
                    />
                    <input
                      type="number"
                      value={dropShadow.blur}
                      min={0}
                      max={100}
                      onChange={(event) => commitStyles({ dropShadow: { ...dropShadow, enabled: true, blur: Number(event.target.value) } })}
                      placeholder="Blur"
                    />
                    <input
                      type="number"
                      value={dropShadow.dx}
                      min={-100}
                      max={100}
                      onChange={(event) => commitStyles({ dropShadow: { ...dropShadow, enabled: true, dx: Number(event.target.value) } })}
                      placeholder="dx"
                    />
                    <input
                      type="number"
                      value={dropShadow.dy}
                      min={-100}
                      max={100}
                      onChange={(event) => commitStyles({ dropShadow: { ...dropShadow, enabled: true, dy: Number(event.target.value) } })}
                      placeholder="dy"
                    />
                    <input
                      type="number"
                      value={dropShadow.spread ?? 0}
                      min={-100}
                      max={100}
                      onChange={(event) => commitStyles({ dropShadow: { ...dropShadow, enabled: true, spread: Number(event.target.value) } })}
                      placeholder="spread"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          {(() => {
            const glow = ensureGlow(selectedStyles as NonNullable<AdvLayer['styles']>);
            return (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <input
                    type="checkbox"
                    checked={glow.enabled}
                    onChange={(event) => commitStyles({ glow: { ...glow, enabled: event.target.checked } })}
                  />
                  Glow
                </label>
                {glow.enabled && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <input
                      type="color"
                      value={glow.color}
                      onChange={(event) => commitStyles({ glow: { ...glow, enabled: true, color: event.target.value } })}
                    />
                    <input
                      type="number"
                      min={0}
                      max={200}
                      value={glow.size}
                      onChange={(event) => commitStyles({ glow: { ...glow, enabled: true, size: Number(event.target.value) } })}
                      style={{ width: 48, fontSize: '10px', padding: '2px 4px' }}
                    />
                    <input
                      type="number"
                      min={0}
                      max={1}
                      step={0.05}
                      value={glow.opacity}
                      onChange={(event) => commitStyles({ glow: { ...glow, enabled: true, opacity: Number(event.target.value) } })}
                      style={{ width: 48, fontSize: '10px', padding: '2px 4px' }}
                    />
                  </div>
                )}
              </div>
            );
          })()}
        </div>
          )}
        </section>
      )}

      <section style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px' }}>
        <header
          onClick={() => setActionsOpen(o => !o)}
          style={{
            padding: '6px 8px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '10px',
            background: 'rgba(255,255,255,0.05)',
            borderTopLeftRadius: '6px',
            borderTopRightRadius: '6px'
          }}
        >
          <span>Quick Actions</span>
          <span>{actionsOpen ? '▾' : '▸'}</span>
        </header>
        {actionsOpen && (
          <div style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '9px', opacity: 0.7, marginBottom: '4px' }}>Quick Actions</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            className="btn"
            onClick={() => {
              if (project) {
                localStorage.setItem('closset_project_v2', JSON.stringify(project));
              }
            }}
            style={{ fontSize: '8px', padding: '3px 6px' }}
          >
            Save
          </button>
          <button
            className="btn"
            onClick={() => {
              try {
                const saved = localStorage.getItem('closset_project_v2');
                if (saved) {
                  setProject(JSON.parse(saved));
                } else {
                  console.warn('No saved project found');
                }
              } catch (error) {
                console.error('Failed to load project', error);
              }
            }}
            style={{ fontSize: '8px', padding: '3px 6px' }}
          >
            Load
          </button>
        </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default LayersV2Panel;
