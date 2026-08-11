type IconProps = { size?: number; className?: string };

export function FacebookIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M13.5 21v-7.9h2.65l.4-3.08h-3.05V8.06c0-.89.25-1.5 1.52-1.5h1.63V3.8A21.8 21.8 0 0 0 14 3.66c-2.35 0-3.96 1.44-3.96 4.07v2.27H7.38v3.08h2.66V21h3.46z" />
    </svg>
  );
}

export function InstagramIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className={className}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function TwitterIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M18.9 3H21l-6.4 7.3L22.1 21h-6.6l-5.2-6.6L4.4 21H2.3l6.9-7.8L1.9 3h6.8l4.7 6.1L18.9 3zm-1.1 16h1.7L7.2 5H5.4l12.4 14z" />
    </svg>
  );
}

export function PinterestIcon({ size = 15, className }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 0 0-3.64 19.3c-.05-.8-.1-2.02.02-2.9.11-.78.72-3.34.94-4.24 0 0-.4-.7-.4-1.75 0-1.64.95-2.86 2.13-2.86 1 0 1.49.75 1.49 1.65 0 1-.64 2.5-.97 3.9-.28 1.16.58 2.11 1.72 2.11 2.06 0 3.65-2.17 3.65-5.3 0-2.77-1.99-4.71-4.83-4.71-3.29 0-5.22 2.47-5.22 5.02 0 1 .38 2.06.87 2.64.1.11.11.21.08.32l-.32 1.3c-.05.21-.17.26-.39.16-1.46-.68-2.37-2.81-2.37-4.52 0-3.68 2.68-7.06 7.72-7.06 4.05 0 7.2 2.89 7.2 6.75 0 4.03-2.54 7.27-6.07 7.27-1.19 0-2.3-.62-2.68-1.35l-.73 2.78c-.26 1.01-.98 2.28-1.46 3.05A10 10 0 1 0 12 2z" />
    </svg>
  );
}
