import { useId, useState } from 'react';
import { AlertIcon, EyeIcon, EyeOffIcon } from './Icons.jsx';

export default function TextField({ label, icon, error, type = 'text', ...rest }) {
  const id = useId();
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const errId = `${id}-err`;

  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div className="control">
        <span className="control-icon">{icon}</span>
        <div className="control-body">
          <label htmlFor={id}>{label}</label>
          <input
            id={id}
            type={isPassword && show ? 'text' : type}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errId : undefined}
            {...rest}
          />
        </div>
        {isPassword && (
          <button
            type="button"
            className="toggle-visibility"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Hide password' : 'Show password'}
            aria-pressed={show}
          >
            <span key={String(show)} className="swap">{show ? <EyeIcon /> : <EyeOffIcon />}</span>
          </button>
        )}
      </div>
      <div className="field-msg" id={errId} role={error ? 'alert' : undefined}>
        {error && (<><AlertIcon /> {error}</>)}
      </div>
    </div>
  );
}
