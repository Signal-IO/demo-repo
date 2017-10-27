'use babel';

import CONSTANT from './constants.js';
import StringBuffer from './string_buffer';
import Token from './token';

/***
 * The Tokenization Class. This handles all the heavy lifting.
 **/
export default class Tokenize {

  /***
   * Tokenize constructor.
   *
   *  str: The string to tokenize.
   **/
  constructor(str) {
    this.original = str;
    this.tokens = [];
    this.buffer = new StringBuffer();

    // console.log('Tokenize: [constructor] ' + this.original);
  }

  /***
   * getOriginalString()
   **/
  getOriginalString() {
    return this.original;
  }

  /***
   * getTokens()
   **/
  getTokens() {
    return this.tokens;
  }

  /***
   * emptyBufferAs()
   *
   *  A function to grab the contents of the passed in buffer and set it
   *  as the specified token type.
   *
   *  buffer: The buffer to purge.
   *  token: The type of token to set the contents as.
   *  startIndex: The starting point in the code.
   *  endIndex: The ending point in the code.
   **/
  emptyBufferAs(buffer, token, startIndex) {
    this.tokens.push(new Token(token, buffer.empty(), null, startIndex));

    return this;
  }

  /***
   * execute()
   *
   *  A function that does the initial parsing of text to extract the initial
   *  tokens.
   **/
  execute() {
    let char, currentString, bufferIndex, lastChar;   // Current buffer info
    let lastToken;                                    // The last token saved
    let stringCaptureQuote = '';                      // Test for a string literal
    let commentCapture = '';                          // Text for comment

    for (var i = 0; i < this.original.length; i++) {
    //for (let char of this.getOriginalString()) { /* test */
      // Get the current buffer.
      char = this.original[i];

      currentString = this.buffer.toString();
      bufferIndex = this.buffer.getCurrentIndex();
      lastChar = this.buffer.getCurrentChar();
      lastToken = this.tokens.length > 0 ? this.tokens[this.tokens.length-1] : false;

      // Check for compound tokens.
      if (lastToken) {
        if ((lastToken.getValue() + char === '//') || (lastToken.getValue() + char === '/*')) {
          // Remove the last token and set currentString to add in the value of
          // the last token.
          // console.log('Tokenize: [execute] Checking for compound tokens - ' + currentString);
          lastChar = this.tokens.pop().getValue();
          currentString = lastChar + char;
        }
      }

      if (commentCapture || Token.isLineComment(currentString) ||
          Token.isOpeningBlockComment(currentString)) {

        // Comment buffer capture.

        if (!commentCapture) {
          // Start capturing the comment.
          // console.log('Tokenize: [execute] !commentCapture');
          commentCapture = currentString;
          this.buffer.append(lastChar) && this.buffer.append(char);
        } else if ((lastChar + char === '*/') ||
                   ((char === '\n' || char === '\r') && Token.isLineComment(commentCapture))) {
          // Empty the buffer for a comment.
          // console.log('Tokenize: [execute] Setting token as comment - ' + currentString);
          this.buffer.append(char);

          this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_COMMENT, i - this.buffer.getCurrentIndex());
          commentCapture = '';
        } else {
          // // console.log('Tokenize: [execute] Comment buffer append - ' + char);
          this.buffer.append(char);
        }
      } else if (stringCaptureQuote || Token.isSingleQuote(char) ||
                 Token.isDoubleQuote(char)) {
        // String literal buffer capture.
        // // console.log('Tokenize: [execute] String Literal Compilation - ' + char);

        this.buffer.append(char);

        if (!stringCaptureQuote) {
          // Start capturing the string.
          stringCaptureQuote = char;
        } else if (stringCaptureQuote === char && lastChar !== '\\') {
          // Empty the buffer for a string literal.
          // console.log('Tokenize: [execute] Setting token as string literal - ' + currentString);
          this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_STRING_LITERAL, i - this.buffer.getCurrentIndex());
          stringCaptureQuote = '';
        }
      } else if (!(Token.isNumber(char) || Token.isCharacter(char))) {
        // If there's a breaking character (ie – whitespace, semicolon, etc,
        // then we need to flush the buffer.

        // Clear out the contents of the buffer if a buffer exists.
        if (bufferIndex > 0) {
          if (Token.isDot(char)) {
            // Check for the special dot operator in combination w/ 'this' keyword.
            // console.log('Tokenize: [execute] Setting token as ' +
            //  (currentString === 'this' ? 'this' : 'variable') +
            //  ' - ' + currentString);
            this.emptyBufferAs(this.buffer,
              (currentString === 'this' ? CONSTANT.TOKEN_THIS : CONSTANT.TOKEN_VARIABLE),
              i - this.buffer.getCurrentIndex());
          } else if (Token.isReservedKeyword(currentString)) {
            // Check to see if this the contents of the buffer is a keyword.
            // console.log('Tokenize: [execute] Setting token as keyword - ' + currentString);
            this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_KEYWORD, i - this.buffer.getCurrentIndex());
          } else if (Token.isBoolean(currentString)) {
            // console.log('Tokenize: [execute] Setting token as boolean - ' + currentString);
            this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_BOOLEAN, i - this.buffer.getCurrentIndex());
          } else if (Token.isNumber(currentString)) {
            // console.log('Tokenize: [execute] Setting token as number - ' + currentString);
            this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_NUMBER, i - this.buffer.getCurrentIndex());
          } else if (Token.isLeftParenthesis(char)) {
            // console.log('Tokenize: [execute] Setting token as function name - ' + currentString);
            this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_FUNCTION_NAME, i - this.buffer.getCurrentIndex());
          } else if (Token.isRightParenthesis(char)) {
            // If we get here, then it's likely a variable.
            // console.log('Tokenize: [execute] Setting token as variable - ' + currentString);
            this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_VARIABLE, i - this.buffer.getCurrentIndex());
          } else if (lastToken && lastToken.type === CONSTANT.TOKEN_KEYWORD && lastToken.getValue() === 'class') {
            // console.log('Tokenize: [execute] Setting token as classname - ' + currentString);
            this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_CLASSNAME, i - this.buffer.getCurrentIndex());
          } else {
            // console.log('Tokenize: [execute] Setting token as unknown - ' + currentString);
            this.emptyBufferAs(this.buffer, CONSTANT.TOKEN_UNKNOWN, i - this.buffer.getCurrentIndex());
          }
        }

        // Understand what the initial character was.
        if (Token.isSemicolon(char)) {
          // console.log('Tokenize: [execute] Setting token as semicolon - ' + char);
          this.tokens.push(new Token(CONSTANT.TOKEN_SEMICOLON, char, null, i));
        } else if (Token.isLeftParenthesis(char) || Token.isRightParenthesis(char)) {
          // console.log('Tokenize: [execute] Setting token as parenthesis - ' + char);
          this.tokens.push(new Token((
            Token.isLeftParenthesis(char) ?
              CONSTANT.TOKEN_LEFT_PARENTHESIS :
              CONSTANT.TOKEN_RIGHT_PARENTHESIS),
            char, null, i));
        } else if (Token.isLeftCurlyBracket(char) || Token.isRightCurlyBracket(char)) {
          // console.log('Tokenize: [execute] Setting token as bracket - ' + char);
          this.tokens.push(new Token((
            Token.isLeftCurlyBracket(char) ?
              CONSTANT.TOKEN_LEFT_CURLY_BRACKET :
              CONSTANT.TOKEN_RIGHT_CURLY_BRACKET),
            char, null, i));
        } else if (Token.isSingleQuote(char) || Token.isDoubleQuote(char)) {
          // console.log('Tokenize: [execute] Setting token as quotation mark - ' + char);
          stringCaptureQuote = char;
          this.tokens.push(new Token(CONSTANT.TOKEN_QUOTATION_MARK, char, null, i));
        } else if (Token.isOperator(char)) {
          if (lastToken && lastToken.type === CONSTANT.TOKEN_UNKNOWN) {
            // console.log('Tokenize: [execute] Resetting prior token as variable - ' + char);
            // Go back and set an unknown token to a variable.
            this.tokens[this.tokens.length-1].setType(CONSTANT.TOKEN_VARIABLE);
          }
          // console.log('Tokenize: [execute] Setting token as operator - ' + char);
          this.tokens.push(new Token(CONSTANT.TOKEN_OPERATOR, char, null, i));
        } else if (Token.isDot(char)) {
          // Submit the dot separator as a token.
          // console.log('Tokenize: [execute] Setting token as dot - ' + char);
          this.tokens.push(new Token(CONSTANT.TOKEN_DOT_SEPARATOR, char, null, i));
        } else if (Token.isComma(char)) {
          // console.log('Tokenize: [execute] Setting token as comma - ' + char);
          this.tokens.push(new Token(CONSTANT.TOKEN_COMMA, char, null, i));
        }
      } else {
        // Append current character to the buffer and move on.
        this.buffer.append(char);
      }
    }
    return this.tokens;
  }
}
