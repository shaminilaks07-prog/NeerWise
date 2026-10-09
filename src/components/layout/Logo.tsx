export function Logo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="6" fill="#d9ecff" />
      <path d="M16 4.5C16 4.5 7.5 13.2 7.5 19a8.5 8.5 0 0 0 17 0C24.5 13.2 16 4.5 16 4.5Z" fill="#1b6aa8" />
      <path d="M10.5 20.5h11M11.8 24h8.4" stroke="#d9ecff" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
