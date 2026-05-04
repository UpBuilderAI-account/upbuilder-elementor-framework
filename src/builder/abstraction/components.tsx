/**
 * React components for the Elementor JSX Abstraction Layer
 */

import React, { useMemo, useCallback, useState, type ReactNode } from 'react';
import type { ElementorElement, ElementorDocument } from '../../types';
import { generateElementId } from '../../lib/id-generator';
import { useIsPreviewMode } from '../../lib/render-mode';
import { CSSProvider, StyleTag } from '../../lib/css-context';

import { DocumentContext, ElementContext, useDocument, useElementContext } from './context';
import { mapGridProps, mapFlexboxProps, mapWidgetProps } from './mappers';
import { getDomAttributes, normalizeLink } from './utils';
import {
  asPreviewSettings,
  getContainerPreviewCSS,
  getHeadingCSS,
  getTextEditorCSS,
  getButtonCSS,
  getIconCSS,
  getIconBoxCSS,
  getIconListCSS,
  getImageBoxCSS,
  getAccordionCSS,
  getToggleCSS,
  getTabsCSS,
  getImageGalleryCSS,
  getCounterCSS,
  getProgressCSS,
  progressPercent,
  getImageCarouselCSS,
  getNavMenuCSS,
  getElementorFormCSS,
  getSlidesCSS,
  getImageCSS,
  layoutPositionClass,
  widgetDataSettings,
} from './css';
import type {
  PageProps,
  GridProps,
  FlexboxProps,
  SectionProps,
  HeadingProps,
  TextEditorProps,
  ButtonProps,
  IconProps,
  IconBoxProps,
  IconListProps,
  ImageBoxProps,
  AccordionProps,
  ToggleProps,
  TabsProps,
  ImageGalleryProps,
  CounterProps,
  ProgressProps,
  ImageCarouselProps,
  NavMenuProps,
  NavMenuItem,
  ElementorFormProps,
  SlidesProps,
  ImageProps,
} from './types';

// =============================================================================
// TYPES
// =============================================================================

type AbstractionKind = 'page' | 'container' | 'widget'

export type AbstractionComponentMeta = {
  kind: AbstractionKind
  name: string
  widgetKey?: string
  containerType?: 'grid' | 'flex'
}

type InternalFlexboxProps = FlexboxProps & {
  __upComponentName?: string
}

type PreviewSettings = Record<string, any>

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function renderShapeDivider(settings: PreviewSettings, position: 'top' | 'bottom'): ReactNode {
  if (!settings[`shape_divider_${position}`]) return null
  return (
    <div className={`elementor-shape elementor-shape-${position}`} data-negative="false">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100" preserveAspectRatio="none">
        <path d="M0,0 L1000,0 L1000,100 L0,100 Z" />
      </svg>
    </div>
  )
}

function renderPreviewIcon(icon: PreviewSettings['selected_icon']): ReactNode {
  if (!icon?.value) return null
  if (icon.library === 'svg' && typeof icon.value === 'string' && icon.value.trim().startsWith('<svg')) {
    return <span dangerouslySetInnerHTML={{ __html: icon.value }} />
  }
  return <i className={icon.value} aria-hidden="true" />
}

function isElementorNativePreviewRuntime(): boolean {
  return typeof window !== 'undefined' && (window as any).__UP_USE_ELEMENTOR_NATIVE_JS === true
}

function normalizeDefaultActiveIndex(value: unknown, length: number): number | null {
  if (value === null) return null
  const index = value === undefined ? 0 : Number(value)
  if (!Number.isFinite(index) || index < 0 || index >= length) return length > 0 ? 0 : null
  return Math.floor(index)
}

function resolvePreviewImageUrl(url: string): string {
  if (url.startsWith('asset://') && typeof window !== 'undefined') {
    const baseUrl = (window as any).__UP_IMAGES_BASE_URL
    if (baseUrl) return url.replace('asset://', baseUrl + '/')
  }
  return url
}

function carouselCaptionForImage(image: Record<string, any>, captionType: string): string {
  if (captionType === 'title') return String(image.title || '')
  if (captionType === 'description') return String(image.description || '')
  if (captionType === 'caption') return String(image.caption || '')
  return ''
}

// =============================================================================
// PAGE COMPONENT
// =============================================================================

export const Page: React.FC<PageProps> & { __elementorAbstraction?: AbstractionComponentMeta } = ({ children }) => {
  return <>{children}</>
}
Page.__elementorAbstraction = { kind: 'page', name: 'Page' }

// =============================================================================
// CONTAINER COMPONENTS
// =============================================================================

export const Grid: React.FC<GridProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])
  const parent = useElementContext()

  if (isPreview) {
    const settings = asPreviewSettings(mapGridProps(props as Record<string, unknown>))
    const css = getContainerPreviewCSS(id, settings, 'grid')
    const isNested = parent !== null
    const isBoxed = settings.content_width === 'boxed'
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'e-con',
      isNested ? 'e-child' : 'e-parent',
      'e-grid',
      isBoxed ? 'e-con-boxed' : 'e-con-full',
      settings.css_classes,
      props.className,
    ].filter(Boolean).join(' ')
    const TagName = (settings.html_tag || 'div') as keyof JSX.IntrinsicElements
    const linkProps = settings.html_tag === 'a' && settings.link?.url ? {
      href: settings.link.url,
      target: settings.link.is_external ? '_blank' : undefined,
      rel: settings.link.nofollow ? 'nofollow' : undefined,
    } : {}
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <ElementContext.Provider value={{ parentId: id }}>
        <StyleTag elementId={id} css={css} />
        <TagName
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="container"
          data-e-type="container"
          data-up-component="Grid"
          {...linkProps}
        >
          {renderShapeDivider(settings, 'top')}
          {isBoxed ? <div className="e-con-inner">{props.children}</div> : props.children}
          {renderShapeDivider(settings, 'bottom')}
        </TagName>
      </ElementContext.Provider>
    )
  }

  const doc = useDocument()
  const settings = mapGridProps(props as Record<string, unknown>)

  const element: ElementorElement = {
    id,
    elType: 'container',
    settings: { ...settings, container_type: 'grid' },
    elements: [],
    isInner: !!parent,
  }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return (
    <ElementContext.Provider value={{ parentId: id }}>
      {props.children}
    </ElementContext.Provider>
  )
}
;(Grid as any).__elementorAbstraction = { kind: 'container', name: 'Grid', widgetKey: 'container', containerType: 'grid' }

export const Flexbox: React.FC<FlexboxProps> = (rawProps) => {
  const { __upComponentName, ...props } = rawProps as InternalFlexboxProps
  const componentName = __upComponentName || 'Flexbox'
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])
  const parent = useElementContext()

  if (isPreview) {
    const settings = asPreviewSettings(mapFlexboxProps(props as Record<string, unknown>))
    const css = getContainerPreviewCSS(id, settings, 'flex')
    const isNested = parent !== null
    const isBoxed = settings.content_width === 'boxed'
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'e-con',
      isNested ? 'e-child' : 'e-parent',
      'e-flex',
      isBoxed ? 'e-con-boxed' : 'e-con-full',
      settings.css_classes,
      props.className,
    ].filter(Boolean).join(' ')
    const TagName = (settings.html_tag || 'div') as keyof JSX.IntrinsicElements
    const linkProps = settings.html_tag === 'a' && settings.link?.url ? {
      href: settings.link.url,
      target: settings.link.is_external ? '_blank' : undefined,
      rel: settings.link.nofollow ? 'nofollow' : undefined,
    } : {}
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <ElementContext.Provider value={{ parentId: id }}>
        <StyleTag elementId={id} css={css} />
        <TagName
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="container"
          data-e-type="container"
          data-up-component={componentName}
          {...linkProps}
        >
          {renderShapeDivider(settings, 'top')}
          {isBoxed ? <div className="e-con-inner">{props.children}</div> : props.children}
          {renderShapeDivider(settings, 'bottom')}
        </TagName>
      </ElementContext.Provider>
    )
  }

  const doc = useDocument()
  const settings = mapFlexboxProps(props as Record<string, unknown>)

  const element: ElementorElement = {
    id,
    elType: 'container',
    settings,
    elements: [],
    isInner: !!parent,
  }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return (
    <ElementContext.Provider value={{ parentId: id }}>
      {props.children}
    </ElementContext.Provider>
  )
}
;(Flexbox as any).__elementorAbstraction = { kind: 'container', name: 'Flexbox', widgetKey: 'container', containerType: 'flex' }

export const Section: React.FC<SectionProps> = ({ name, ...props }) => (
  React.createElement(Flexbox as React.FC<InternalFlexboxProps>, {
    ...(props as FlexboxProps),
    __upComponentName: name || 'Section',
  })
)
;(Section as any).__elementorAbstraction = { kind: 'container', name: 'Section', widgetKey: 'container', containerType: 'flex' }

// =============================================================================
// WIDGET COMPONENTS
// =============================================================================

export const Heading: React.FC<HeadingProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('heading', props as Record<string, unknown>))
    const Tag = (settings.header_size || 'div') as keyof JSX.IntrinsicElements
    const css = getHeadingCSS(id, settings)

    if (!settings.title) return null

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-heading',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')

    const headingClasses = [
      'elementor-heading-title',
      `elementor-size-${settings.size || 'default'}`,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    const title = String(settings.title || '')
    const titleHasInlineHtml = /<\/?(span|strong|em|b|i|u|br)\b/i.test(title)
    const content = settings.link?.url && titleHasInlineHtml ? (
      <a
        href={settings.link.url}
        target={settings.link.is_external ? '_blank' : undefined}
        rel={settings.link.nofollow ? 'nofollow' : undefined}
        dangerouslySetInnerHTML={{ __html: title }}
      />
    ) : settings.link?.url ? (
      <a
        href={settings.link.url}
        target={settings.link.is_external ? '_blank' : undefined}
        rel={settings.link.nofollow ? 'nofollow' : undefined}
      >
        {title}
      </a>
    ) : titleHasInlineHtml ? (
      <span dangerouslySetInnerHTML={{ __html: title }} />
    ) : title

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Heading"
          data-widget_type="heading.default"
        >
          <Tag className={headingClasses}>{content}</Tag>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('heading', props as Record<string, unknown>)

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'heading', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Heading as any).__elementorAbstraction = { kind: 'widget', name: 'Heading', widgetKey: 'heading' }

export const TextEditor: React.FC<TextEditorProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('text-editor', props as Record<string, unknown>))
    const css = getTextEditorCSS(id, settings)

    if (!settings.editor) return null

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-text-editor',
      settings.drop_cap === 'yes' ? 'elementor-drop-cap-yes' : settings.drop_cap === 'no' ? 'elementor-drop-cap-no' : '',
      settings.drop_cap === 'yes' && settings.drop_cap_view ? `elementor-drop-cap-view-${settings.drop_cap_view}` : '',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const dataSettings = settings.drop_cap === 'yes' || settings.drop_cap === 'no'
      ? JSON.stringify({ drop_cap: settings.drop_cap })
      : undefined
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="TextEditor"
          data-widget_type="text-editor.default"
          {...(dataSettings && { 'data-settings': dataSettings })}
          dangerouslySetInnerHTML={{ __html: settings.editor }}
        />
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('text-editor', props as Record<string, unknown>)

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'text-editor', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(TextEditor as any).__elementorAbstraction = { kind: 'widget', name: 'TextEditor', widgetKey: 'text-editor' }

export const Button: React.FC<ButtonProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('button', props as Record<string, unknown>))
    const css = getButtonCSS(id, settings)

    if (!settings.text && !settings.selected_icon?.value) return null

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      settings.button_type ? `elementor-button-${settings.button_type}` : '',
      settings.align ? `elementor-align-${settings.align}` : '',
      settings.align_tablet ? `elementor-tablet-align-${settings.align_tablet}` : '',
      settings.align_mobile ? `elementor-mobile-align-${settings.align_mobile}` : '',
      'elementor-widget',
      'elementor-widget-button',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')

    const buttonClasses = [
      'elementor-button',
      'elementor-button-link',
      settings.size ? `elementor-size-${settings.size}` : '',
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    const renderIcon = () => {
      if (!settings.selected_icon?.value) return null
      return (
        <span className="elementor-button-icon">
          {renderPreviewIcon(settings.selected_icon)}
        </span>
      )
    }

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Button"
          data-widget_type="button.default"
        >
          <a
            className={buttonClasses}
            href={settings.link?.url || '#'}
            id={settings.button_css_id}
            target={settings.link?.is_external ? '_blank' : undefined}
            rel={settings.link?.nofollow ? 'nofollow' : undefined}
          >
            <span className="elementor-button-content-wrapper">
              {renderIcon()}
              {settings.text && <span className="elementor-button-text">{settings.text}</span>}
            </span>
          </a>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('button', props as Record<string, unknown>)

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'button', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Button as any).__elementorAbstraction = { kind: 'widget', name: 'Button', widgetKey: 'button' }

export const Icon: React.FC<IconProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('icon', props as Record<string, unknown>))
    const css = getIconCSS(id, settings)

    if (!settings.selected_icon?.value) return null

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      settings.view ? `elementor-view-${settings.view}` : '',
      settings.view && settings.view !== 'default' && settings.shape ? `elementor-shape-${settings.shape}` : '',
      'elementor-widget',
      'elementor-widget-icon',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')

    const iconClasses = [
      'elementor-icon',
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    const IconElement = settings.link?.url ? 'a' : 'div'
    const iconProps = {
      className: iconClasses,
      ...(settings.link?.url && {
        href: settings.link.url,
        target: settings.link.is_external ? '_blank' : undefined,
        rel: settings.link.nofollow ? 'nofollow' : settings.link.is_external ? 'noopener noreferrer' : undefined,
      }),
    }

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Icon"
          data-widget_type="icon.default"
        >
          <div className="elementor-icon-wrapper">
            <IconElement {...iconProps}>
              {renderPreviewIcon(settings.selected_icon)}
            </IconElement>
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('icon', props as Record<string, unknown>)

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'icon', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Icon as any).__elementorAbstraction = { kind: 'widget', name: 'Icon', widgetKey: 'icon' }

export const IconBox: React.FC<IconBoxProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('icon-box', props as Record<string, unknown>))
    const css = getIconBoxCSS(id, settings)
    const title = String(settings.title_text || '')
    const description = String(settings.description_text || '')
    const titleTag = settings.title_size || 'h3'
    const link = settings.link?.url ? settings.link : undefined

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      settings.view ? `elementor-view-${settings.view}` : '',
      settings.view && settings.view !== 'default' && settings.shape ? `elementor-shape-${settings.shape}` : '',
      settings.position ? `elementor-position-${settings.position}` : '',
      settings.position_tablet ? `elementor-tablet-position-${settings.position_tablet}` : '',
      settings.position_mobile ? `elementor-mobile-position-${settings.position_mobile}` : '',
      'elementor-widget',
      'elementor-widget-icon-box',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const iconClasses = [
      'elementor-icon',
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)
    const iconContent = renderPreviewIcon(settings.selected_icon)

    const iconNode = link ? (
      <a
        className={iconClasses}
        href={link.url}
        target={link.is_external ? '_blank' : undefined}
        rel={link.nofollow ? 'nofollow' : link.is_external ? 'noopener noreferrer' : undefined}
        tabIndex={-1}
        aria-label={title || undefined}
      >
        {iconContent}
      </a>
    ) : (
      <span className={iconClasses}>{iconContent}</span>
    )
    const titleInner = link ? (
      <a
        href={link.url}
        target={link.is_external ? '_blank' : undefined}
        rel={link.nofollow ? 'nofollow' : link.is_external ? 'noopener noreferrer' : undefined}
      >
        {title}
      </a>
    ) : <span>{title}</span>

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="IconBox"
          data-widget_type="icon-box.default"
        >
          <div className="elementor-icon-box-wrapper">
            {settings.selected_icon?.value ? (
              <div className="elementor-icon-box-icon">{iconNode}</div>
            ) : null}
            <div className="elementor-icon-box-content">
              {title ? React.createElement(titleTag, { className: 'elementor-icon-box-title' }, titleInner) : null}
              {description ? <p className="elementor-icon-box-description">{description}</p> : null}
            </div>
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('icon-box', props as Record<string, unknown>)

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'icon-box', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(IconBox as any).__elementorAbstraction = { kind: 'widget', name: 'IconBox', widgetKey: 'icon-box' }

export const IconList: React.FC<IconListProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('icon-list', props as Record<string, unknown>))
    const css = getIconListCSS(id, settings)
    const items = Array.isArray(settings.icon_list) ? settings.icon_list : []

    if (items.length === 0) return null

    const view = settings.view || 'traditional'
    const linkClick = settings.link_click || 'full_width'
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      `elementor-icon-list--layout-${view}`,
      `elementor-list-item-link-${linkClick}`,
      settings.icon_align ? `elementor-align-${settings.icon_align}` : '',
      settings.icon_align_tablet ? `elementor-tablet-align-${settings.icon_align_tablet}` : '',
      settings.icon_align_mobile ? `elementor-mobile-align-${settings.icon_align_mobile}` : '',
      'elementor-widget',
      'elementor-widget-icon-list',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const ulClasses = [
      'elementor-icon-list-items',
      view === 'inline' ? 'elementor-inline-items' : '',
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="IconList"
          data-widget_type="icon-list.default"
        >
          <ul className={ulClasses}>
            {items.map((rawItem: Record<string, any>, index: number) => {
              const item = rawItem || {}
              const itemClasses = [
                'elementor-icon-list-item',
                view === 'inline' ? 'elementor-inline-item' : '',
              ].filter(Boolean).join(' ')
              const content = (
                <>
                  {item.selected_icon?.value ? (
                    <span className="elementor-icon-list-icon">
                      {renderPreviewIcon(item.selected_icon)}
                    </span>
                  ) : null}
                  <span className="elementor-icon-list-text">{String(item.text || '')}</span>
                </>
              )

              return (
                <li key={item._id || `item_${index}`} className={itemClasses}>
                  {item.link?.url ? (
                    <a
                      href={item.link.url}
                      target={item.link.is_external ? '_blank' : undefined}
                      rel={item.link.nofollow ? 'nofollow' : item.link.is_external ? 'noopener noreferrer' : undefined}
                    >
                      {content}
                    </a>
                  ) : content}
                </li>
              )
            })}
          </ul>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('icon-list', props as Record<string, unknown>)

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'icon-list', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(IconList as any).__elementorAbstraction = { kind: 'widget', name: 'IconList', widgetKey: 'icon-list' }

export const ImageBox: React.FC<ImageBoxProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('image-box', props as Record<string, unknown>))
    const css = getImageBoxCSS(id, settings)
    const image = settings.image || {}
    let src = image.url || ''
    const alt = image.alt || props.alt || ''
    const title = String(settings.title_text || '')
    const description = String(settings.description_text || '')
    const titleTag = settings.title_size || 'h3'
    const link = settings.link?.url ? settings.link : undefined

    if (!src) return null

    if (src && src.startsWith('asset://') && typeof window !== 'undefined') {
      const baseUrl = (window as any).__UP_IMAGES_BASE_URL
      if (baseUrl) src = src.replace('asset://', baseUrl + '/')
    }

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      settings.position ? `elementor-position-${settings.position}` : '',
      settings.position_tablet ? `elementor-tablet-position-${settings.position_tablet}` : '',
      settings.position_mobile ? `elementor-mobile-position-${settings.position_mobile}` : '',
      settings.content_vertical_alignment ? `elementor-vertical-align-${settings.content_vertical_alignment}` : '',
      'elementor-widget',
      'elementor-widget-image-box',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const imageClasses = [
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    const imageNode = (
      <img src={src} className={imageClasses || undefined} title={image.title || ''} alt={alt} loading="lazy" />
    )
    const linkedImage = link ? (
      <a
        href={link.url}
        target={link.is_external ? '_blank' : undefined}
        rel={link.nofollow ? 'nofollow' : link.is_external ? 'noopener noreferrer' : undefined}
        tabIndex={-1}
      >
        {imageNode}
      </a>
    ) : imageNode
    const titleInner = link ? (
      <a
        href={link.url}
        target={link.is_external ? '_blank' : undefined}
        rel={link.nofollow ? 'nofollow' : link.is_external ? 'noopener noreferrer' : undefined}
      >
        {title}
      </a>
    ) : title

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="ImageBox"
          data-widget_type="image-box.default"
        >
          <div className="elementor-image-box-wrapper">
            <figure className="elementor-image-box-img">{linkedImage}</figure>
            <div className="elementor-image-box-content">
              {title ? React.createElement(titleTag, { className: 'elementor-image-box-title' }, titleInner) : null}
              {description ? <p className="elementor-image-box-description">{description}</p> : null}
            </div>
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('image-box', props as Record<string, unknown>)

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'image-box', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(ImageBox as any).__elementorAbstraction = { kind: 'widget', name: 'ImageBox', widgetKey: 'image-box' }

export const Accordion: React.FC<AccordionProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime()
    const settings = asPreviewSettings(mapWidgetProps('accordion', props as Record<string, unknown>))
    const css = getAccordionCSS(id, settings)
    const items = Array.isArray(settings.tabs) ? settings.tabs : []
    const defaultActiveIndex = normalizeDefaultActiveIndex(props.defaultActiveIndex, items.length)
    const [activeIndex, setActiveIndex] = useState<number | null>(defaultActiveIndex)

    if (items.length === 0) return null

    const titleTag = settings.title_html_tag || 'div'
    const iconAlign = settings.icon_align || 'right'
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-accordion',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Accordion"
          data-widget_type="accordion.default"
        >
          <div className="elementor-accordion">
            {items.map((rawItem: Record<string, any>, index: number) => {
              const item = rawItem || {}
              const active = useNativeRuntime ? index === defaultActiveIndex : index === activeIndex
              const tabId = `${id}${index + 1}`
              const toggleItem = () => setActiveIndex((current) => current === index ? null : index)
              const handleKeyDown = (event: React.KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  toggleItem()
                }
              }
              const titleContent = (
                <>
                  <span className={`elementor-accordion-icon elementor-accordion-icon-${iconAlign}`} aria-hidden="true">
                    <span className="elementor-accordion-icon-closed">{renderPreviewIcon(settings.selected_icon)}</span>
                    <span className="elementor-accordion-icon-opened">{renderPreviewIcon(settings.selected_active_icon)}</span>
                  </span>
                  <a className="elementor-accordion-title" tabIndex={0}>
                    {String(item.tab_title || '')}
                  </a>
                </>
              )

              return (
                <div className="elementor-accordion-item" key={item._id || `accordion_${index}`}>
                  {React.createElement(
                    titleTag,
                    {
                      id: `elementor-tab-title-${tabId}`,
                      className: `elementor-tab-title ${active ? 'elementor-active' : ''} elementor-tab-title-${iconAlign}`,
                      role: 'button',
                      'aria-controls': `elementor-tab-content-${tabId}`,
                      'aria-expanded': active,
                      tabIndex: 0,
                      'data-tab': index + 1,
                      onClick: useNativeRuntime ? undefined : toggleItem,
                      onKeyDown: useNativeRuntime ? undefined : handleKeyDown,
                    },
                    titleContent
                  )}
                  <div
                    id={`elementor-tab-content-${tabId}`}
                    className={`elementor-tab-content elementor-clearfix ${active ? 'elementor-active' : ''}`}
                    data-tab={index + 1}
                    role="region"
                    aria-labelledby={`elementor-tab-title-${tabId}`}
                    hidden={!active}
                    style={{ display: active ? 'block' : 'none' }}
                    dangerouslySetInnerHTML={{ __html: String(item.tab_content || '') }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('accordion', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'accordion', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Accordion as any).__elementorAbstraction = { kind: 'widget', name: 'Accordion', widgetKey: 'accordion' }

export const Toggle: React.FC<ToggleProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime()
    const settings = asPreviewSettings(mapWidgetProps('toggle', props as Record<string, unknown>))
    const css = getToggleCSS(id, settings)
    const items = Array.isArray(settings.tabs) ? settings.tabs : []
    const defaultActiveIndex = normalizeDefaultActiveIndex(props.defaultActiveIndex, items.length)
    const [openItems, setOpenItems] = useState<Set<number>>(() => defaultActiveIndex === null ? new Set() : new Set([defaultActiveIndex]))

    if (items.length === 0) return null

    const titleTag = settings.title_html_tag || 'div'
    const iconAlign = settings.icon_align || 'right'
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-toggle',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Toggle"
          data-widget_type="toggle.default"
        >
          <div className="elementor-toggle">
            {items.map((rawItem: Record<string, any>, index: number) => {
              const item = rawItem || {}
              const active = useNativeRuntime ? index === defaultActiveIndex : openItems.has(index)
              const tabId = `${id}${index + 1}`
              const toggleItem = () => setOpenItems((current) => {
                const next = new Set(current)
                if (next.has(index)) next.delete(index)
                else next.add(index)
                return next
              })
              const handleKeyDown = (event: React.KeyboardEvent) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault()
                  toggleItem()
                }
              }
              const titleContent = (
                <>
                  <span className={`elementor-toggle-icon elementor-toggle-icon-${iconAlign}`} aria-hidden="true">
                    <span className="elementor-toggle-icon-closed">{renderPreviewIcon(settings.selected_icon)}</span>
                    <span className="elementor-toggle-icon-opened">{renderPreviewIcon(settings.selected_active_icon)}</span>
                  </span>
                  <a className="elementor-toggle-title" tabIndex={0}>
                    {String(item.tab_title || '')}
                  </a>
                </>
              )

              return (
                <div className="elementor-toggle-item" key={item._id || `toggle_${index}`}>
                  {React.createElement(
                    titleTag,
                    {
                      id: `elementor-tab-title-${tabId}`,
                      className: `elementor-tab-title ${active ? 'elementor-active' : ''} elementor-tab-title-${iconAlign}`,
                      role: 'button',
                      'aria-controls': `elementor-tab-content-${tabId}`,
                      'aria-expanded': active,
                      tabIndex: 0,
                      'data-tab': index + 1,
                      onClick: useNativeRuntime ? undefined : toggleItem,
                      onKeyDown: useNativeRuntime ? undefined : handleKeyDown,
                    },
                    titleContent
                  )}
                  <div
                    id={`elementor-tab-content-${tabId}`}
                    className={`elementor-tab-content elementor-clearfix ${active ? 'elementor-active' : ''}`}
                    data-tab={index + 1}
                    role="region"
                    aria-labelledby={`elementor-tab-title-${tabId}`}
                    hidden={!active}
                    style={{ display: active ? 'block' : 'none' }}
                    dangerouslySetInnerHTML={{ __html: String(item.tab_content || '') }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('toggle', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'toggle', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Toggle as any).__elementorAbstraction = { kind: 'widget', name: 'Toggle', widgetKey: 'toggle' }

export const Tabs: React.FC<TabsProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime()
    const settings = asPreviewSettings(mapWidgetProps('tabs', props as Record<string, unknown>))
    const css = getTabsCSS(id, settings)
    const items = Array.isArray(settings.tabs) ? settings.tabs : []
    const defaultActiveIndex = normalizeDefaultActiveIndex(props.defaultActiveIndex, items.length)
    const [activeIndex, setActiveIndex] = useState(defaultActiveIndex ?? 0)

    if (items.length === 0) return null

    const type = settings.type || 'horizontal'
    const align = type === 'vertical' ? settings.tabs_align_vertical : settings.tabs_align_horizontal
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-tabs',
      `elementor-tabs-view-${type}`,
      align ? `elementor-tabs-alignment-${align}` : '',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Tabs"
          data-widget_type="tabs.default"
        >
          <div className={`elementor-tabs elementor-tabs-view-${type}`}>
            <div className="elementor-tabs-wrapper" role="tablist">
              {items.map((rawItem: Record<string, any>, index: number) => {
                const item = rawItem || {}
                const active = useNativeRuntime ? index === defaultActiveIndex : index === activeIndex
                const tabId = `${id}${index + 1}`
                const activateTab = () => setActiveIndex(index)
                const handleKeyDown = (event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    activateTab()
                  }
                }
                return (
                  <div
                    key={item._id || `tab_title_${index}`}
                    id={`elementor-tab-title-${tabId}`}
                    className={`elementor-tab-title elementor-tab-desktop-title ${active ? 'elementor-active' : ''}`}
                    aria-selected={active}
                    data-tab={index + 1}
                    role="tab"
                    tabIndex={active ? 0 : -1}
                    aria-controls={`elementor-tab-content-${tabId}`}
                    onClick={useNativeRuntime ? undefined : activateTab}
                    onKeyDown={useNativeRuntime ? undefined : handleKeyDown}
                  >
                    {String(item.tab_title || '')}
                  </div>
                )
              })}
            </div>
            <div className="elementor-tabs-content-wrapper" role="tablist" aria-orientation={type}>
              {items.map((rawItem: Record<string, any>, index: number) => {
                const item = rawItem || {}
                const active = useNativeRuntime ? index === defaultActiveIndex : index === activeIndex
                const tabId = `${id}${index + 1}`
                const activateTab = () => setActiveIndex(index)
                const handleKeyDown = (event: React.KeyboardEvent) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault()
                    activateTab()
                  }
                }
                return (
                  <React.Fragment key={item._id || `tab_content_${index}`}>
                    <div
                      className={`elementor-tab-title elementor-tab-mobile-title ${active ? 'elementor-active' : ''}`}
                      aria-selected={active}
                      data-tab={index + 1}
                      role="tab"
                      tabIndex={active ? 0 : -1}
                      aria-controls={`elementor-tab-content-${tabId}`}
                      onClick={useNativeRuntime ? undefined : activateTab}
                      onKeyDown={useNativeRuntime ? undefined : handleKeyDown}
                    >
                      {String(item.tab_title || '')}
                    </div>
                    <div
                      id={`elementor-tab-content-${tabId}`}
                      className={`elementor-tab-content elementor-clearfix ${active ? 'elementor-active' : ''}`}
                      data-tab={index + 1}
                      role="tabpanel"
                      aria-labelledby={`elementor-tab-title-${tabId}`}
                      hidden={!active}
                      style={{ display: active ? 'block' : 'none' }}
                      dangerouslySetInnerHTML={{ __html: String(item.tab_content || '') }}
                    />
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('tabs', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'tabs', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Tabs as any).__elementorAbstraction = { kind: 'widget', name: 'Tabs', widgetKey: 'tabs' }

export const ImageGallery: React.FC<ImageGalleryProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('image-gallery', props as Record<string, unknown>))
    const css = getImageGalleryCSS(id, settings)
    const images = Array.isArray(settings.wp_gallery) ? settings.wp_gallery : []

    if (images.length === 0) return null

    const columns = settings.gallery_columns || 4
    const size = settings.thumbnail_size || 'thumbnail'
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-image-gallery',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="ImageGallery"
          data-widget_type="image-gallery.default"
        >
          <div className="elementor-image-gallery">
            <div className={`gallery galleryid-${id} gallery-columns-${columns} gallery-size-${size}`}>
              {images.map((rawImage: Record<string, any>, index: number) => {
                const image = rawImage || {}
                const src = resolvePreviewImageUrl(String(image.url || ''))
                if (!src) return null
                const caption = String(image.caption || image.alt || '')
                const img = <img src={src} alt={String(image.alt || '')} loading="lazy" />
                const content = settings.gallery_link === 'none' ? img : (
                  <a
                    href={settings.gallery_link === 'attachment' ? '#' : src}
                    data-elementor-open-lightbox={settings.gallery_link === 'file' ? settings.open_lightbox || 'default' : undefined}
                    data-elementor-lightbox-slideshow={settings.gallery_link === 'file' ? id : undefined}
                  >
                    {img}
                  </a>
                )

                return (
                  <figure className="gallery-item" key={image.id || `gallery_${index}`}>
                    <div className="gallery-icon">{content}</div>
                    {settings.gallery_display_caption !== 'none' && caption ? (
                      <figcaption className="gallery-caption">{caption}</figcaption>
                    ) : null}
                  </figure>
                )
              })}
            </div>
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('image-gallery', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'image-gallery', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(ImageGallery as any).__elementorAbstraction = { kind: 'widget', name: 'ImageGallery', widgetKey: 'image-gallery' }

export const Counter: React.FC<CounterProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime()
    const settings = asPreviewSettings(mapWidgetProps('counter', props as Record<string, unknown>))
    const css = getCounterCSS(id, settings)
    const fromValue = Number(settings.starting_number ?? 0)
    const toValue = Number(settings.ending_number ?? 100)
    const delimiter = settings.thousand_separator === 'yes' ? String(settings.thousand_separator_char || ',') : ''
    const displayValue = useNativeRuntime ? fromValue : toValue
    const TitleTag = (settings.title_tag || 'div') as keyof JSX.IntrinsicElements
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-counter',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Counter"
          data-widget_type="counter.default"
        >
          <div className="elementor-counter">
            {settings.title ? <TitleTag className="elementor-counter-title">{String(settings.title)}</TitleTag> : null}
            <div className="elementor-counter-number-wrapper">
              <span className="elementor-counter-number-prefix">{String(settings.prefix || '')}</span>
              <span
                className="elementor-counter-number"
                data-duration={settings.duration ?? 2000}
                data-to-value={toValue}
                data-from-value={fromValue}
                data-delimiter={delimiter || undefined}
              >
                {displayValue}
              </span>
              <span className="elementor-counter-number-suffix">{String(settings.suffix || '')}</span>
            </div>
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('counter', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'counter', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Counter as any).__elementorAbstraction = { kind: 'widget', name: 'Counter', widgetKey: 'counter' }

export const Progress: React.FC<ProgressProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const useNativeRuntime = isElementorNativePreviewRuntime()
    const settings = asPreviewSettings(mapWidgetProps('progress', props as Record<string, unknown>))
    const css = getProgressCSS(id, settings)
    const percent = progressPercent(settings)
    const title = String(settings.title || '')
    const innerText = String(settings.inner_text || '')
    const showTitle = settings.title_display !== '' && title
    const showPercentage = settings.display_percentage === 'show'
    const TitleTag = (settings.title_tag || 'span') as keyof JSX.IntrinsicElements
    const progressClass = settings.progress_type ? `progress-${settings.progress_type}` : ''
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-progress',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Progress"
          data-widget_type="progress.default"
        >
          <div className="elementor-progress">
            {showTitle ? <TitleTag className="elementor-title" id={`elementor-progress-bar-${id}`}>{title}</TitleTag> : null}
            <div
              className={`elementor-progress-wrapper ${progressClass}`.trim()}
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              aria-labelledby={showTitle ? `elementor-progress-bar-${id}` : undefined}
              aria-label={!showTitle ? title || innerText || `${percent}%` : undefined}
            >
              <div
                className="elementor-progress-bar"
                data-max={percent}
                style={{ width: useNativeRuntime ? undefined : `${percent}%` }}
              >
                {innerText ? <span className="elementor-progress-text">{innerText}</span> : null}
                {showPercentage ? <span className="elementor-progress-percentage">{percent}%</span> : null}
              </div>
            </div>
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('progress', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'progress', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Progress as any).__elementorAbstraction = { kind: 'widget', name: 'Progress', widgetKey: 'progress' }
export const ProgressBar = Progress
;(ProgressBar as any).__elementorAbstraction = { kind: 'widget', name: 'ProgressBar', widgetKey: 'progress' }

export const ImageCarousel: React.FC<ImageCarouselProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('image-carousel', props as Record<string, unknown>))
    const css = getImageCarouselCSS(id, settings)
    const images = Array.isArray(settings.carousel) ? settings.carousel : []

    if (images.length === 0) return null

    const navigation = settings.navigation || 'both'
    const showArrows = images.length > 1 && (navigation === 'both' || navigation === 'arrows')
    const showDots = images.length > 1 && (navigation === 'both' || navigation === 'dots')
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-image-carousel',
      showArrows && settings.arrows_position ? `elementor-arrows-position-${settings.arrows_position}` : '',
      showDots && settings.dots_position ? `elementor-pagination-position-${settings.dots_position}` : '',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const dataSettings = widgetDataSettings(settings, [
      'slides_to_show', 'slides_to_show_tablet', 'slides_to_show_mobile',
      'slides_to_scroll', 'slides_to_scroll_tablet', 'slides_to_scroll_mobile',
      'navigation', 'lazyload', 'autoplay', 'pause_on_hover', 'pause_on_interaction',
      'autoplay_speed', 'infinite', 'effect', 'speed', 'image_spacing_custom',
      'image_spacing_custom_tablet', 'image_spacing_custom_mobile',
    ])
    const domProps = getDomAttributes(props as Record<string, unknown>)

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="ImageCarousel"
          data-widget_type="image-carousel.default"
          data-settings={dataSettings}
        >
          <div
            className="elementor-image-carousel-wrapper swiper"
            role="region"
            aria-roledescription="carousel"
            aria-label={String(settings.carousel_name || 'Image Carousel')}
            dir={settings.direction || 'ltr'}
          >
            <div
              className={`elementor-image-carousel swiper-wrapper ${settings.image_stretch === 'yes' ? 'swiper-image-stretch' : ''}`.trim()}
              aria-live={settings.autoplay === 'yes' ? 'off' : 'polite'}
            >
              {images.map((rawImage: Record<string, any>, index: number) => {
                const image = rawImage || {}
                const src = resolvePreviewImageUrl(String(image.url || ''))
                if (!src) return null
                const caption = carouselCaptionForImage(image, String(settings.caption_type || ''))
                const lazy = settings.lazyload === 'yes'
                const imageNode = (
                  <>
                    <img
                      className={`swiper-slide-image ${lazy ? 'swiper-lazy' : ''}`.trim()}
                      src={lazy ? undefined : src}
                      data-src={lazy ? src : undefined}
                      alt={String(image.alt || '')}
                    />
                    {lazy ? <div className="swiper-lazy-preloader" /> : null}
                  </>
                )
                const figure = (
                  <figure className="swiper-slide-inner">
                    {imageNode}
                    {caption ? <figcaption className="elementor-image-carousel-caption">{caption}</figcaption> : null}
                  </figure>
                )
                const content = settings.link_to === 'custom' && settings.link?.url ? (
                  <a href={settings.link.url} target={settings.link.is_external ? '_blank' : undefined} rel={settings.link.nofollow ? 'nofollow' : undefined}>{figure}</a>
                ) : settings.link_to === 'file' ? (
                  <a href={src} data-elementor-open-lightbox={settings.open_lightbox || 'default'} data-elementor-lightbox-slideshow={id}>{figure}</a>
                ) : figure

                return (
                  <div
                    className="swiper-slide"
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} of ${images.length}`}
                    key={image.id || `carousel_${index}`}
                  >
                    {content}
                  </div>
                )
              })}
            </div>
            {showArrows ? (
              <>
                <div className="elementor-swiper-button elementor-swiper-button-prev" role="button" tabIndex={0}>
                  {renderPreviewIcon(settings.navigation_previous_icon)}
                </div>
                <div className="elementor-swiper-button elementor-swiper-button-next" role="button" tabIndex={0}>
                  {renderPreviewIcon(settings.navigation_next_icon)}
                </div>
              </>
            ) : null}
            {showDots ? <div className="swiper-pagination" /> : null}
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('image-carousel', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'image-carousel', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(ImageCarousel as any).__elementorAbstraction = { kind: 'widget', name: 'ImageCarousel', widgetKey: 'image-carousel' }

export const NavMenu: React.FC<NavMenuProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('nav-menu', props as Record<string, unknown>))
    const css = getNavMenuCSS(id, settings)
    const items = props.items && props.items.length > 0
      ? props.items
      : [
          { text: 'Home', url: '#' },
          { text: 'About', url: '#' },
          { text: 'Contact', url: '#' },
        ]
    const layout = settings.layout || 'horizontal'
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-nav-menu',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const pointerClasses = [
      settings.pointer && settings.pointer !== 'none' ? `e--pointer-${settings.pointer}` : '',
      settings.animation_line || settings.animation_framed || settings.animation_background || settings.animation_text
        ? `e--animation-${settings.animation_line || settings.animation_framed || settings.animation_background || settings.animation_text}`
        : '',
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    const renderItems = (navItems: NavMenuItem[], depth = 0): ReactNode => (
      <ul className={depth === 0 ? 'elementor-nav-menu' : 'sub-menu elementor-nav-menu--dropdown'}>
        {navItems.map((item, index) => {
          const link = normalizeLink(item.link || item.url || '#') as Record<string, any>
          const hasChildren = Array.isArray(item.children) && item.children.length > 0
          return (
            <li className={`menu-item ${hasChildren ? 'menu-item-has-children' : ''}`.trim()} key={item._id || `${depth}_${index}`}>
              <a href={String(link.url || '#')} className="elementor-item">
                <span>{item.text}</span>
                {hasChildren ? <span className="sub-arrow">{renderPreviewIcon(settings.submenu_icon || { value: 'fas fa-caret-down', library: 'fa-solid' })}</span> : null}
              </a>
              {hasChildren ? renderItems(item.children!, depth + 1) : null}
            </li>
          )
        })}
      </ul>
    )

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="NavMenu"
          data-widget_type="nav-menu.default"
          data-settings={widgetDataSettings(settings, ['layout', 'dropdown', 'toggle', 'full_width'])}
        >
          {settings.toggle !== 'none' ? (
            <div className="elementor-menu-toggle" role="button" tabIndex={0} aria-label="Menu Toggle" aria-expanded="false">
              {renderPreviewIcon(settings.toggle_icon_normal || { value: 'fas fa-bars', library: 'fa-solid' })}
            </div>
          ) : null}
          {layout !== 'dropdown' ? (
            <nav className={`elementor-nav-menu--main elementor-nav-menu__container elementor-nav-menu--layout-${layout} ${pointerClasses}`.trim()} aria-label={String(settings.menu_name || 'Menu')}>
              {renderItems(items)}
            </nav>
          ) : null}
          <nav className="elementor-nav-menu--dropdown elementor-nav-menu__container" aria-hidden={layout !== 'dropdown'} aria-label={`${String(settings.menu_name || 'Menu')} Dropdown`}>
            {renderItems(items)}
          </nav>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('nav-menu', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'nav-menu', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(NavMenu as any).__elementorAbstraction = { kind: 'widget', name: 'NavMenu', widgetKey: 'nav-menu' }

export const ElementorForm: React.FC<ElementorFormProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('form', props as Record<string, unknown>))
    const css = getElementorFormCSS(id, settings)
    const fields = Array.isArray(settings.form_fields) ? settings.form_fields as Record<string, any>[] : []
    const validButtonAlign = (value: unknown) => {
      const align = String(value || '')
      return align === 'start' || align === 'center' || align === 'end' || align === 'stretch' ? align : undefined
    }
    const buttonAlign = validButtonAlign(settings.button_align) || 'stretch'
    const buttonAlignTablet = validButtonAlign(settings.button_align_tablet)
    const buttonAlignMobile = validButtonAlign(settings.button_align_mobile)
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      `elementor-button-align-${buttonAlign}`,
      buttonAlignTablet ? `elementor-tablet-button-align-${buttonAlignTablet}` : null,
      buttonAlignMobile ? `elementor-mobile-button-align-${buttonAlignMobile}` : null,
      'elementor-widget',
      'elementor-widget-form',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)
    const renderField = (field: Record<string, any>) => {
      const type = String(field.field_type || 'text')
      const customId = String(field.custom_id || field._id || type)
      const fieldId = `form-field-${customId}`
      const options = String(field.field_options || '').split(/\r?\n/).map(option => option.trim()).filter(Boolean)
      const common = {
        id: fieldId,
        name: `form_fields[${customId}]`,
        className: `elementor-field elementor-size-${settings.input_size || 'sm'} elementor-field-textual`,
        placeholder: String(field.placeholder || ''),
        defaultValue: String(field.field_value || ''),
        required: field.required === 'true',
      }
      if (type === 'textarea') return <textarea {...common} rows={Number(field.rows) || 4} />
      if (type === 'select') {
        return (
          <div className="elementor-field elementor-select-wrapper remove-before">
            <div className="select-caret-down-wrapper" aria-hidden="true">
              <i className="eicon-caret-down" />
            </div>
            <select
              id={fieldId}
              name={`form_fields[${customId}]`}
              className={`elementor-field-textual elementor-size-${settings.input_size || 'sm'}`}
              required={field.required === 'true'}
              defaultValue={String(field.field_value || '')}
            >
              {options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </div>
        )
      }
      if (type === 'radio' || type === 'checkbox') {
        return (
          <div className={`elementor-field-subgroup ${field.inline_list === 'yes' ? 'elementor-subgroup-inline' : ''}`.trim()}>
            {options.map((option, index) => (
              <span className="elementor-field-option" key={option}>
                <input id={`${fieldId}-${index}`} type={type} name={`form_fields[${customId}]${type === 'checkbox' ? '[]' : ''}`} value={option} defaultChecked={String(field.field_value || '') === option} />
                <label htmlFor={`${fieldId}-${index}`}>{option}</label>
              </span>
            ))}
          </div>
        )
      }
      if (type === 'acceptance') {
        return (
          <span className="elementor-field-option">
            <input id={fieldId} type="checkbox" name={`form_fields[${customId}]`} required={field.required === 'true'} />
            <label htmlFor={fieldId}>{String(field.field_label || 'I agree')}</label>
          </span>
        )
      }
      if (type === 'html') return <div className="elementor-field elementor-field-html" dangerouslySetInnerHTML={{ __html: String(field.field_html || field.field_value || '') }} />
      if (type === 'hidden') return <input type="hidden" name={`form_fields[${customId}]`} value={String(field.field_value || '')} />
      return <input {...common} type={type === 'upload' ? 'file' : type} min={field.field_min} max={field.field_max} />
    }

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="ElementorForm"
          data-widget_type="form.default"
        >
          <form className="elementor-form" method="post" name={String(settings.form_name || 'Contact Form')} aria-label={String(settings.form_name || 'Contact Form')} onSubmit={(event) => event.preventDefault()}>
            <input type="hidden" name="form_id" value={id} />
            <div className={`elementor-form-fields-wrapper elementor-labels-${settings.label_position === 'inline' ? 'inline' : 'above'}`}>
              {fields.map((field, index) => {
                const customId = String(field.custom_id || field._id || `field_${index + 1}`)
                const width = Math.max(1, Math.min(100, Number(field.width) || 100))
                const type = String(field.field_type || 'text')
                const isRequired = field.required === 'true'
                const groupClasses = [
                  `elementor-field-type-${type}`,
                  'elementor-field-group',
                  'elementor-column',
                  `elementor-field-group-${customId}`,
                  `elementor-col-${width}`,
                  isRequired ? 'elementor-field-required' : null,
                  isRequired && settings.mark_required === 'yes' ? 'elementor-mark-required' : null,
                ].filter(Boolean).join(' ')
                return (
                  <div className={groupClasses} key={field._id || customId}>
                    {settings.show_labels !== '' && type !== 'hidden' && type !== 'html' && type !== 'acceptance' ? (
                      <label className="elementor-field-label" htmlFor={`form-field-${customId}`}>{String(field.field_label || customId)}</label>
                    ) : null}
                    {renderField(field)}
                  </div>
                )
              })}
              <div className="elementor-field-group elementor-column elementor-field-type-submit elementor-col-100 e-form__buttons">
                <button className={`elementor-button elementor-size-${settings.button_size || 'sm'}`} type="submit">
                  <span className="elementor-button-content-wrapper">
                    {settings.selected_button_icon ? <span className="elementor-button-icon">{renderPreviewIcon(settings.selected_button_icon)}</span> : null}
                    <span className="elementor-button-text">{String(settings.button_text || 'Send')}</span>
                  </span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('form', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'form', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(ElementorForm as any).__elementorAbstraction = { kind: 'widget', name: 'ElementorForm', widgetKey: 'form' }

export const Slides: React.FC<SlidesProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('slides', props as Record<string, unknown>))
    const css = getSlidesCSS(id, settings)
    const slides = Array.isArray(settings.slides) ? settings.slides as Record<string, any>[] : []
    if (slides.length === 0) return null
    const navigation = settings.navigation || 'both'
    const showArrows = slides.length > 1 && (navigation === 'both' || navigation === 'arrows')
    const showDots = slides.length > 1 && (navigation === 'both' || navigation === 'dots')
    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-slides',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)
    const dataSettings = widgetDataSettings(settings, [
      'navigation', 'autoplay', 'pause_on_hover', 'pause_on_interaction',
      'autoplay_speed', 'infinite', 'transition', 'transition_speed', 'content_animation',
    ])

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Slides"
          data-widget_type="slides.default"
          data-settings={dataSettings}
        >
          <div className="elementor-slides-wrapper elementor-main-swiper swiper" role="region" aria-roledescription="carousel" aria-label={String(settings.slides_name || 'Slides')} data-animation={settings.content_animation || ''}>
            <div className="swiper-wrapper">
              {slides.map((slide, index) => {
                const imageUrl = resolvePreviewImageUrl(String(slide.background_image?.url || ''))
                const bgStyle: React.CSSProperties = {
                  backgroundColor: slide.background_color,
                  backgroundImage: imageUrl ? `url("${imageUrl}")` : undefined,
                  backgroundSize: slide.background_size || 'cover',
                }
                const content = (
                  <div className="swiper-slide-inner">
                    <div className="swiper-slide-contents">
                      {slide.heading ? React.createElement(settings.slides_title_tag || 'div', { className: 'elementor-slide-heading' }, String(slide.heading)) : null}
                      {slide.description ? React.createElement(settings.slides_description_tag || 'div', { className: 'elementor-slide-description' }, String(slide.description)) : null}
                      {slide.button_text ? <a className={`elementor-button elementor-slide-button elementor-size-${settings.button_size || 'sm'}`} href={slide.link?.url || '#'}>{String(slide.button_text)}</a> : null}
                    </div>
                  </div>
                )
                return (
                  <div className={`swiper-slide elementor-repeater-item-${slide._id}`} role="group" aria-roledescription="slide" aria-label={`${index + 1} of ${slides.length}`} key={slide._id || index}>
                    <div className="swiper-slide-bg" style={bgStyle} />
                    {slide.background_overlay === 'yes' ? <div className="elementor-background-overlay" style={{ backgroundColor: slide.background_overlay_color || 'rgba(0,0,0,0.35)' }} /> : null}
                    {slide.link?.url && slide.link_click === 'slide' ? <a className="swiper-slide-inner" href={slide.link.url}>{content}</a> : content}
                  </div>
                )
              })}
            </div>
            {showArrows ? (
              <>
                <div className="elementor-swiper-button elementor-swiper-button-prev" role="button" tabIndex={0}>{renderPreviewIcon({ value: 'eicon-chevron-left', library: 'eicons' })}</div>
                <div className="elementor-swiper-button elementor-swiper-button-next" role="button" tabIndex={0}>{renderPreviewIcon({ value: 'eicon-chevron-right', library: 'eicons' })}</div>
              </>
            ) : null}
            {showDots ? <div className="swiper-pagination" /> : null}
          </div>
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('slides', props as Record<string, unknown>)
  const element: ElementorElement = { id, elType: 'widget', widgetType: 'slides', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Slides as any).__elementorAbstraction = { kind: 'widget', name: 'Slides', widgetKey: 'slides' }

export const Image: React.FC<ImageProps> = (props) => {
  const isPreview = useIsPreviewMode()
  const id = useMemo(() => props.id || generateElementId(), [props.id])

  if (isPreview) {
    const settings = asPreviewSettings(mapWidgetProps('image', props as Record<string, unknown>))
    const css = getImageCSS(id, settings)
    const image = settings.image || {}
    let src = image.url || ''
    const alt = image.alt || props.alt || ''

    if (!src) return null

    if (src && src.startsWith('asset://') && typeof window !== 'undefined') {
      const baseUrl = (window as any).__UP_IMAGES_BASE_URL
      if (baseUrl) src = src.replace('asset://', baseUrl + '/')
    }

    const classes = [
      'elementor-element',
      `elementor-element-${id}`,
      'elementor-widget',
      'elementor-widget-image',
      layoutPositionClass(settings, 'widget'),
      props.className,
    ].filter(Boolean).join(' ')
    const domProps = getDomAttributes(props as Record<string, unknown>)

    const imageClasses = [
      settings.hover_animation ? `elementor-animation-${settings.hover_animation}` : '',
    ].filter(Boolean).join(' ')

    const renderImageEl = () => (
      <img
        src={src}
        className={imageClasses || undefined}
        title={image.title || ''}
        alt={alt}
        loading="lazy"
      />
    )

    const linkUrl = settings.link_to === 'custom'
      ? settings.link?.url
      : settings.link_to === 'file'
        ? src
        : undefined

    const renderLinkedImage = () => {
      if (!linkUrl) return renderImageEl()
      const dataAttrs = settings.link_to === 'file' && settings.open_lightbox !== 'no' ? {
        'data-elementor-open-lightbox': settings.open_lightbox || 'default',
        'data-elementor-lightbox-slideshow': id,
      } : {}
      return (
        <a
          href={linkUrl}
          target={settings.link?.is_external ? '_blank' : undefined}
          rel={settings.link?.nofollow ? 'nofollow' : settings.link?.is_external ? 'noopener noreferrer' : undefined}
          {...dataAttrs}
        >
          {renderImageEl()}
        </a>
      )
    }

    const caption = settings.caption_source === 'custom' ? settings.caption :
                    settings.caption_source === 'attachment' ? image.title : undefined
    const content = caption ? (
      <figure className="wp-caption">
        {renderLinkedImage()}
        <figcaption className="widget-image-caption wp-caption-text">
          {caption}
        </figcaption>
      </figure>
    ) : renderLinkedImage()

    return (
      <>
        <StyleTag elementId={id} css={css} />
        <div
          {...domProps}
          className={classes}
          data-id={id}
          data-element_type="widget"
          data-e-type="widget"
          data-up-component="Image"
          data-widget_type="image.default"
        >
          {content}
        </div>
      </>
    )
  }

  const doc = useDocument()
  const parent = useElementContext()
  const settings = mapWidgetProps('image', props as Record<string, unknown>)

  const element: ElementorElement = { id, elType: 'widget', widgetType: 'image', settings }

  React.useEffect(() => {
    doc.addElement(element, parent?.parentId)
  }, [])

  return null
}
;(Image as any).__elementorAbstraction = { kind: 'widget', name: 'Image', widgetKey: 'image' }

// =============================================================================
// DOCUMENT BUILDER
// =============================================================================

interface DocumentBuilderProps {
  title?: string
  children: React.ReactNode
  onBuild?: (doc: ElementorDocument) => void
}

export const DocumentBuilder: React.FC<DocumentBuilderProps> = ({ title = 'Untitled', children, onBuild }) => {
  const isPreview = useIsPreviewMode()
  const documentId = useMemo(() => generateElementId(), [])
  const elementsRef = React.useRef<Map<string, ElementorElement>>(new Map())
  const rootElementsRef = React.useRef<string[]>([])

  const addElement = useCallback((element: ElementorElement, parentId?: string) => {
    elementsRef.current.set(element.id, element)
    if (parentId) {
      const parent = elementsRef.current.get(parentId)
      if (parent) {
        parent.elements = parent.elements || []
        parent.elements.push(element)
      }
    } else {
      rootElementsRef.current.push(element.id)
    }
  }, [])

  const getElements = useCallback((): ElementorElement[] => {
    return rootElementsRef.current.map(id => elementsRef.current.get(id)!).filter(Boolean)
  }, [])

  const contextValue = useMemo(() => ({ documentId, addElement, getElements }), [documentId, addElement, getElements])

  React.useEffect(() => {
    if (onBuild) {
      const doc: ElementorDocument = {
        title,
        status: 'publish',
        type: 'page',
        version: '0.4',
        settings: {},
        page_settings: {},
        elements: getElements(),
      }
      onBuild(doc)
    }
  }, [onBuild, title, getElements])

  const content = <DocumentContext.Provider value={contextValue}>{children}</DocumentContext.Provider>
  return isPreview ? (
    <CSSProvider documentId={documentId}>
      <div className={`elementor elementor-${documentId}`}>
        {content}
      </div>
    </CSSProvider>
  ) : content
}
