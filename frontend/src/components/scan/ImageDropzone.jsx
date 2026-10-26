import { useEffect, useRef, useState } from 'react';
import { AlertIcon, CloseIcon, UploadIcon } from '../Icons.jsx';
import { LIMITS, formatBytes } from '../../utils/scanRules.js';

// Click, drag-and-drop, or paste (Ctrl/Cmd+V) a screenshot. The preview never leaves the browser.
export default function ImageDropzone({ file, onFile, error }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  useEffect(() => {
    if (!file) { setPreviewUrl(''); return undefined; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Paste support: most people have a screenshot on the clipboard already.
  useEffect(() => {
    const onPaste = (e) => {
      const item = [...(e.clipboardData?.files || [])].find((f) => f.type.startsWith('image/'));
      if (item) { e.preventDefault(); onFile(item); }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [onFile]);

  const pick = (list) => { if (list && list[0]) onFile(list[0]); };
  const open = () => inputRef.current?.click();

  return (
    <div className={`field ${error ? 'has-error' : ''}`}>
      <input ref={inputRef} type="file" hidden accept={LIMITS.imageTypes.join(',')}
        onChange={(e) => { pick(e.target.files); e.target.value = ''; }} />

      {file ? (
        <div className="dz-preview">
          <img src={previewUrl} alt="Preview of the screenshot you selected" />
          <div className="dz-meta">
            <strong title={file.name}>{file.name}</strong>
            <span>{formatBytes(file.size)}</span>
          </div>
          <button type="button" className="dz-remove" onClick={() => onFile(null)} aria-label="Remove screenshot"><CloseIcon /></button>
        </div>
      ) : (
        <div
          className={`dz ${dragging ? 'dragging' : ''}`}
          role="button" tabIndex={0}
          onClick={open}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files); }}
          aria-describedby="dz-help"
        >
          <span className="dz-icon"><UploadIcon /></span>
          <span className="dz-title">Drop a screenshot here, or <span className="link">browse</span></span>
          <span className="dz-sub" id="dz-help">You can also paste one with Ctrl+V · JPG, PNG or WebP · up to {LIMITS.maxImageMB} MB</span>
        </div>
      )}

      <div className="field-msg" role={error ? 'alert' : undefined}>
        {error && (<><AlertIcon /> {error}</>)}
      </div>
    </div>
  );
}
