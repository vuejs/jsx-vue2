import { Expression, isExpression } from '@babel/types';

export enum RootAttributeKey {
  StaticClass = 'staticClass',
  Class = 'class',
  Style = 'style',
  Key = 'key',
  Ref = 'ref',
  RefInFor = 'refInFor',
  Slot = 'slot',
  ScopedSlots = 'scopedSlots',
  Model = 'model'
}
export enum RootPrefixKey {
  Props = 'props',
  DomProps = 'domProps',
  On = 'on',
  NativeOn = 'nativeOn',
  Hook = 'hook',
  Attrs = 'attrs',
}

export const toArryJoin: RootPrefixKey[] = [RootPrefixKey.On, RootPrefixKey.NativeOn]

export enum ParsedAttributeType {
  Spread = 'spread',
  Root = 'root',
  PrefixSimple = 'prefix-simple',
  PrefixGroup = 'prefix-group',
  Directive = 'directive'
}

export interface AttributeBase {
  value: Expression
}
export interface NamedAttributeBase extends AttributeBase {
  name: string
}
export interface DirectiveAttribute extends NamedAttributeBase {
  type: ParsedAttributeType.Directive
  rawName: string
  argument: string
  modifiers: string[]
}
export interface SimplePrefixAttribute extends NamedAttributeBase {
  type: ParsedAttributeType.PrefixSimple
  prefix: RootPrefixKey
}
export interface GroupPrefixAttribute extends AttributeBase {
  type: ParsedAttributeType.PrefixGroup
  prefix: RootPrefixKey
}
export interface SpreadAttribute extends AttributeBase {
  type: ParsedAttributeType.Spread
}
export interface RootAttribute extends AttributeBase {
  type: ParsedAttributeType.Root
  key: RootAttributeKey
}
export type OptimizedAttribute = SpreadAttribute | VNodeOptions
export type ParsedAttribute = SimplePrefixAttribute | GroupPrefixAttribute | SpreadAttribute | RootAttribute | DirectiveAttribute

export type VNodeOptionsRoot = { [key in RootAttributeKey]?: Expression }
export type VNodeOptionsPrefix = { [key in RootPrefixKey]?: VNodeOptionsPrefixValue[] }
export type VNodeOptionsPrefixValue = NamedAttributeBase | Expression
export type VNodeOptions = { type: 'VNodeOptions', directives: DirectiveAttribute[] } & VNodeOptionsRoot & VNodeOptionsPrefix

export const rootAttributeKeys = Object.values(RootAttributeKey)
export const rootPrefixKeys = Object.values(RootPrefixKey)

export const isRootAttributeKey = (key: string): key is RootAttributeKey =>
  rootAttributeKeys.includes(key as RootAttributeKey)
export const isRootPrefixKey = (key: string): key is RootPrefixKey =>
  rootPrefixKeys.includes(key as RootPrefixKey)

export const isRootAttribute = (attribute: ParsedAttribute): attribute is RootAttribute =>
  attribute.type === ParsedAttributeType.Root
export const isSpreadAttribute = (attribute: ParsedAttribute | OptimizedAttribute): attribute is SpreadAttribute =>
  attribute.type === ParsedAttributeType.Spread
export const isSimplePrefixAttribute = (attribute: ParsedAttribute): attribute is SimplePrefixAttribute =>
  attribute.type === ParsedAttributeType.PrefixSimple
export const isGroupPrefixAttribute = (attribute: ParsedAttribute): attribute is GroupPrefixAttribute =>
  attribute.type === ParsedAttributeType.PrefixGroup
export const isDirectiveAttribute = (attribute: ParsedAttribute): attribute is DirectiveAttribute =>
  attribute.type === ParsedAttributeType.Directive

export const isNamedAttribute = (attribute: VNodeOptionsPrefixValue): attribute is NamedAttributeBase =>
  attribute.hasOwnProperty('name') && attribute.hasOwnProperty('value') && !isExpression(attribute)

export const isVNodeOptions = (attr: OptimizedAttribute): attr is VNodeOptions =>
  attr.type === 'VNodeOptions'
