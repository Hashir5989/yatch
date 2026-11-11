"use client";

export function InstagramIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <defs>
        <radialGradient id="asmaraty-ig-grad" cx="20%" cy="105%" r="130%">
          <stop offset="0%" stopColor="#FFDC80" />
          <stop offset="10%" stopColor="#FCAF45" />
          <stop offset="35%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#FD1D1D" />
          <stop offset="65%" stopColor="#C13584" />
          <stop offset="85%" stopColor="#833AB4" />
          <stop offset="100%" stopColor="#5851DB" />
        </radialGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="url(#asmaraty-ig-grad)" />
      <rect x="6.2" y="6.2" width="11.6" height="11.6" rx="3.4" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <circle cx="12" cy="12" r="2.9" stroke="#FFFFFF" strokeWidth="1.8" fill="none" />
      <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF" />
    </svg>
  );
}

export function YoutubeIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
        fill="#FF0000"
      />
      <polygon points="9.545,15.568 15.818,12 9.545,8.432" fill="#FFFFFF" />
    </svg>
  );
}

export function TiktokIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5.5" fill="#010101" stroke="rgba(255,255,255,0.18)" strokeWidth="0.6" />
      <g transform="translate(1, 0.5)">
        <path
          d="M16.6 6.9a4.8 4.8 0 0 1-3.6-3.4V2h-2.8v11.8a2.5 2.5 0 1 1-2.5-2.5c.3 0 .6.03.9.1V8.6a5.3 5.3 0 0 0-.9-.08A5.3 5.3 0 1 0 13 13.8V6.5a7.3 7.3 0 0 0 3.6 1.4V6.9z"
          fill="#25F4EE"
        />
        <path
          d="M17.4 7.5a4.8 4.8 0 0 1-3.6-3.4V2.6h-2.8v11.8a2.5 2.5 0 1 1-2.5-2.5c.3 0 .6.03.9.1V9.2a5.3 5.3 0 0 0-.9-.08A5.3 5.3 0 1 0 13 14.4V7.1a7.3 7.3 0 0 0 3.6 1.4V7.5z"
          fill="#FE2C55"
        />
        <path
          d="M17 7.2a4.8 4.8 0 0 1-3.6-3.4V2.3h-2.8v11.8a2.5 2.5 0 1 1-2.5-2.5c.3 0 .6.03.9.1V8.9a5.3 5.3 0 0 0-.9-.08A5.3 5.3 0 1 0 13 14.1V6.8a7.3 7.3 0 0 0 3.6 1.4V7.2z"
          fill="#FFFFFF"
        />
      </g>
    </svg>
  );
}

export function FacebookIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="#1877F2" className={className} {...props}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export function LinkedinIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="#0A66C2" className={className} {...props}>
      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
    </svg>
  );
}

export function XTwitterIcon({ className = "w-4 h-4", ...props }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} {...props}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}
