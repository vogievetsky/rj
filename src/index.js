"use strict";

const fs = require('fs');
const path = require('path');
const split = require('split');
const cardinal = require('cardinal');
const shell = require('shelljs');
const StreamConcat = require('stream-concat');
const JSONStream = require('JSONStream');
const { argvParse } = require('./argv');
require('./prototype');

function getVersion() {
  return require('../package.json').version;
}

let parsed, rest;
try {
  const parsedRest = argvParse(process.argv.slice(2), {
    flags: [
      'help',
      'version',
      'slurp',
      'raw-input',
      'json-input',
      'null-input',
      'compact-output',
      'tab',
      'raw-output',
      'parsable-output',
      'color-output',
      'monochrome-output'
    ],
    numbers: [
      'indent'
    ],
    twoArgs: [
      'arg',
      'argjson'
    ],
    multiple: [
      'arg',
      'argjson'
    ],
    shorthands: {
      // a: "--ascii-output"
      // S: "--sort-keys"
      // j: "--join-output"
      // e: "--exit-status"
      s: "--slurp",
      R: "--raw-input",
      J: "--json-input",
      n: "--null-input",
      r: "--raw-output",
      p: "--parsable-output",
      c: "--compact-output",
      C: "--color-output",
      M: "--monochrome-output"
    }
  });

  parsed = parsedRest.parsed;
  rest = parsedRest.rest;
} catch (e) {
  console.log(e.message);
  process.exit(2);
}

if (parsed['help']) {
  console.log(fs.readFileSync(path.resolve(__dirname, 'usage.txt'), 'utf-8').replace(/%v/g, getVersion()));
  process.exit(0);
}

if (parsed['version']) {
  console.log(getVersion());
  process.exit(0);
}

(parsed['arg'] || []).forEach(([k, v]) => {
  global['$' + k] = v
});

(parsed['argjson'] || []).forEach(([k, v]) => {
  try {
    global['$' + k] = JSON.parse(v);
  } catch (e) {
    console.error(`invalid JSON text passed to --argjson '${k}'`);
    process.exit(2);
  }
});

// === Output =============================

let indent = 2;
if (parsed['compact-output']) {
  indent = null;
} else if (parsed['tab']) {
  indent = '\t';
} else if (parsed['indent']) {
  indent = parsed['indent'];
}

let shouldColor = process.stdout.isTTY;
if (parsed['color-output']) shouldColor = true;
if (parsed['monochrome-output']) shouldColor = false;

let rawOutput = !global._full_jq_;
if (parsed['raw-output']) rawOutput = true;
if (parsed['parsable-output']) rawOutput = false;

global.emit = global.e = function(thing) {
  if (typeof thing === 'string' && rawOutput) {
    console.log(thing);
  } else {
    let out = JSON.stringify(thing, null, indent);
    if (shouldColor) out = cardinal.highlight(out);
    console.log(out);
  }
  return thing;
};

global.exec = shell.exec;

if (!rest.length) {
  console.log(`expecting a filter to be provided`);
  process.exit(2);
}

let fn;
try {
  fn = new Function('_', 'i', rest[0]);
} catch (e) {
  console.log(e.message);
  process.exit(3);
}

let index = -1;
function proc(line) {
  index++;
  let value;
  try {
    value = fn(line, index);
  } catch (e) {
    console.error(e);
  }
  if (typeof value === 'undefined') return;
  emit(value);
}

let jsonInput = global._full_jq_;
if (parsed['json-input']) jsonInput = true;
if (parsed['raw-input']) jsonInput = false;

if (parsed['null-input']) {
  proc(jsonInput ? null : '');
} else {
  let inputs = rest.slice(1);
  if (!inputs.length) inputs = ['-'];

  let inputIndex = 0;
  let nextStream = function() {
    if (inputIndex === inputs.length) return null;
    let input = inputs[inputIndex++];
    if (input === '-') {
      return process.stdin;
    } else {
      return fs.createReadStream(input);
    }
  };

  let inputStream = new StreamConcat(nextStream);

  let thingStream = jsonInput ? inputStream.pipe(JSONStream.parse()) : inputStream.pipe(split());

  thingStream
    .on('data', proc)
    .on('error', (e) => {
      console.error(`There was an error: ${e.message}`);
    });
}
