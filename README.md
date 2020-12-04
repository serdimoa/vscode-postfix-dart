# vscode-postfix-dart

[![MarketPlace Tag](https://vsmarketplacebadge.apphb.com/version-short/SerDimoa.vscode-postfix-dart.svg)](https://marketplace.visualstudio.com/items?itemName=SerDimoa.vscode-postfix-dart)
[![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/SerDimoa.vscode-postfix-dart)](https://marketplace.visualstudio.com/items?itemName=SerDimoa.vscode-postfix-dart)


> Postfix templates for Dart

## Features

This extension features postfix templates that can be used to improve productivity.
It's been inspired on former, great [TypeScript/JavaScript extension](https://github.com/ipatalas/vscode-postfix-ts).

I find it annoying to jump the cursor back and forth whenever I want to perform some simple operations. This extension makes it easier. I use this feature on daily basis in C# but was missing it in Dart until now.

All available templates (`expr` means the expression on which the template is applied):

| Template          | Outcome |
| -------:          | ------- |
| **.if**           | `if (expr)` |
| **.else**         | `if (!expr)` |
| **.null**         | `if (expr === null)` |
| **.notnull**      | `if (expr !== null)` |
| **.for**          | `for (var i = 0; i < expr.length; i++)` |
| **.forin**        | `for (let item in expr)` |
| **.foreach**      | `expr.forEach((item){} )` |
| **.not**          | `!expr` |
| **.return**       | `return expr` |
| **.var**          | `var name = expr` |
| **.varType**          | `SomeType name = expr` |
| **.const**        | `const name = expr` |
| **.print**          | `print(expr)` |
| **.castis**         | `expr is SomeType` |
| **.castas**       | `expr as SomeTyp` |


## Custom templates (1.6.0 and above)

You can now add your own templates if the defaults are not enough. This will only work for simple ones as some templates require additional tricky handling.
To configure a template you need to set `postfix.customTemplates` setting. It's an array of the following objects:

```JSON
{
  "name": "...",
  "description": "...",
  "body": "...",
  "when": ["..."]
}
```

`name` defines what will be the name of the suggestion
`description` will show additional optional description when suggestion panel is opened
`body` defines how the template will work (see below)
`when` defines conditions when the template should be suggested

### Template body

Template body defines how will the expression before the cursor be replaced.
It supports standard Visual Studio Code [Snippet syntax](https://code.visualstudio.com/docs/editor/userdefinedsnippets#_snippet-syntax).
There is also one special placeholder that can be used:

- `{{expr}}`: this will be replaced by the expression on which the template is applied so for example `!{{expr}}` will simply negate the expression

### Template conditions

`when` condition can be zero or more of the following options:

- `identifier`: simple identifier, ie. `variableName` (inside an if statement or function call arguments)
- `expression`: can be either a simple expression like `object.property.value` or `array[index]` or a combination of them
- `binary-expression`: a binary expression, ie. `x > 3`, `x * 100`, `x && y`
- `unary-expression`: an unary expression, ie. `!x`, `x++` or `++x`
- `function-call`: a function call expression, ie. `func()`, `object.method()` and so on

If no conditions are specified then given template will be available under all possible situations

## Configuration

This plugin contributes the following [settings](https://code.visualstudio.com/docs/customization/userandworkspace):

- `postfix.languages`: array of [language identifiers](https://code.visualstudio.com/docs/languages/identifiers) in which the extension will be available. Default value is  **['dart']**
- `postfix.customTemplates`: array of custom template definitions - see [Custom templates (1.6.0 and above)](#custom-templates-160-and-above)

## Known issues

Feel free to open issues for whatever you think may improve the extension's value. New ideas for more templates are also welcome. Most of them are pretty easy to implement.
