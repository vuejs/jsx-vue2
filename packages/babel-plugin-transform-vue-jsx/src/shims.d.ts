declare module '@babel/plugin-syntax-jsx' {
  import { PluginObj } from '@babel/core'
  
  const syntaxJsx: PluginObj
  export default syntaxJsx
}

declare module 'svg-tags' {
  const svgTags: readonly string[]
  export default svgTags
}

declare module '@babel/helper-module-imports' {
  import { NodePath } from '@babel/core'
  import { Identifier } from '@babel/types'
  const addDefault: (path: NodePath, importedSource: string, opts?: { nameHint?: string }) => Identifier
}
