'use babel';

import CONSTANT from './constants.js';
import MAPPINGS from './mappings.js';

import CodeCluster from './code_cluster.js';

/***
 * The Parser Class. This handles the pattern matching.
 **/
export default class Parser {

  /***
   * Parser constructor.
   *
   *  tokenizer: The tokenizer object.
   **/
  constructor(tokenizer) {
    this.tokenizer = tokenizer;
    this.tokens = tokenizer.getTokens();
    this.matches = [];
    this.matchTypes = [];
    this.codeClusters = [];
    // console.log('Parser: [constructor]');
  }

  /***
   * execute()
   *
   *  A function that does the pattern matching against the tokens.
   **/
  execute() {
    // console.log('Parser: [execute] - Started [' + this.tokens.length + ' tokens]');

    // Iterate throught the tokens.
    for (let token_index = 0; token_index < this.tokens.length; token_index++) {
      let current_token = this.tokens[token_index];

      // console.log('------------------------------------------');
      // console.log('Parser: [execute] - Current Token: ' + current_token.getType() + ' | ' + current_token.getValue());
      // console.log('Parser: [execute] - Current Token Index: ' + token_index);

      // Iterate through each pattern in the mappings.
      for (let patterns_index = 0; patterns_index < MAPPINGS.PATTERNS.length; patterns_index++) {
        let pattern = MAPPINGS.PATTERNS[patterns_index]
        let pattern_match = false;
        let matching_tokens = [];
        let total_brackets = 0;
        let total_curly_brackets = 0;
        let total_parenthesis = 0;
        let opening_block = null;
        // console.dir(pattern);
        // console.log('Parser: [execute] - New Test Pattern: ' + MAPPINGS.RESULTS[patterns_index]);

        // Iterate through each element of the pattern if the first element of
        // the pattern matches the current token.

        // Move forward in this.tokens to test against the pattern tokens.
        let token_offset = 0;
        let pattern_index = 0;
        while ( (token_index + token_offset < this.tokens.length) && (pattern_index < pattern.length) ) {
        //for (let pattern_index = 0; token_index + token_offset < this.tokens.length; pattern_index++) {
          // console.log('--- BEGINNING');
          // console.log('pattern_index = ' + pattern_index);
          // console.log('token_offset = ' + token_offset);
          // console.log('total_curly_brackets = ' + total_curly_brackets);
          // console.log('total_parenthesis = ' + total_parenthesis);
          // console.log('--- BEGINNING');

          let pattern_token = pattern[pattern_index];
          let current_subtoken = this.tokens[token_index + token_offset];
          // console.log('Parser: [execute] - Token Type: ' + current_subtoken.getType() + ' | Token Value: ' + current_subtoken.getValue() + ' | Pattern Token: ' + pattern_token);

          // Handle the tokens.
          if (total_curly_brackets > 0 || total_parenthesis > 0 || total_brackets > 0) {
            matching_tokens.push(current_subtoken);
          } else if (current_subtoken.isType(pattern_token)) {
            // console.log('Parser: [execute] - Pattern Token: SUCCESS (' + pattern_match + ') - ' + pattern_token);
            matching_tokens.push(current_subtoken);
          } else {
            pattern_match = false;
            // console.log('Parser: [execute] - Pattern Token: FAILED - (' + pattern_match + ') ' + pattern_token);
            break;
          }

          // Keep count of block characters...
          if (current_subtoken.isType(CONSTANT.TOKEN_LEFT_CURLY_BRACKET)) {
            total_curly_brackets++;
            // console.log('Parser: [execute] - Incrementing Curly Brackets: ' + total_curly_brackets);
          } else if (current_subtoken.isType(CONSTANT.TOKEN_RIGHT_CURLY_BRACKET)) {
            total_curly_brackets--;
            // console.log('Parser: [execute] - Decrementing Curly Brackets: ' + total_curly_brackets);
          } else if (current_subtoken.isType(CONSTANT.TOKEN_LEFT_PARENTHESIS)) {
            total_parenthesis++;
            // console.log('Parser: [execute] - Incrementing Parenthesis: ' + total_parenthesis);
          } else if (current_subtoken.isType(CONSTANT.TOKEN_RIGHT_PARENTHESIS)) {
            total_parenthesis--;
            // console.log('Parser: [execute] - Decrementing Parenthesis: ' + total_parenthesis);
          } else if (current_subtoken.isType(CONSTANT.TOKEN_LEFT_BRACKET)) {
            total_brackets++;
          } else if (current_subtoken.isType(CONSTANT.TOKEN_RIGHT_BRACKET)) {
            total_brackets--;
          }

          // Conditions to increase pattern_index...
          if (!opening_block && pattern_token === CONSTANT.TOKEN_LEFT_PARENTHESIS && current_subtoken.isType(CONSTANT.TOKEN_LEFT_PARENTHESIS)) {
            // console.log('Parser: [execute] - Block opened: ' + total_parenthesis);
            opening_block = pattern_token;
            pattern_index++;
          } else if (!opening_block && pattern_token === CONSTANT.TOKEN_LEFT_CURLY_BRACKET && current_subtoken.isType(CONSTANT.TOKEN_LEFT_CURLY_BRACKET)) {
            // console.log('Parser: [execute] - Block opened: ' + total_curly_brackets);
            opening_block = pattern_token;
            pattern_index++;
          } else if (!opening_block && pattern_token === CONSTANT.TOKEN_LEFT_BRACKET && current_subtoken.isType(CONSTANT.TOKEN_LEFT_BRACKET)) {
            opening_block = pattern_token;
            pattern_index++;
          } else if (opening_block === CONSTANT.TOKEN_LEFT_PARENTHESIS &&
                     current_subtoken.isType(CONSTANT.TOKEN_RIGHT_PARENTHESIS) &&
                     total_parenthesis === 0) {
            opening_block = null;
            pattern_index++;
            // console.log('Parser: [execute] - Parenthesis block closed: ' + total_parenthesis);
          } else if (opening_block === CONSTANT.TOKEN_LEFT_CURLY_BRACKET &&
                     current_subtoken.isType(CONSTANT.TOKEN_RIGHT_CURLY_BRACKET) &&
                     total_curly_brackets === 0) {
            opening_block = null;
            pattern_index++;
            // console.log('Parser: [execute] - Curly bracket block closed: ' + total_curly_brackets);
          } else if (opening_block === CONSTANT.TOKEN_LEFT_BRACKET &&
                     current_subtoken.isType(CONSTANT.TOKEN_RIGHT_BRACKET) &&
                     total_brackets === 0) {
            opening_block = null;
            pattern_index++;
            // console.log('Parser: [execute] - Curly bracket block closed: ' + total_curly_brackets);
          } else if (!opening_block) {
            pattern_index++
          }

          // Increase the token offset regardless of what happens above...
          token_offset++;
          pattern_match = pattern_index === pattern.length;

          // console.log('--- ENDING');
          // console.log('pattern_index = ' + pattern_index);
          // console.log('token_offset = ' + token_offset);
          // console.log('total_curly_brackets = ' + total_curly_brackets);
          // console.log('total_parenthesis = ' + total_parenthesis);
          // console.log('--- ENDING');

          if (pattern_match) {
            // console.log('Parser: [execute] - Got to the end: Match must have been found.');
            break;
          }
        }

        // Test for a pattern match and push on to matches array if exists.
        if (pattern_match) {
          this.matches.push(matching_tokens);
          this.matchTypes.push(MAPPINGS.RESULTS[patterns_index]);
          this.codeClusters.push(new CodeCluster(MAPPINGS.RESULTS[patterns_index], matching_tokens, this.tokenizer.getOriginalString()));

          console.log('Parser: [execute] - MATCH FOUND AT: ' + token_index);
          console.log('Parser: [execute] - PATTERN: ' + MAPPINGS.RESULTS[patterns_index] + ' [index: ' + patterns_index + ']');
        }
      }
    }
  }

  /***
   * getCodeClusters()
   *
   *  A function that returns all the CodeClusters.
   **/
  getCodeClusters() {
    return this.codeClusters;
  }
}
