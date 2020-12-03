import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class VarTemplate extends BaseExpressionTemplate {
  constructor(private keyword: 'var' | 'varType' | 'const') {
    super()
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const replacer = this.keyword=="varType"?'${1:type} ${2:name} = {{expr}}$0': this.keyword + ' ${1:name} = {{expr}}$0';
    return CompletionItemBuilder
      .create(this.keyword, node, indentSize)
      .description(`${this.keyword} name = expr`)
      .replace(replacer, true)
      .build()
  }

  canUse(node: ts.Node) {
    return (super.canUse(node) || this.isNewExpression(node) || this.isObjectLiteral(node))
      && !this.inReturnStatement(node)
      && !this.inFunctionArgument(node)
      && !this.inVariableDeclaration(node)
      && !this.inAssignmentStatement(node)
  }
}

export const build = () => [
  new VarTemplate('var'),
  new VarTemplate('varType'),
  new VarTemplate('const')
]
