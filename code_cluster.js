'use babel';

/***
 * A simple class to store and manage code clusters.
 **/
export default class CodeCluster {

  /***
   * CodeCluster constructor.
   **/
  constructor(type='', tokens=[], originalString='') {
    this.type = type;
    this.tokens = tokens;
    this.originalString = originalString;
  }

  /***
   * getType()
   *
   *  Return the type of the CodeCluster.
   **/
  getType() {
    return this.type;
  }

  /***
   * setType()
   *
   *  Set the type of the CodeCluster.
   *
   *    type: A string representing the type of the Code Cluster.
   **/
  setType(type) {
    this.type = type;
  }

  /***
   * getTokens()
   *
   *  Return the tokens of the CodeCluster.
   **/
  getTokens() {
    return this.tokens;
  }

  /***
   * setTokens()
   *
   *  Set the tokens for the CodeCluster.
   *
   *    tokens: An array of tokens.
   **/
  setTokens(type) {
    this.type = type;
  }

  /***
   * toString()
   **/
  toString() {
    let buffer = '';
    let startIndex = this.tokens[0].getStartIndex();
    let endIndex = this.tokens.slice(-1)[0].getEndIndex() + 1;

    return this.originalString.slice(startIndex, endIndex);
  }

  /***
   * isSimilarTo()
   *
   *  Tests for similarity by comparing the type of this CodeCluster against
   *  the CodeCluster that's been passed in as a parameter.
   *
   *    cluster:  The CodeCluster to test against.
   **/
  isSimilarTo(cluster) {
    let r_quotient = 0;
    let r_coefficient = 0;

    // Exact match...
    if (this.type === cluster.getType() && this.getTokens().length === cluster.getTokens().length) {
      r_quotient = .99;
    } else if (this.type === cluster.getType()) {
      r_coefficient = .50;
      r_quotient = r_coefficient - (Math.abs(this.getTokens().length - cluster.getTokens().length) / cluster.getTokens().length);
    } else {
      r_quotient = .01;
    }
    return r_coefficient + r_quotient;
  }
}
