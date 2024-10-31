const vscode = require('vscode')
const path = require('path')
const fs = require('fs')
const { list, copy } = require('./src/yaml-path')

/**
 * @param {vscode.TextDocument} document 
 * @returns {boolean}                    True if the current document is a YAML document, either by extension or by format.
 */
function shouldWorkWithCurrentDocument(document) {
  return document.languageId === "yaml" || path.extname(file) === '.yml' || path.extname(file) === '.yaml'
}

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
  let searchPaths = vscode.commands.registerTextEditorCommand('yamlnav.search', function (editor) {
    const file = editor.document.fileName

    if (!shouldWorkWithCurrentDocument(editor.document)) {
      vscode.window.showErrorMessage("Only works with yaml files.")
      return
    }

    const content = fs.readFileSync(file, 'utf8')
    const results = list(content)

    vscode.window.showQuickPick(results.map(item => item.path))
      .then(selected => {
        if (!selected) return

        const lineNumber = results.find(item => item.path === selected).line.line - 1
        const line = editor.document.lineAt(lineNumber)
        const characterIndex = line.firstNonWhitespaceCharacterIndex

        const position = new vscode.Position(lineNumber, characterIndex)
        editor.selections = [new vscode.Selection(position,position)];
        const range = new vscode.Range(position, position);
        editor.revealRange(range);
      })
  });

  let copyPath = vscode.commands.registerTextEditorCommand('yamlnav.copy', function(editor) {
    const file = editor.document.fileName

    if (!shouldWorkWithCurrentDocument(editor.document)) {
      vscode.window.showErrorMessage("Only works with yaml files.")
      return
    }

    const lineNumber = editor.selection.active.line + 1
    const content = fs.readFileSync(file, 'utf8')
    const nodePath = copy(content, lineNumber)

    vscode.env.clipboard.writeText(nodePath.path)
    vscode.window.showInformationMessage(nodePath.path)
  });

  context.subscriptions.push(searchPaths, copyPath);
}

// this method is called when your extension is deactivated
function deactivate() {}

module.exports = {
  activate,
  deactivate
}
