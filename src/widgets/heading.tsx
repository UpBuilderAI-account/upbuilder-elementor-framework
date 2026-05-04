/**
 * Heading Widget Component
 *
 * Fixed version that matches Elementor's PHP output exactly.
 * Key fixes:
 * - Only apply font-weight when explicitly set in typography settings
 * - Ensure exact CSS class matching with Elementor
 */

import React from 'react';

interface HeadingWidgetProps {
  id?: string;
  title?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div';
  size?: 'default' | 'small' | 'medium' | 'large' | 'xl' | 'xxl';
  align?: 'left' | 'center' | 'right' | 'justify';
  color?: string;
  fontSize?: number | string;
  fontWeight?: string | number;
  fontFamily?: string;
  fontStyle?: string;
  textDecoration?: string;
  lineHeight?: number | string;
  letterSpacing?: number | string;
  textTransform?: string;
  link?: {
    url: string;
    is_external?: boolean;
    nofollow?: boolean;
  };
  className?: string;
  settings?: Record<string, any>;
}

export const HeadingWidget: React.FC<HeadingWidgetProps> = (props) => {
  const {
    id = `heading-${Math.random().toString(36).substr(2, 9)}`,
    title,
    tag = 'div',
    size = 'default',
    align,
    color,
    fontSize,
    fontWeight,
    fontFamily,
    fontStyle,
    textDecoration,
    lineHeight,
    letterSpacing,
    textTransform,
    link,
    className,
    settings = {},
  } = props;

  if (!title) return null;

  const Tag = tag as keyof JSX.IntrinsicElements;

  // Build Elementor-compatible classes
  const wrapperClasses = [
    'elementor-element',
    `elementor-element-${id}`,
    'elementor-widget',
    'elementor-widget-heading',
    className,
  ].filter(Boolean).join(' ');

  const headingClasses = [
    'elementor-heading-title',
    `elementor-size-${size}`,
  ].filter(Boolean).join(' ');

  // Build inline styles - only include explicitly set properties
  const headingStyles: React.CSSProperties = {};

  // Only apply typography styles if they're explicitly set
  if (color) headingStyles.color = color;
  if (fontSize) headingStyles.fontSize = typeof fontSize === 'number' ? `${fontSize}px` : fontSize;
  if (fontWeight !== undefined) headingStyles.fontWeight = fontWeight;
  if (fontFamily) headingStyles.fontFamily = fontFamily;
  if (fontStyle) headingStyles.fontStyle = fontStyle;
  if (textDecoration) headingStyles.textDecoration = textDecoration;
  if (lineHeight) headingStyles.lineHeight = typeof lineHeight === 'number' ? lineHeight : lineHeight;
  if (letterSpacing) headingStyles.letterSpacing = typeof letterSpacing === 'number' ? `${letterSpacing}px` : letterSpacing;
  if (textTransform) headingStyles.textTransform = textTransform as any;
  if (align) headingStyles.textAlign = align as any;

  // Handle title content with potential link
  const titleContent = link?.url ? (
    <a
      href={link.url}
      target={link.is_external ? '_blank' : undefined}
      rel={link.nofollow ? 'nofollow' : undefined}
    >
      {title}
    </a>
  ) : title;

  return (
    <div
      className={wrapperClasses}
      data-id={id}
      data-element_type="widget"
      data-widget_type="heading.default"
    >
      <Tag
        className={headingClasses}
        style={Object.keys(headingStyles).length > 0 ? headingStyles : undefined}
      >
        {titleContent}
      </Tag>
    </div>
  );
};

export default HeadingWidget;