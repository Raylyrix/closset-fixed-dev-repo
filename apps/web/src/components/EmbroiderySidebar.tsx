import React from 'react';
import EmbroideryTool from './EmbroideryTool';

interface EmbroiderySidebarProps {
  active: boolean;
}

export function EmbroiderySidebar({ active }: EmbroiderySidebarProps) {
  if (!active) return null;

  return (
    <div className="embroidery-sidebar-container" style={{
      position: 'fixed',
      top: '60px', // Below the toolbar
      right: '0',
      width: '320px',
      height: 'calc(100vh - 60px)',
      background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
      borderLeft: '1px solid #334155',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <EmbroideryTool active={true} />
    </div>
  );
}
