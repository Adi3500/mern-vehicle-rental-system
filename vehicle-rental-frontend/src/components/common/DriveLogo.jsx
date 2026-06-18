/**
 * DriveLogo — premium SVG brand mark for DRIVE Vehicle Rental.
 * Renders a sleek geometric car icon + wordmark.
 *
 * Props:
 *  size      – icon box size in pixels (default 36)
 *  showText  – whether to show "DRIVE / VEHICLE RENTAL" wordmark (default true)
 *  textColor – override wordmark color (default undefined → uses CSS vars)
 */
export default function DriveLogo({ size = 36, showText = true, style = {} }) {
    return (
        <span
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.7rem',
                textDecoration: 'none',
                flexShrink: 0,
                ...style,
            }}
        >
            {/* Icon mark */}
            <svg
                width={size}
                height={size}
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                style={{ flexShrink: 0 }}
            >
                {/* Background rounded square */}
                <rect
                    width="48"
                    height="48"
                    rx="12"
                    fill="url(#logo-bg)"
                />

                {/* Speed stripe — subtle diagonal accent */}
                <path
                    d="M 8 34 L 40 14"
                    stroke="url(#logo-gold)"
                    strokeWidth="1"
                    strokeLinecap="round"
                    opacity="0.25"
                />

                {/* Car body — sleek sports coupe silhouette */}
                <path
                    d="
                        M 7 31
                        L 10 31
                        C 11 31 11.5 30 12.5 28.5
                        L 18 22
                        C 19.5 20 21.5 19 24 19
                        L 32 19
                        C 34 19 35.5 20 36.5 21.5
                        L 38 24
                        L 40 24.5
                        C 41.5 25 42 26 42 27.5
                        L 42 31
                        L 38.5 31
                        C 38.2 29.2 36.7 27.8 34.9 27.8
                        C 33.0 27.8 31.5 29.2 31.3 31
                        L 17.7 31
                        C 17.5 29.2 16 27.8 14.1 27.8
                        C 12.3 27.8 10.8 29.2 10.5 31
                        L 7 31
                        Z
                    "
                    fill="url(#logo-gold)"
                    opacity="0.92"
                />

                {/* Windshield highlight */}
                <path
                    d="M 22 19.5 L 19 26 L 30 26 L 30 19.5 Z"
                    fill="url(#logo-glass)"
                    opacity="0.55"
                />

                {/* Front wheel */}
                <circle cx="34.9" cy="31.8" r="3.2" fill="#0c1018" />
                <circle cx="34.9" cy="31.8" r="2.1" fill="url(#logo-gold)" />
                <circle cx="34.9" cy="31.8" r="0.85" fill="#0c1018" />

                {/* Rear wheel */}
                <circle cx="14.1" cy="31.8" r="3.2" fill="#0c1018" />
                <circle cx="14.1" cy="31.8" r="2.1" fill="url(#logo-gold)" />
                <circle cx="14.1" cy="31.8" r="0.85" fill="#0c1018" />

                {/* Headlight */}
                <rect x="39.5" y="25.5" width="2.5" height="1.5" rx="0.75" fill="url(#logo-light)" opacity="0.9" />

                {/* Defs */}
                <defs>
                    <linearGradient id="logo-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#161c2a" />
                        <stop offset="100%" stopColor="#0c1018" />
                    </linearGradient>
                    <linearGradient id="logo-gold" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#e2d44a" />
                        <stop offset="50%" stopColor="#c9b832" />
                        <stop offset="100%" stopColor="#a08818" />
                    </linearGradient>
                    <linearGradient id="logo-glass" x1="22" y1="19" x2="30" y2="27" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#bae6fd" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
                    </linearGradient>
                    <linearGradient id="logo-light" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
                        <stop offset="0%" stopColor="#fde68a" />
                        <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                </defs>
            </svg>

            {/* Wordmark */}
            {showText && (
                <div style={{ lineHeight: 1.15, userSelect: 'none' }}>
                    <strong
                        style={{
                            display: 'block',
                            fontFamily: 'var(--font-display)',
                            fontWeight: 'var(--font-weight-black)',
                            fontSize: `${(size / 36) * 1.05}rem`,
                            color: 'var(--text-primary)',
                            letterSpacing: '-0.02em',
                        }}
                    >
                        DRIVE
                    </strong>
                    <span
                        style={{
                            display: 'block',
                            fontSize: `${(size / 36) * 0.58}rem`,
                            color: 'var(--text-muted)',
                            fontFamily: 'var(--font-mono)',
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                        }}
                    >
                        Vehicle Rental
                    </span>
                </div>
            )}
        </span>
    );
}
