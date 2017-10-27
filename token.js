'use babel';

/***
 * A simple class to store and manage a token.
 **/
export default class Token {

  /***
   * Token constructor.
   *
   *  type: The type of the token being created.
   *  value: The value of the token.
   **/
  constructor(type, value, isOpeningItem=null, startIndex=-1) {
    this.type = type;
    this.value = value;
    this.isOpeningItem = isOpeningItem;
    this.startIndex = startIndex;
  }

  /***
   * getType()
   **/
  getType() {
    return this.type;
  }

  /***
   * setType()
   *
   *  type: The new type to set this token to.
   **/
  setType(type) {
    this.type = type;
  }

  /***
   * getValue()
   **/
  getValue() {
    return this.value;
  }

  /***
   * getStartIndex()
   **/
  getStartIndex() {
    return this.startIndex;
  }

  /***
   * getEndIndex()
   **/
  getEndIndex() {
    return this.startIndex + this.value.length;
  }

  /***
   * setAsOpeningItem()
   *
   *  If this is a bracket, parenthesis or quotation, set it as a opening item.
   **/
  setAsOpeningItem() {
    this.isOpeningItem = true;
  }

  /***
   * setAsClosingItem()
   *
   *  If this is a bracket, parenthesis or quotation, set it as a closing item.
   **/
  setAsClosingItem() {
    this.isOpeningItem = false;
  }

  /***
   * isOpeningItem()
   **/
  isOpeningItem() {
    if (this.isOpeningItem === null) {
      return this.isOpeningItem;
    }
    return (this.isOpeningItem === true);
  }

  /***
   * isClosingItem()
   **/
  isClosingItem() {
    if (this.isOpeningItem === null) {
      return this.isOpeningItem;
    }
    return (this.isOpeningItem === false)
  }

  /***
   * matches()
   *
   *  tkn: The type of token to match against.
   **/
  isType(tkn) {
    return (this.getType() === tkn);
  }

  /***
   * The following are tests for different types of tokens.
   **/
  static isBoolean = function(str) {
    const keywords = 'true|false';

    return keywords.indexOf(str) !== -1;
  }
  static isCharacter = function(ch) { return /[a-z_$]/i.test(ch) };
  static isClosingBlockComment = function(str) { return str === '*/' };
  static isComma = function(ch) { return (ch === ',') };
  static isDot = function(ch) { return (ch === '.') };
  static isNumber = function(ch) { return /\d/.test(ch) };
  static isLeftCurlyBracket = function(ch) { return (ch === '{') };
  static isLeftParenthesis = function(ch) { return (ch === '(') };
  static isLeftSquareBracket = function(ch) { return (ch === '[') };
  static isLineComment = function(str) { return str === '//' };
  static isOpeningBlockComment = function(str) { return str === '/*' };
  static isOperator = function(ch) { return /\+|-|\*|\/|\^|\=/.test(ch) };
  static isReservedKeyword = function(str) {
    const keywords = 'do|if|in|for|let|new|try|var|case|else|enum|eval|null|this|void|with|break|catch|class|const|super|throw|while|yield|delete|export|import|public|return|static|switch|typeof|default|extends|finally|package|private|continue|debugger|arguments|interface|protected|implements|function|instanceof';

    return keywords.indexOf(str) !== -1;
  };
  static isRightCurlyBracket = function(ch) { return (ch === '}') };
  static isRightParenthesis = function(ch) { return (ch === ')') };
  static isRightSquareBracket = function(ch) { return (ch === ']') };
  static isSemicolon = function(ch) { return (ch === ';') };
  static isSingleQuote = function(ch) { return (ch === "'") };
  static isDoubleQuote = function(ch) { return (ch === '"')}
  static isWhitespace = function(ch) { return /\s+/.test(ch) };
}
