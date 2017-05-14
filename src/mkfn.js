"use strict";

const vm = require("vm");
const acorn  = require("acorn");

module.exports = function (src, sandbox, context) {
  src = (src || '').trim();
  let fullParse;
  try {
    fullParse = acorn.parse(src);
  } catch (e) {
    // The user may have entered `{ a: 1, b: 2 }` lets add parenthesis
    const altSrc = '(' + src + ')';
    try {
      fullParse = acorn.parse(altSrc);
      src = altSrc; // Ok that worked so stick with the parenthesis
    } catch (e2) {
      // This is a genuine error, lets trow the first error
      throw e;
    }
  }

  if (fullParse.type !== 'Program' || !Array.isArray(fullParse.body)) {
    throw new Error('something went terribly wrong trying to parse the script, please file an issue.');
  }

  const body = fullParse.body;
  if (body.length === 0) {
    // Empty script they just mean '$'
    src = '$';
  } else if (body.length === 1 && body[0].type === 'BlockStatement') {
    // The user entered `{}` or `{ a: 1 }` lets add parenthesis
    src = '(' + src + ')';
  }

  if (src.endsWith(';')) src += 'undefined';

  const script = new vm.Script(src);

  return ($, _$, i) => {
    sandbox.$ = $;
    sandbox._$ = _$;
    sandbox.i = i;
    return script.runInContext(context);
  }
};
