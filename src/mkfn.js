"use strict";

const acorn  = require("acorn");

// Check if this is expression is valid and if maybe a magic return should be inserted, i.e. something like `$` or `$ + 1`
function validate(src) {
  try { // first try to parse with `return (...)`
    acorn.parse('function a(){return (' + src + ')}');
    return true; // if this parses then we definitely should add a magic return

  } catch (e) { // if it fails chances are src has some chars in it like `;`. Maybe it is `var a = $; return a`
    try { // so lets try without the parens
      const fullParse = acorn.parse('function a(){return ' + src + '}');

      // ok that worked, but did we create unreachable code? Better check that there is only one return expression
      const srcStatements = fullParse.body[0].body.body;
      return srcStatements.length === 1 && srcStatements[0].type === 'ReturnStatement';

    } catch (e) { // that failed... let's see if the vanilla src is parsable
      try {
        const fullParse = acorn.parse('function a(){' + src + '}');
        const srcStatements = fullParse.body[0].body.body;

        if (srcStatements.length === 1 && srcStatements[0].type === 'BlockStatement') {
          // Oh dear... looks like we have a top level block statement.
          // That is technically ok `function a(){{ a: 1; b: 2 }}` is valid JS (a and b are labels)
          // But I'm willing to bet that this is not what the user intended, they were probably going for { a: 1, b: 2 }.
          // Lets disallow this to save on confusion
          console.log('Looks like you have a top level block statement in your code.');
          console.log('Are you sure that is wht you want?');
          console.log('Maybe there is a `;` that should be a `,`?');
          process.exit(3);
        }

        return false;
      } catch (e) {
        // Well nothing is parsable so try to make a meaning full error
        console.log(e.message);
        process.exit(3);
      }
    }
  }
}

module.exports = function (src) {
  const needsMagicReturn = validate(src);
  if (needsMagicReturn) {
    src = 'return ' + src;
  }

  let fn;
  try {
    fn = new Function('$', '_$', 'i', src);
  } catch (e) {
    console.log(e.message);
    process.exit(3);
  }
  return fn;
};
