const base = (size) => ({
  width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
  strokeWidth: 1.7, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true,
});

export const MailIcon = ({ size = 22 }) => (<svg {...base(size)}><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7.5 8 5.5 8-5.5" /></svg>);
export const LockIcon = ({ size = 22 }) => (<svg {...base(size)}><rect x="4.5" y="10.5" width="15" height="10" rx="2.8" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><path d="M12 14.5v2.2" /></svg>);
export const UserIcon = ({ size = 22 }) => (<svg {...base(size)}><circle cx="12" cy="8" r="4" /><path d="M4.5 20a7.5 7.5 0 0 1 15 0" /></svg>);
export const EyeIcon = ({ size = 20 }) => (<svg {...base(size)}><path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" /><circle cx="12" cy="12" r="3" /></svg>);
export const EyeOffIcon = ({ size = 20 }) => (<svg {...base(size)}><path d="M3 3l18 18" /><path d="M10.6 6.1A10 10 0 0 1 12 6c6.4 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.4 7.6A16.6 16.6 0 0 0 2 12s3.6 6 10 6c1.5 0 2.8-.3 4-.8" /><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" /></svg>);
export const AlertIcon = ({ size = 15 }) => (<svg {...base(size)}><circle cx="12" cy="12" r="9" /><path d="M12 8v5M12 16.5v.01" /></svg>);
export const ArrowIcon = ({ size = 18 }) => (<svg {...base(size)} strokeWidth="2.2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>);
export const CloseIcon = ({ size = 18 }) => (<svg {...base(size)}><path d="m6 6 12 12M18 6 6 18" /></svg>);
export const UploadIcon = ({ size = 24 }) => (<svg {...base(size)}><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5" /><path d="M5 14v5h14v-5" /></svg>);
export const ImageIcon = ({ size = 22 }) => (<svg {...base(size)}><rect x="3" y="4" width="18" height="16" rx="2.5" /><circle cx="8.5" cy="9" r="1.5" /><path d="m4 17 5-5 3.5 3 2.5-2 5 4" /></svg>);
export const LinkIcon = ({ size = 22 }) => (<svg {...base(size)}><path d="M10 13.5 14 9.5" /><path d="M7.5 15.5 5 18a4 4 0 0 1-5.7-5.7l4-4A4 4 0 0 1 9 8" transform="translate(2 0)" /><path d="M16.5 8.5 19 6a4 4 0 0 1 5.7 5.7l-4 4A4 4 0 0 1 15 16" transform="translate(-2 0)" /></svg>);
export const MessageIcon = ({ size = 22 }) => (<svg {...base(size)}><path d="M20 11.5a7.5 7.5 0 0 1-8 7.5 8.8 8.8 0 0 1-4-.9L4 20l1.2-3.4A7.2 7.2 0 0 1 4 12c0-4.1 3.6-7.5 8-7.5s8 3.1 8 7z" /></svg>);
export const PhoneIcon = ({ size = 22 }) => (<svg {...base(size)}><path d="M7 3.5h10a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-13a2 2 0 0 1 2-2z" /><path d="M10 17.5h4" /></svg>);
export const CheckIcon = ({ size = 20 }) => (<svg {...base(size)}><path d="m5 12.5 4.5 4.5L19 7" /></svg>);
export const CopyIcon = ({ size = 18 }) => (<svg {...base(size)}><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" /></svg>);

export const ShieldCheckIcon = ({ size = 22 }) => (<svg {...base(size)} strokeWidth="1.5"><path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.9 7.5-9.5V6L12 3z" /><path d="m8.8 12 2.3 2.3 4-4.3" /></svg>);
export const GlobeIcon = ({ size = 22 }) => (<svg {...base(size)} strokeWidth="1.5"><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z" /></svg>);
export const UsersIcon = ({ size = 22 }) => (<svg {...base(size)} strokeWidth="1.5"><circle cx="9" cy="8" r="3.2" /><path d="M3 19.5c0-3.2 2.7-5.5 6-5.5s6 2.3 6 5.5" /><path d="M16.5 5.2a3 3 0 0 1 0 5.6" /><path d="M18 14.3c1.8.7 3 2.4 3 5.2" /></svg>);
export const LockOutlineIcon = ({ size = 22 }) => (<svg {...base(size)} strokeWidth="1.5"><rect x="4.5" y="10.5" width="15" height="10" rx="2.8" /><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" /><circle cx="12" cy="15.5" r="1.2" /></svg>);

export const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
  </svg>
);
export const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff" aria-hidden="true">
    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
  </svg>
);
