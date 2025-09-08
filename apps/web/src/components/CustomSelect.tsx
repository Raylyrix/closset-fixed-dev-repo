import { useEffect, useRef, useState } from 'react';

export type SelectOption = { value: string; label: string; disabled?: boolean };

type Props = {
  options: SelectOption[];
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  minWidth?: number;
};

export function CustomSelect({ options, value, placeholder = 'Select…', onChange, minWidth = 200 }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find(o => o.value === value);
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', onClick);
    return () => window.removeEventListener('mousedown', onClick);
  }, []);
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(o => !o); }
    if (e.key === 'Escape') setOpen(false);
  };
  return (
    <div className="select" ref={ref} style={{ minWidth }}>
      <button className="select-btn" onClick={() => setOpen(o => !o)} onKeyDown={onKey} aria-haspopup="listbox" aria-expanded={open}>
        <span className={`select-label ${current ? '' : 'placeholder'}`}>{current?.label || placeholder}</span>
        <span className="select-caret">▾</span>
      </button>
      {open && (
        <div className="select-menu" role="listbox">
          {options.map(opt => (
            <div
              key={opt.value}
              className={`select-item ${opt.disabled ? 'disabled' : ''} ${opt.value === value ? 'active' : ''}`}
              onClick={() => { if (opt.disabled) return; onChange(opt.value); setOpen(false); }}
              role="option"
              aria-selected={opt.value === value}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


