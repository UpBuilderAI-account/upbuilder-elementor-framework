/**
 * Compiler functions for the Elementor JSX Abstraction Layer
 * Converts React JSX to Elementor JSON documents
 */

import React, { Children, Fragment, isValidElement, type ReactNode, type JSXElementConstructor } from 'react';
import type { ElementorElement, ElementorDocument } from '../../types';
import { mapGridProps, mapFlexboxProps, mapWidgetProps } from './mappers';

// =============================================================================
// ID GENERATION
// =============================================================================

let sequentialIdCounter = 0;

export function resetIdCounter(): void {
  sequentialIdCounter = 0;
}

export function generateSequentialId(): string {
  sequentialIdCounter += 1;
  return String(sequentialIdCounter).padStart(7, '0') + 'a';
}

export function generateElementId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 7; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

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

type NormalizedNode = {
  meta: AbstractionComponentMeta
  props: Record<string, unknown>
  children: NormalizedNode[]
}

type AbstractionComponent<P> = JSXElementConstructor<P> & {
  __elementorAbstraction?: AbstractionComponentMeta
}

// =============================================================================
// NODE PROCESSING
// =============================================================================

function getMetaFromType(type: unknown): AbstractionComponentMeta | undefined {
  return (type as AbstractionComponent<unknown> | undefined)?.__elementorAbstraction
}

function normalizeChildren(value: ReactNode): NormalizedNode[] {
  const normalized: NormalizedNode[] = []
  for (const child of Children.toArray(value)) {
    const next = normalizeNode(child)
    if (next) normalized.push(next)
  }
  return normalized
}

function normalizeNode(node: ReactNode): NormalizedNode | null {
  if (!isValidElement(node)) return null

  const nodeProps = (node.props ?? {}) as { children?: ReactNode }

  if (node.type === Fragment) {
    const children = normalizeChildren(nodeProps.children)
    if (children.length === 0) return null
    return { meta: { kind: 'page', name: 'Fragment' }, props: {}, children }
  }

  const meta = getMetaFromType(node.type)
  if (!meta) return null

  const { children, ...props } = nodeProps as Record<string, unknown>
  return { meta, props, children: normalizeChildren(children as ReactNode) }
}

// =============================================================================
// ELEMENT COMPILATION
// =============================================================================

function compileElement(node: NormalizedNode, isInner = false): ElementorElement {
  if (node.meta.kind === 'page') {
    throw new Error('Page nodes cannot be compiled as elements.')
  }

  const element: ElementorElement = {
    id: typeof node.props.id === 'string' ? node.props.id : generateSequentialId(),
    elType: node.meta.kind === 'container' ? 'container' : 'widget',
    settings: {},
    elements: [],
  }

  if (node.meta.kind === 'container') {
    element.isInner = isInner
    if (node.meta.containerType === 'grid') {
      element.settings = mapGridProps(node.props)
    } else {
      element.settings = mapFlexboxProps(node.props)
    }
  } else {
    element.widgetType = node.meta.widgetKey!
    element.settings = mapWidgetProps(node.meta.widgetKey!, node.props)
  }

  element.elements = node.children
    .filter((child) => child.meta.kind !== 'page')
    .map((child) => compileElement(child, true))

  return element
}

// =============================================================================
// PUBLIC API
// =============================================================================

export function compileReactPage(input: ReactNode, title = 'Generated Page'): ElementorDocument {
  resetIdCounter()
  const normalized = normalizeChildren(input)

  let rootChildren: NormalizedNode[]
  let pageTitle = title

  if (normalized.length === 1 && normalized[0]?.meta.kind === 'page' && normalized[0].meta.name === 'Page') {
    const pageNode = normalized[0]
    rootChildren = pageNode.children
    if (typeof pageNode.props.title === 'string') pageTitle = pageNode.props.title
  } else {
    rootChildren = normalized.filter((child) => child.meta.name !== 'Fragment')
    if (normalized.length === 1 && normalized[0]?.meta.name === 'Fragment') {
      rootChildren = normalized[0].children
    }
  }

  return {
    title: pageTitle,
    type: 'wp-page',
    status: 'publish',
    version: '0.4',
    settings: {},
    page_settings: {},
    elements: rootChildren.map((child) => compileElement(child, false)),
  }
}

export function createElement(
  type: 'container' | 'widget',
  widgetType: string | undefined,
  settings: Record<string, any>,
  children?: ElementorElement[]
): ElementorElement {
  return {
    id: generateElementId(),
    elType: type,
    widgetType,
    settings,
    elements: children,
  };
}

export function createDocument(
  elements: ElementorElement[],
  options?: {
    title?: string;
    pageSettings?: Record<string, any>;
  }
): ElementorDocument {
  return {
    title: options?.title || 'Untitled',
    status: 'publish',
    type: 'page',
    version: '0.4',
    settings: {},
    page_settings: options?.pageSettings || {},
    elements,
  };
}
