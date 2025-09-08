import { useState, PropsWithChildren } from 'react';

export function Section({ title, defaultOpen = true, children }: PropsWithChildren<{ title: string; defaultOpen?: boolean }>) {
  const [open, setOpen] = useState<boolean>(defaultOpen);
  return (
    <div className={`section ${open ? '' : 'collapsed'}`}>
      <div className="section-header" onClick={() => setOpen(!open)} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } }}>
        <span className="section-title">{title}</span>
        <span className="section-toggle" aria-hidden>{open ? '▾' : '▸'}</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}


