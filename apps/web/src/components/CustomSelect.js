import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
export function CustomSelect({ options, value, placeholder = 'Select…', onChange, minWidth = 200 }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const current = options.find(o => o.value === value);
    useEffect(() => {
        const onClick = (e) => {
            if (!ref.current)
                return;
            if (!ref.current.contains(e.target))
                setOpen(false);
        };
        window.addEventListener('mousedown', onClick);
        return () => window.removeEventListener('mousedown', onClick);
    }, []);
    const onKey = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(o => !o);
        }
        if (e.key === 'Escape')
            setOpen(false);
    };
    return (_jsxs("div", { className: "select", ref: ref, style: { minWidth }, children: [_jsxs("button", { className: "select-btn", onClick: () => setOpen(o => !o), onKeyDown: onKey, "aria-haspopup": "listbox", "aria-expanded": open, children: [_jsx("span", { className: `select-label ${current ? '' : 'placeholder'}`, children: current?.label || placeholder }), _jsx("span", { className: "select-caret", children: "\u25BE" })] }), open && (_jsx("div", { className: "select-menu", role: "listbox", children: options.map(opt => (_jsx("div", { className: `select-item ${opt.disabled ? 'disabled' : ''} ${opt.value === value ? 'active' : ''}`, onClick: () => { if (opt.disabled)
                        return; onChange(opt.value); setOpen(false); }, role: "option", "aria-selected": opt.value === value, children: opt.label }, opt.value))) }))] }));
}
