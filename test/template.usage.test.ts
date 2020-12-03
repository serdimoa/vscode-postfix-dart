import * as assert from 'assert'
import * as _ from 'lodash'
import * as vsc from 'vscode'

import { getCurrentSuggestion, resetCurrentSuggestion } from '../src/postfixCompletionProvider'
import { getCurrentDelay, delay } from './utils'

const LANGUAGE = 'postfix'

const VAR_TEMPLATES = ['var', 'varType', 'const']
const FOR_TEMPLATES = ['for', 'forin', 'foreach']
const CONSOLE_TEMPLATES = ['print']
const IF_TEMPLATES = ['if', 'else', 'null', 'notnull']
const CAST_TEMPLATES = ['castis', 'castas']
const ALL_TEMPLATES = [
  ...VAR_TEMPLATES,
  ...FOR_TEMPLATES,
  ...CONSOLE_TEMPLATES,
  ...IF_TEMPLATES,
  ...CAST_TEMPLATES,
  'not',
  'return',
]

describe('Template usage', () => {
  afterEach(done => {
    vsc.commands.executeCommand('workbench.action.closeOtherEditors').then(() => done(), err => done(err))
  })

  testTemplateUsage('identifier expression', 'expr', ALL_TEMPLATES)
  testTemplateUsage('awaited expression', 'await expr', ALL_TEMPLATES)
  testTemplateUsage('method call expression', 'expr.call()', _.difference(ALL_TEMPLATES, ['for']))
  testTemplateUsage('property access expression', 'expr.a.b.c', ALL_TEMPLATES)
  testTemplateUsage('element access expression', 'expr.a.b[c]', ALL_TEMPLATES)
  testTemplateUsage('unary expression', 'expr++', _.difference(ALL_TEMPLATES, [...FOR_TEMPLATES]))
  testTemplateUsage('conditional expression', 'if (x * 100{cursor})', ['not'])
  testTemplateUsage('return expression', 'return x * 100', [...CAST_TEMPLATES, 'not'])
  testTemplateUsage('object literal expression', '{}', [...VAR_TEMPLATES, ...CONSOLE_TEMPLATES, 'return'])
  testTemplateUsage('object literal expression', '{foo:"foo"}', [...VAR_TEMPLATES, ...CONSOLE_TEMPLATES, 'return'])
  testTemplateUsage('expression as argument', 'function.call("arg", expr.{cursor})', [...CAST_TEMPLATES, 'not'])

  testTemplateUsage('inside return - arrow function', 'return items.map(x => { result{cursor} })', ALL_TEMPLATES)
  testTemplateUsage('inside return - function', 'return items.map(function(x) { result{cursor} })', ALL_TEMPLATES)

  testTemplateUsage('inside variable declaration', 'var test = expr{cursor}', [...CAST_TEMPLATES, 'not'])
  testTemplateUsage('inside assignment statement', 'test = expr{cursor}', [...CAST_TEMPLATES, 'not'])
  testTemplateUsage('inside return', 'return expr{cursor}', [...CAST_TEMPLATES, 'not'])
  testTemplateUsage('inside single line comment', '// expr', [])
  testTemplateUsage('inside multi line comment', '/* expr{cursor} */', [])

})

function testTemplateUsage(testDescription: string, initialText: string, expectedTemplates: string[]) {
  it(testDescription, (done: Mocha.Done) => {
    vsc.workspace.openTextDocument({ language: LANGUAGE }).then((doc) => {
      return getAvailableSuggestions(doc, initialText).then(templates => {
        assert.deepStrictEqual(_.sortBy(templates), _.sortBy(expectedTemplates))
        done()
      }).then(undefined, (reason) => {
        done(reason)
      })
    })
  })
}

async function getAvailableSuggestions(doc: vsc.TextDocument, initialText: string) {
  const editor = await vsc.window.showTextDocument(doc, vsc.ViewColumn.One)

  let cursorIdx = initialText.indexOf('{cursor}')
  if (cursorIdx > -1) {
    initialText = initialText.replace('{cursor}', '.')
  } else {
    initialText += '.'
    cursorIdx = initialText.length
  }

  if (await editor.edit(edit => edit.insert(new vsc.Position(0, 0), initialText))) {
    let pos = new vsc.Position(0, cursorIdx + 1)
    editor.selection = new vsc.Selection(pos, pos)

    resetCurrentSuggestion()
    await vsc.commands.executeCommand('editor.action.triggerSuggest')
    await delay(getCurrentDelay())

    const firstSuggestion = getCurrentSuggestion()
    const suggestions = firstSuggestion ? [firstSuggestion] : []

    while (true) {
      await vsc.commands.executeCommand('selectNextSuggestion')

      let current = getCurrentSuggestion()

      if (current === undefined || suggestions.indexOf(current) > -1) {
        break
      }

      suggestions.push(current)
    }

    return suggestions
  }
}
