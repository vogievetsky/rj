"use strict";

const fs = require('fs');
const path = require('path');
const split = require('split');
const cardinal = require('cardinal');
const shell = require('shelljs');
const _ = require('lodash');
const StreamConcat = require('stream-concat');
const JSONStream = require('JSONStream');
const argvParse = require('./argv');
const mkfn = require('./mkfn');

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
      'monochrome-output',
      'join-output',
      'filter'
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
      // f: "--from-file"
      // e: "--exit-status"
      s: "--slurp",
      R: "--raw-input",
      J: "--json-input",
      n: "--null-input",
      r: "--raw-output",
      p: "--parsable-output",
      c: "--compact-output",
      C: "--color-output",
      M: "--monochrome-output",
      j: "--join-output",
      i: "--in-place", // ToDo
      F: "--filter", // ToDo
      B: "--before", // ToDo
      A: "--after" // ToDo
    }
  });

  parsed = parsedRest.parsed;
  rest = parsedRest.rest;
} catch (e) {
  console.log(e.message);
  process.exit(2);
}

if (parsed['help']) {
  console.log(fs.readFileSync(path.resolve(__dirname, 'usage.txt'), 'utf-8').replace(/%v%/g, getVersion()));
  process.exit(0);
}

if (parsed['version']) {
  console.log(getVersion());
  process.exit(0);
}

(parsed['arg'] || []).forEach(([k, v]) => {
  global['$' + k] = v;
  global['_$' + k] = _(v);
});

(parsed['argjson'] || []).forEach(([k, v]) => {
  let pv;
  try {
    pv = JSON.parse(v);
  } catch (e) {
    console.error(`invalid JSON text passed to --argjson '${k}'`);
    process.exit(2);
  }
  global['$' + k] = pv;
  global['_$' + k] = _(pv);
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

let rawOutput = global._trj_mode_;
if (parsed['raw-output']) rawOutput = true;
if (parsed['parsable-output']) rawOutput = false;

let terminator = '\n';
if (parsed['join-output']) terminator = '';
const output = (str) => {
  process.stdout.write(str + terminator);
};

process.stdout.on("error", function(error) {
  if (error.code === "EPIPE" || error.errno === "EPIPE") {
    process.exit(0);
  }
});

global.emit = global.e = function(thing) {
  const thingType = typeof thing;
  if (thingType === 'undefined') return;
  if (thingType === 'string' && rawOutput) {
    output(thing);
  } else {
    let out = JSON.stringify(thing, null, indent);
    if (shouldColor) out = cardinal.highlight(out);
    output(out);
  }
};

global._ = _;
global.exec = shell.exec;

let fn = mkfn(rest[0] || '$');

let index = -1;
function proc(input) {
  index++;
  let value;
  try {
    value = fn(input, _(input), index);
  } catch (e) {
    console.error(e);
  }
  emit(value);
}

let jsonInput = !global._trj_mode_;
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
