import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export function Section({ title, defaultOpen = true, children }) {
    const [open, setOpen] = useState(defaultOpen);
    return (_jsxs("div", { className: `section ${open ? '' : 'collapsed'}`, children: [_jsxs("div", { className: "section-header", onClick: () => setOpen(!open), role: "button", tabIndex: 0, onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setOpen(!open);
                } }, children: [_jsx("span", { className: "section-title", children: title }), _jsx("span", { className: "section-toggle", "aria-hidden": true, children: open ? '▾' : '▸' })] }), open && _jsx("div", { className: "section-body", children: children })] }));
}
