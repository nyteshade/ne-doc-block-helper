/**
 * Comment format definitions for different languages and doc styles
 */
module.exports = {
  /**
   * Maps language IDs to comment format configurations
   * @type {Object.<string, CommentFormat>}
   */
  formats: {
    // JavaScript/TypeScript
    'javascript': {
      blockStart: '/**',
      blockPrefix: ' * ',
      blockEnd: ' */',
      inlinePrefix: '//',
      multiLine: true
    },
    'typescript': {
      blockStart: '/**',
      blockPrefix: ' * ',
      blockEnd: ' */',
      inlinePrefix: '//',
      multiLine: true
    },

    // Swift
    'swift': {
      blockStart: '///',
      blockPrefix: '/// ',
      blockEnd: null, // No explicit end for Swift-style comments
      inlinePrefix: '//',
      multiLine: false
    },

    // Objective-C
    'objective-c': {
      blockStart: '/**',
      blockPrefix: ' * ',
      blockEnd: ' */',
      inlinePrefix: '//',
      multiLine: true
    },

    // C/C++
    'c': {
      blockStart: '/**',
      blockPrefix: ' * ',
      blockEnd: ' */',
      inlinePrefix: '//',
      multiLine: true
    },
    'cpp': {
      blockStart: '/**',
      blockPrefix: ' * ',
      blockEnd: ' */',
      inlinePrefix: '//',
      multiLine: true
    },

    // Java
    'java': {
      blockStart: '/**',
      blockPrefix: ' * ',
      blockEnd: ' */',
      inlinePrefix: '//',
      multiLine: true
    },

    // Python
    'python': {
      blockStart: '"""',
      blockPrefix: '',
      blockEnd: '"""',
      inlinePrefix: '#',
      multiLine: true
    }
  },

  /**
   * Gets the comment format for a specific language
   * @param {string} languageId - The language identifier from VSCode
   * @returns {CommentFormat|null} - The comment format or null if not supported
   */
  getFormatForLanguage(languageId) {
    return this.formats[languageId] || null;
  },

  /**
   * Detect if a line is the start of a doc block
   * @param {string} line - The line of text to check
   * @param {CommentFormat} format - The comment format to check against
   * @returns {boolean} - True if the line starts a doc block
   */
  isDocBlockStart(line, format) {
    const trimmedLine = line.trim();
    return trimmedLine.startsWith(format.blockStart);
  },

  /**
   * Detect if a line is part of a doc block
   * @param {string} line - The line of text to check
   * @param {CommentFormat} format - The comment format to check against
   * @returns {boolean} - True if the line is part of a doc block
   */
  isDocBlockLine(line, format) {
    const trimmedLine = line.trim();
    return format.multiLine
      ? trimmedLine.startsWith(format.blockPrefix.trim()) || trimmedLine === format.blockStart || trimmedLine === format.blockEnd
      : trimmedLine.startsWith(format.blockStart);
  },

  /**
   * Detect if a line is the end of a doc block
   * @param {string} line - The line of text to check
   * @param {CommentFormat} format - The comment format to check against
   * @returns {boolean} - True if the line ends a doc block
   */
  isDocBlockEnd(line, format) {
    if (!format.blockEnd) return false;
    const trimmedLine = line.trim();
    return trimmedLine === format.blockEnd || trimmedLine.endsWith(format.blockEnd);
  },
};