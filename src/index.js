"use strict";

const fs = require('fs');
const split = require('split');
const cardinal = require('cardinal');
const shell = require('shelljs');
const CombinedStream = require('combined-stream2');
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
      'json-input',
      'null-input',
      'compact-output',
      'tab',
      'color-output',
      'monochrome-output'
    ],
    numbers: [
      'indent'
    ],
    twoArgs: [
      'arg'
    ],
    multiple: [
      'arg'
    ],
    shorthands: {
      "j": ["--json-input"],
      "n": ["--null-input"],
      "c": ["--compact-output"],
      "C": ["--color-output"],
      "M": ["--monochrome-output"]
    }
  });

  parsed = parsedRest.parsed;
  rest = parsedRest.rest;
} catch (e) {
  console.log(e.message);
  process.exit(2);
}

if (parsed['help']) {
  console.log(`rj - commandline JS multitool [version ${getVersion()}]`);
  console.log(`Usage: rj [options] <rj filter> [file...]`);
  console.log('Example: rj -j \'return _\' myfile.json');
  console.log('');
  process.exit(0);
}

if (parsed['version']) {
  console.log(getVersion());
  process.exit(0);
}

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

(parsed['arg'] || []).forEach(([k, v]) => global[k] = v);


global.emit = global.e = function(thing) {
  if (typeof thing === 'object') {
    let out = JSON.stringify(thing, null, indent);
    if (shouldColor) out = cardinal.highlight(out);
    console.log(out);
  } else {
    console.log(thing);
  }
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

let jsonInput = parsed['json-input'] || global._json_input_hack_;
if (parsed['null-input']) {
  proc(jsonInput ? null : '');
} else {
  let inputs = rest.slice(1);
  if (!inputs.length) inputs = ['-'];

  let inputStream = CombinedStream.create();
  inputs.forEach((input) => {
    if (input === '-') {
      inputStream.append(process.stdin);
    } else {
      inputStream.append(fs.createReadStream(input));
    }
  });

  if (jsonInput) {
    inputStream
      .pipe(JSONStream.parse())
      .on('data', proc);
  } else {
    inputStream
      .pipe(split())
      .on('data', proc);
  }
}
