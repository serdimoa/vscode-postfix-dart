import * as ts from 'typescript'
import { CompletionItemBuilder } from '../completionItemBuilder'
import { BaseExpressionTemplate } from './baseTemplates'

export class CastTemplate extends BaseExpressionTemplate {

  constructor (private keyword: 'castas' | 'castis') {
    super()
  }

  buildCompletionItem(node: ts.Node, indentSize?: number) {
    const completionitembuilder = CompletionItemBuilder.create(this.keyword, node, indentSize)

    if (this.keyword === 'castis') {
      return completionitembuilder
        .description(`(expr as SomeType)`)
        .replace('{{expr}} is $1$0', true)
        .build()
    }

    return completionitembuilder
      .description(`expr as SomeType`)
      .replace('{{expr}} as $1$0', true)
      .build()
  }

  canUse (node: ts.Node) {
    return super.canUse(node) || this.isNewExpression(node)
  }
}

export const build = () => [
  new CastTemplate('castas'),
  new CastTemplate('castis')
]
