"use strict";

const hasOwnProp = require('has-own-prop');

module.exports = function(args, options) {
  const flags = options.flags || [];
  const strings = options.strings || [];
  const numbers = options.numbers || [];
  const twoArgs = options.twoArgs || [];
  const multiple = options.multiple || [];
  const shorthands = options.shorthands || {};

  let parsed = {};
  function addParsed(k, v) {
    if (multiple.includes(k)) {
      if (!hasOwnProp(parsed, k)) parsed[k] = [];
      parsed[k].push(v);
    } else {
      parsed[k] = v;
    }
  }

  let rest = [];

  while (args.length) {
    let head = args[0];
    let tail = args.slice(1);

    let m;
    if (m = head.match(/^-([a-z])([a-z]*)$/i)) { // Single letter
      let letter = m[1];
      let rest = m[2];
      if (!hasOwnProp(shorthands, letter)) throw new Error(`Unknown option -${letter}`);
      args = shorthands[letter].split(/ +/).concat(
        rest ? [`-${rest}`] : [], // Keep rest if there is some
        tail
      );

    } else if (head === '--') {
      rest = rest.concat(tail);
      args = [];

    } else if (m = head.match(/^--(.+)$/i)) {
      let arg = m[1];
      if (flags.includes(arg)) {
        addParsed(arg, true);
        args = tail; // Next

      } else if (strings) {
        if (!tail.length) throw new Error(`option --${arg} must have a parameter`);
        addParsed(arg, tail[0]);
        args = tail.slice(1); // Next

      } else if (numbers.includes(arg)) {
        if (!tail.length) throw new Error(`option --${arg} must have a numeric parameter`);
        let n = Number(tail[0]);
        if (isNaN(n)) throw new Error(`option --${arg} must have a numeric parameter is '${tail[0]}'`);
        addParsed(arg, n);
        args = tail.slice(1); // Next

      } else if (twoArgs.includes(arg)) {
        if (tail.length < 2) throw new Error(`option --${arg} must have a two parameters`);
        addParsed(arg, tail.slice(0, 2));
        args = tail.slice(2); // Next

      } else {
        throw new Error(`unknown option --${arg}`);

      }

    } else {
      rest.push(head);
      args = tail;

    }

  }

  return {
    parsed,
    rest
  };
};
