import { NodePath } from '@babel/traverse'
import * as t from "@babel/types";

declare module '@babel/traverse' {
  export interface NodePath {
    isJSXSpreadChild(opts?: object): this is NodePath<t.JSXSpreadChild>;
  }
}