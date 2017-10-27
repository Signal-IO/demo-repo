'use babel';

/***
 * A simple class to buffer strings.
 *
 *  This class was developed as it is the simplest and one of the more speedy
 *  implementations of a string buffer out there. By using the indexing method
 *  in adding characters to an array, we achieve hundreds of milliseconds
 *  better speed than a traditional concat call.
 **/
export default class StringBuffer {

  /***
   * StringBuffer constructor.
   **/
  constructor() {
    this.buffer = [];
    this.index = 0;
  }

  /***
   * append()
   *
   *  str: The string to append on the end of the buffer.
   **/
  append(str) {
    this.buffer[this.index] = str;
    this.index += 1;
    return this;
  }

  /***
   * toString()
   **/
  toString() {
    return this.buffer.join('');
  }

  /***
   * getCurrentIndex()
   **/
  getCurrentIndex() {
    return this.index;
  }

  /***
   * getCurrentChar()
   **/
  getCurrentChar() {
    if (this.index > 0) {
      return this.buffer[this.index - 1];
    } else {
      return '';
    }
  }

  /***
   * empty()
   **/
  empty() {
    let currentBufferContents = this.toString();

    this.buffer = [];
    this.index = 0;

    return currentBufferContents;
  }
}
