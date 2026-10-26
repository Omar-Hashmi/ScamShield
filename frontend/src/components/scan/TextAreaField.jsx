import { useId } from 'react';
import { AlertIcon } from '../Icons.jsx';

// Same look as TextField (icon cell + floating label) but for longer pasted messages.
export default function TextAreaField({ label, icon, error, max, value, ...rest }) {
  const id = useId();
  const errId = `${id}-err`;
  const near = max && value.length > max * 0.9;
  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <div className="control control-area">
        <span className="control-icon">{icon}</span>
        <div className="control-body">
          <label htmlFor={id}>{label}</label>
          <textarea id={id} value={value} aria-invalid={Boolean(error)} aria-describedby={error ? errId : undefined} {...rest} />
        </div>
      </div>
      <div className="field-foot">
        <div className="field-msg" id={errId} role={error ? 'alert' : undefined}>
          {error && (<><AlertIcon /> {error}</>)}
        </div>
        {max && <span className={`char-count ${near ? 'near' : ''}`} aria-live="off">{value.length.toLocaleString()} / {max.toLocaleString()}</span>}
      </div>
    </div>
  );
}
