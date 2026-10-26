import { useRef } from 'react';

// Accessible tab list (arrow keys / Home / End move between modes).
export default function ModeTabs({ modes, value, onChange, idPrefix = 'scan' }) {
  const refs = useRef({});

  const onKeyDown = (e) => {
    const i = modes.findIndex((m) => m.id === value);
    let next = null;
    if (e.key === 'ArrowRight') next = (i + 1) % modes.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + modes.length) % modes.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = modes.length - 1;
    if (next === null) return;
    e.preventDefault();
    onChange(modes[next].id);
    refs.current[modes[next].id]?.focus();
  };

  return (
    <div className="mode-tabs" role="tablist" aria-label="What would you like to check?" onKeyDown={onKeyDown}>
      {modes.map((m) => (
        <button
          key={m.id}
          ref={(el) => { refs.current[m.id] = el; }}
          type="button"
          role="tab"
          id={`${idPrefix}-tab-${m.id}`}
          aria-selected={value === m.id}
          aria-controls={`${idPrefix}-panel`}
          tabIndex={value === m.id ? 0 : -1}
          className={`mode-tab ${value === m.id ? 'active' : ''}`}
          onClick={() => onChange(m.id)}
        >
          <span className="mode-tab-icon">{m.icon}</span>
          <span>{m.label}</span>
        </button>
      ))}
    </div>
  );
}
