# Doc Block Helper

A VSCode extension that makes writing documentation blocks easier by automatically continuing comment blocks and managing indentation.

## Features

- Automatically continues documentation comment blocks when you press Enter
- Maintains proper indentation and comment prefixes on new lines
- Intelligently closes doc blocks after consecutive empty lines
- Supports various documentation formats (JSDoc, TSDoc, Swift docs, DoxyGen, JavaDoc, etc.)
- Detects context to generate appropriate documentation templates
- Supports nested indentation and markdown formatting within doc blocks

## Installation

You can install this extension through the VSCode Marketplace:

1. Open VSCode
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Doc Block Helper"
4. Click Install

## Supported Languages

The extension currently supports the following languages and their documentation styles:

| Language | Documentation Format |
|----------|---------------------|
| JavaScript | JSDoc (/** ... */) |
| TypeScript | TSDoc (/** ... */) |
| Swift | Triple-slash (///) |
| Objective-C | JavaDoc-style (/** ... */) |
| C/C++ | DoxyGen (/** ... */ or /// or //!) |
| Java | JavaDoc (/** ... */) |
| Python | Docstrings (""" ... """) |

## How It Works

When you're inside a documentation block and press Enter:

1. **First Enter**: Continues the block with proper indentation and comment prefix
2. **Second Empty Enter**: Adds another empty line with proper indentation and comment prefix
3. **Third Empty Enter**: Automatically closes the documentation block (for multi-line formats)

Additionally, the extension can detect what you're documenting (function, class, variable) and generate appropriate documentation templates.

## Usage Examples

### JavaScript/TypeScript (JSDoc/TSDoc)

Start typing:
```javascript
/**
_
```
(Where _ is your cursor)

Press Enter, and it becomes:
```javascript
/**
 * _
```

Type a description and press Enter:
```javascript
/**
 * A function that does something
 * _
```

Press Enter twice without typing, and it automatically closes:
```javascript
/**
 * A function that does something
 */
_
```

### Swift Documentation

Start typing:
```swift
///
_
```

Press Enter, and it continues:
```swift
///
/// _
```

## Configuration

This extension can be customized through VSCode settings:

* `docBlockHelper.useEnhancedDetection`: Use token-based detection for documentation blocks (default: true)
* `docBlockHelper.insertIntelligentTemplates`: Insert smart templates based on what's being documented (default: true)
* `docBlockHelper.emptyLinesBeforeClosing`: Number of empty lines before automatically closing a doc block (default: 2)

## Intelligent Templates

When enabled, the extension can detect what you're documenting and insert appropriate templates:

### For Functions

```javascript
/**
 * Describes the myFunction function
 * @param {*} param1 - Description
 * @param {*} param2 - Description
 * @returns {*} - Description
 */
function myFunction(param1, param2) {
```

### For Classes

```javascript
/**
 * Represents the MyClass class
 */
class MyClass {
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Inspired by the documentation formatting capabilities of various IDEs
- Built with VSCode Extension API
