import React from 'react';

/**
 * Placeholder component for scaffold stubs.
 * Uses inline styles only - no CSS or Elementor props that could interfere with actual styling.
 * This component should be replaced with real section content.
 */

interface PlaceholderProps {
  /** Section name to display */
  name: string;
  /** Whether this is a global/shared section */
  isGlobal?: boolean;
  /** Minimum height in pixels */
  minHeight?: number;
  /** Additional data attributes */
  'data-up-global-section'?: string;
}

const globalStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 200,
  background: '#f0fdf4',
  borderBottom: '2px dashed #86efac',
  position: 'relative',
  width: '100%',
};

const localStyles: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 200,
  background: '#fafafa',
  borderBottom: '2px dashed #d4d4d4',
  position: 'relative',
  width: '100%',
};

const accentGlobalStyles: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 3,
  height: 32,
  background: '#22c55e',
  borderRadius: '0 2px 2px 0',
};

const accentLocalStyles: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: '50%',
  transform: 'translateY(-50%)',
  width: 3,
  height: 32,
  background: '#d4d4d4',
  borderRadius: '0 2px 2px 0',
};

const titleGlobalStyles: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 500,
  color: '#15803d',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const titleLocalStyles: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 500,
  color: '#a1a1aa',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  fontFamily: 'Inter, system-ui, sans-serif',
};

const GlobeIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#22c55e"
    strokeWidth="2"
    style={{ marginRight: 6 }}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="2" y1="12" x2="22" y2="12" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

export function Placeholder({ name, isGlobal = false, minHeight, ...rest }: PlaceholderProps) {
  const wrapperStyles = isGlobal
    ? { ...globalStyles, minHeight: minHeight ?? 200 }
    : { ...localStyles, minHeight: minHeight ?? 200 };

  return (
    <div style={wrapperStyles} {...rest}>
      <div style={isGlobal ? accentGlobalStyles : accentLocalStyles} />
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {isGlobal && <GlobeIcon />}
        <span style={isGlobal ? titleGlobalStyles : titleLocalStyles}>{name}</span>
      </div>
    </div>
  );
}
