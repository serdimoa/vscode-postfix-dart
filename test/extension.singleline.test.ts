import * as vsc from 'vscode'
import { runTest as Test, runTestQuickPick as QuickPick } from './runner'

const config = vsc.workspace.getConfiguration('postfix')

describe('Single line template tests', () => {
  Test('not template - already negated expression | !expr{not} >> expr')

  Test('var template          | a.b{var}   >> var name = a.b')
  Test('const template        | a.b{const} >> const name = a.b')

  Test('print template   | expr{print}   >> print(expr)')

  Test('return template | expr{return}       >> return expr')

  Test('if template                       | expr{if}      >> if(expr){}', true)
  Test('else template                     | expr{else}    >> if(!expr){}', true)
  Test('else template - binary expression | x < 100{else} >> if(!(x<100)){}', true)

  Test('null template         | expr{null}         >> if(expr==null){}', true)
  Test('notnull template      | expr{notnull}      >> if(expr!=null){}', true)

  Test('for template     | expr{for}           >> for(var i=0;i<expr.length;i++){}', true)
  Test('awaited for      | await expr{for}     >> for(var i=0;i<(awaitexpr).length;i++){}', true)
  Test('forof template   | expr{forin}         >> for(variteminexpr){}', true)
  Test('foreach template | expr{foreach}       >> expr.forEach((item){})', true)
  Test('awaited foreach  | await expr{foreach} >> (await expr).forEach((item){})')

  Test('cast template   | expr{castas}   >> expr as ')
  Test('castas template | expr{castis} >> expr is ')

  Test('not template                                            | expr{not}                   >> !expr')
  Test('not template - inside a call expression                 | call.expression(expr{not})  >> call.expression(!expr)')
  Test('not template - inside a call expression - negated       | call.expression(!expr{not}) >> call.expression(expr)')
  Test('not template - binary expression                        | x * 100{not}                >> !(x * 100)')
  Test('not template - inside an if - identifier                | if (expr{not})              >> if(!expr)', true)
  Test('not template - inside an if - binary                    | if (x * 100{not})           >> if(!(x*100))', true)
  Test('not template - inside an if - brackets                  | if ((x * 100){not})         >> if(!(x*100))', true)
  Test('not template - already negated expression - method call | !x.method(){not}            >> x.method()')

  QuickPick('not template - complex conditions - first expression        | if (a > b && x * 100{not})    >> if(a>b&&!(x*100))', true, 0)
  QuickPick('not template - complex conditions - second expression       | if (a > b && x * 100{not})    >> if(a<=b||!(x*100))', true, 1)
  QuickPick('not template - complex conditions - cancel quick pick       | if (a > b && x * 100{not})    >> if(a>b&&x*100.)', true, 0, true)
  QuickPick('not template - complex conditions - first expression - alt  | if (a > b && x * 100{not}) {} >> if(a>b&&!(x*100)){}', true, 0)
  QuickPick('not template - complex conditions - second expression - alt | if (a > b && x * 100{not}) {} >> if(a<=b||!(x*100)){}', true, 1)
  QuickPick('not template - complex conditions - cancel quick pick - alt | if (a > b && x * 100{not}) {} >> if(a>b&&x*100.){}', true, 0, true)

  describe('custom template tests', () => {
    const setCustomNotTemplate = (when: string[]) => setCustomTemplate(config, 'custom', '!{{expr}}', when)
    const run = (when: string, ...tests: string[]) =>
      describe(when, () => {
        before(setCustomNotTemplate([when]))
        after(resetCustomTemplates(config))

        tests.forEach(t => Test(t))
      })

    run('identifier', 'expr{custom}           | expr{custom}        >> !expr')
    run('expression',
      '  expr.test{custom}                    | expr.test{custom}   >> !expr.test',
      '  expr[index]{custom}                  | expr[index]{custom} >> !expr[index]')
    run('binary-expression', 'x > 100{custom} | x > 100{custom}     >> !x > 100')
    run('unary-expression', ' !x{custom}      | !x{custom}          >> !!x')
    run('function-call',
      '  call(){custom}                       | call(){custom}      >> !call()',
      '  test.call(){custom}                  | test.call(){custom} >> !test.call()')
    run('new-expression', 'new Type(){custom} | new Type(){custom}  >> !new Type()')
  })

  describe('custom template with multiple expr tests', () => {
    const setCustomDoubleTemplate = (when: string[]) => setCustomTemplate(config, 'double', '{{expr}} + {{expr}}', when)
    const run = (when: string, ...tests: string[]) =>
      describe(when, () => {
        before(setCustomDoubleTemplate([when]))
        after(resetCustomTemplates(config))

        tests.forEach(t => Test(t))
      })

    run('identifier', 'expr{double}           | expr{double}        >> expr + expr')
    run('expression',
      '  expr.test{double}                    | expr.test{double}   >> expr.test + expr.test',
      '  expr[index]{double}                  | expr[index]{double} >> expr[index] + expr[index]')
    run('binary-expression', 'x > 100{double} | x > 100{double}     >> x > 100 + x > 100')
    run('unary-expression', '!x{double}       | !x{double}          >> !x + !x')
    run('function-call',
      '  call(){double}                       | call(){double}      >> call() + call()',
      '  test.call(){double}                  | test.call(){double} >> test.call() + test.call()')
  })
})

function setUndefinedMode(config: vsc.WorkspaceConfiguration, value: 'Equal' | 'Typeof' | undefined) {
  return (done: Mocha.Done) => {
    config.update('undefinedMode', value, true).then(done, done)
  }
}

function setCustomTemplate(config: vsc.WorkspaceConfiguration, name: string, body: string, when: string[]) {
  return (done: Mocha.Done) => {
    config.update('customTemplates', [{
      'name': name,
      'body': body,
      'description': 'custom description',
      'when': when
    }], true).then(done, done)
  }
}

function resetCustomTemplates(config: vsc.WorkspaceConfiguration) {
  return (done: Mocha.Done) => {
    config.update('customTemplates', undefined, true).then(done, done)
  }
}
