"use strict";

const fs = require('fs');
const path = require('path');
const readline = require("readline");
const cardinal = require('cardinal');
const shell = require('shelljs');
const _ = require('lodash');
const StreamConcat = require('stream-concat');
const JSONStream = require('JSONStream');
const csv = require('csv-streamify');
const sortedObject = require("sorted-object");
const argvParse = require('./argv');
const mkfn = require('./mkfn');

function getVersion() {
  return require('../package.json').version;
}

const POSSIBLE_INPUT_TYPES = ['null', 'raw', 'json', 'csv', 'tsv', 'wdlog-raw', 'wdlog'];

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
      'has-header',
      'compact-output',
      'tab',
      'sort-keys',
      'raw-output',
      'parsable-output',
      'color-output',
      'monochrome-output',
      'join-output',
      'print0',
      'filter'
    ],
    strings: [
      'input',
      'where',
      'group-by'
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
      h: "--help",
      // a: "--ascii-output"
      S: "--sort-keys",
      // f: "--from-file"
      // e: "--exit-status"
      s: "--slurp",
      R: "--raw-input",
      J: "--json-input",
      n: "--null-input",
      I: "--input",
      H: "--has-header",
      r: "--raw-output",
      p: "--parsable-output",
      c: "--compact-output",
      C: "--color-output",
      M: "--monochrome-output",
      j: "--join-output",
      i: "--in-place", // ToDo
      W: "--where", // ToDo
      G: "--group-by", // ToDo
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
});

// === Output =============================

let indent = 2;
if (parsed['compact-output']) {
  indent = null;
} else if (parsed['tab']) {
  indent = '\t';
} else if (parsed['indent']) {
  indent = Number(parsed['indent']);
}

let shouldColor = process.stdout.isTTY;
if (parsed['color-output']) shouldColor = true;
if (parsed['monochrome-output']) shouldColor = false;

let rawOutput = global._trj_mode_;
if (parsed['raw-output']) rawOutput = true;
if (parsed['parsable-output']) rawOutput = false;

let terminator = '\n';
if (parsed['join-output']) terminator = '';
if (parsed['print0']) terminator = '\x00';
const output = (str) => {
  process.stdout.write(str + terminator);
};

let sortKeys = parsed['sort-keys'];

global.emit = global.e = function(thing) {
  const thingType = typeof thing;
  if (thingType === 'undefined') return;
  if (thingType === 'string' && rawOutput) {
    output(thing);
  } else {
    if (sortKeys && thing && typeof thing === 'object' && Object.prototype.toString.call(thing) === "[object Object]") {
      thing = sortedObject(thing);
    }
    let out = JSON.stringify(thing, null, indent);
    if (shouldColor) out = cardinal.highlight(out);
    output(out);
  }
};

process.stdout.on("error", function(error) {
  if (error.code === "EPIPE" || error.errno === "EPIPE") {
    process.exit(0);
  }
});

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

let inputType = global._trj_mode_ ? 'raw' : 'json';
if (parsed['null-input']) inputType = 'null';
if (parsed['raw-input']) inputType = 'raw';
if (parsed['json-input']) inputType = 'json';
if (parsed['input']) inputType = parsed['input'];

if (!POSSIBLE_INPUT_TYPES.includes(inputType)) {
  console.error(`unsupported --input '${k}'`);
  process.exit(2);
}

if (inputType === 'null') {
  proc(null);
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

  if (inputType === 'raw') {
    readline.createInterface({
      input: inputStream,
      output: null
    }).on("line", proc);
  } else {
    switch (inputType) {
      case 'json':
        inputStream = inputStream.pipe(JSONStream.parse());
        break;

      case 'csv':
        inputStream = inputStream.pipe(csv({
          objectMode: true,
          delimiter: ',',
          columns: Boolean(parsed['has-header'])
        }));
        break;

      case 'tsv':
        inputStream = inputStream.pipe(csv({
          objectMode: true,
          delimiter: '\t',
          columns: Boolean(parsed['has-header'])
        }));
        break;

      // https://www.w3.org/TR/WD-logfile.html

      default:
        console.error(`not yet implemented --input '${k}'`);
        process.exit(2);
    }

    inputStream
      .on('data', proc)
      .on('error', (e) => {
        console.error(`There was an error: ${e.message}`);
      });
  }
}
