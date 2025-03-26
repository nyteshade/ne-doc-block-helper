/**
 * Doc Block Helper Extension
 * Provides automatic formatting and indentation for documentation blocks
 */

const vscode = require('vscode');
const commentFormats = require('./commentFormats');

/**
 * Tracks the number of consecutive empty Enter presses to provide
 * smart behavior for closing doc blocks
 * @type {Object.<string, number>}
 */
const emptyLineCounter = {};

/**
 * Activate the extension
 * @param {vscode.ExtensionContext} context - The extension context
 */
function activate(context) {
  console.log('Doc Block Helper is now active');

  // Register the Enter key handler
  const disposable = vscode.commands.registerCommand(
    'docBlockHelper.handleEnter',
    handleEnterKey
  );

  // Create a Type key handler to reset the empty line counter
  const typeDisposable = vscode.workspace.onDidChangeTextDocument(event => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    // Reset the counter if the user types something (not just pressing Enter)
    if (event.contentChanges.length > 0 &&
        !event.contentChanges.every(change => change.text === '\n' || change.text === '\r\n')) {
      const documentKey = editor.document.uri.toString();
      emptyLineCounter[documentKey] = 0;
    }
  });

  // Add the key binding for Enter within doc blocks
  context.subscriptions.push(
    vscode.workspace.onDidOpenTextDocument(doc => {
      emptyLineCounter[doc.uri.toString()] = 0;
    }),
    vscode.workspace.onDidCloseTextDocument(doc => {
      delete emptyLineCounter[doc.uri.toString()];
    }),
    disposable,
    typeDisposable
  );
}

/**
 * Handles the Enter key press within doc blocks
 * @returns {Thenable} - A promise that resolves after handling the key
 */
async function handleEnterKey() {
  const editor = vscode.window.activeTextEditor;

  if (!editor)
    return vscode.commands.executeCommand('default:type', { text: '\n' });

	const { document, selection } = editor,
		position = selection.active,
		documentKey = document.uri.toString();

  // Get enhanced context information
  const context = await getDocumentContext(position);

  // Get the language-specific comment format
  const format = commentFormats.getFormatForLanguage(context.languageId);
  if (!format) {
    // Language not supported, use default Enter behavior
    return vscode.commands.executeCommand('default:type', { text: '\n' });
  }

  // Use the more accurate context detection
  if (!context.isInDocBlock) {
    // Not in a doc block, use default Enter behavior
    return vscode.commands.executeCommand('default:type', { text: '\n' });
  }

  // Get the current line
  const line = document.lineAt(position.line);
  const lineText = line.text;

	const leadingLine = lineText.indexOf(format.blockStart)
	const contentLine = lineText.indexOf(format.blockPrefix)
	const trailingLine = lineText.indexOf(format.blockEnd)
	const index =
		~leadingLine ? leadingLine :
		~contentLine ? contentLine :
		~trailingLine ? trailingLine : -1;

	if (format.multiLine) {
		const endOfComment = trailingLine + format.blockEnd.length

		if (~trailingLine && (position.character >= endOfComment)) {
			return vscode.commands.executeCommand('default:type', { text: '\n' });
		}
	}

	if (!~index) {
		// Not in a doc block, use default Enter behavior
		emptyLineCounter[documentKey] = 0;
		return vscode.commands.executeCommand('default:type', { text: '\n' });
	}

	context.indentation = lineText.substring(0, index)

	return continueDocBlock(editor, format, context.indentation);
}

/**
 * Determines if the current cursor position is within a doc block
 * @param {vscode.TextDocument} document - The current document
 * @param {vscode.Position} position - The cursor position
 * @param {object} format - The language's comment format
 * @returns {boolean} - True if the position is in a doc block
 */
function isPositionInDocBlock(document, position, format) {
  // Simple implementation: check if the current line has doc block formatting
  const line = document.lineAt(position.line);
  const lineText = line.text.trim();

  // Check if this line is part of a doc block
  if (commentFormats.isDocBlockLine(lineText, format)) {
    return true;
  }

  // For multi-line formats, we need to check if we're inside a block
  if (format.multiLine) {
    // Look for a block start before this position
    let startLine = position.line;
    while (startLine >= 0) {
      const currentLine = document.lineAt(startLine).text.trim();
      if (commentFormats.isDocBlockStart(currentLine, format)) {
        // Now look for an end after the start but before current position
        let endLine = startLine + 1;
        while (endLine < position.line) {
          const endLineText = document.lineAt(endLine).text.trim();
          if (commentFormats.isDocBlockEnd(endLineText, format)) {
            return false; // We found an end before our position
          }
          endLine++;
        }
        return true; // Found a start with no end before us
      } else if (commentFormats.isDocBlockEnd(currentLine, format)) {
        return false; // Found an end before finding a start
      }
      startLine--;
    }
  }

  return false;
}

/**
 * Continue a doc block by inserting a new line with appropriate formatting
 * @param {vscode.TextEditor} editor - The active text editor
 * @param {object} format - The language's comment format
 * @param {string} indentation - The indentation to use
 * @returns {Thenable} - A promise that resolves after the edit
 */
async function continueDocBlock(editor, format, indentation) {
	let addLine = true

  return editor.edit(editBuilder => {
    const position = editor.selection.active;
		const lines = editor.document.getText().split('\n')

		if (lines[position.line].length == position.character)
			addLine = false

		const suffix = addLine ? '\n' : '';

    // Add a new line with the doc block prefix
    editBuilder.insert(
      position,
      `\n${indentation}${format.blockPrefix}${suffix}`
    );
  }).then(() => {
    // Move the cursor to the end of the inserted text
    const newPosition = editor.selection.active;

		if (addLine) {
			const lines = editor.document.getText().split('\n');

			newPosition.c = newPosition.line = newPosition.c - 1
			newPosition.e = newPosition.character = lines[newPosition.c].length
		}

    editor.selection = new vscode.Selection(newPosition, newPosition);
	})
}

/**
 * Deactivate the extension
 */
function deactivate() {
  // Clean up resources
  Object.keys(emptyLineCounter).forEach(key => {
    delete emptyLineCounter[key];
  });
}

/**
 * Gets detailed context information about the current cursor position
 * @param {vscode.TextDocument} document - The current document
 * @param {vscode.Position} position - The cursor position
 * @returns {Promise<object>} - Detailed context information
 */
async function getDocumentContext(positionOrLine, character) {
	let position = positionOrLine;

	if (isFinite(positionOrLine) && isFinite(character)) {
		position = new vscode.Position(positionOrLine, character)
	}

  // Get document content information
	const editor = vscode.window.activeTextEditor;
	const document = editor.document;

  const line = document.lineAt(position.line);
  const lineText = line.text;
  const indentation = lineText.match(/^\s*/)[0];

  // Try to determine if we're in a documentation block using token types
  let isInDocBlock = false;
	let docLineType = 'none';
	let docLineBlock = null;

  try {
    // Get token information at cursor position (requires VSCode 1.52+)
    const tokenTypes = await vscode.commands.executeCommand(
      'vscode.executeScopeProvider',
      document.uri,
      position
    );

    // Check if any token scope indicates we're in a documentation block
    isInDocBlock = tokenTypes?.some?.(scope =>
      scope.includes('comment.block.documentation') ||
      scope.includes('comment.line.documentation')
    );
  }
	catch {
    // Fallback to our basic text-based detection if token approach fails
    console.log('Token-based detection failed, falling back to text analysis');

    // Get the language's comment format
		const format = commentFormats.getFormatForLanguage(document.languageId);
		const { blockStart, blockPrefix, blockEnd } = format ?? { }

		const iLeading = lineText.indexOf(blockStart)
		const iContent = lineText.indexOf(blockPrefix)
		const iTrailing = lineText.indexOf(blockEnd)

		let index;
		({ index, type: docLineType, format: currentFormat } =
			~iLeading ? { index: iLeading, type: 'leading', format: blockStart } :
			~iContent ? { index: iContent, type: 'content', format: blockPrefix } :
			~iTrailing ? { index: iTrailing, type: 'trailing', format: blockEnd } :
		{ index: -1, type: 'none' });

		if (!format || !~index)
			isInDocBlock = false

		else if (format.multiLine) {
			const endOfComment = iTrailing + format.blockEnd.length

			if (~iTrailing && (position.character >= endOfComment)) {
				isInDocBlock = false
			}
		}

		else {
			isInDocBlock = true
			docLineBlock = new vscode.Selection(
				new vscode.Position(position.line, index),
				new vscode.Position(position.line, index + currentFormat.length),
			)
		}
  }


  // Try to determine what we're documenting (function, class, etc.)
  let documentationTarget = null;
  try {
    // Get symbols in the document
    const symbols = await vscode.commands.executeCommand(
      'vscode.executeDocumentSymbolProvider',
      document.uri
    );

    if (symbols?.length) {
      // Find closest symbol after our position (what we're likely documenting)
      const nextLinePosition = new vscode.Position(position.line + 1, 0);
      const relevantSymbols = symbols.filter(symbol =>
        symbol.range.contains(nextLinePosition) ||
        symbol.range.start.line === position.line + 1
      );

      if (relevantSymbols.length > 0) {
        // Sort by proximity to our position
        relevantSymbols.sort((a, b) =>
          a.range.start.line - b.range.start.line
        );

        documentationTarget = {
          type: relevantSymbols[0].kind,
          name: relevantSymbols[0].name,
          detail: relevantSymbols[0].detail || null,
          range: relevantSymbols[0].range
        };
      }
    }
  } catch (error) {
    console.log('Symbol detection failed', error);
    // Continue without symbol information
  }

  return {
    isInDocBlock,
    indentation,
    documentationTarget,
    languageId: document.languageId,
    position,
		docLineType,
		docLineBlock,
  };
}

module.exports = {
  activate,
  deactivate
};