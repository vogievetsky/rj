var fs = require('fs');
var nopt = require('nopt');
var split = require('split');
var cardinal = require('cardinal');
var shell = require('shelljs');
require('./prototype');

var argv = nopt(
  {
    'help': Boolean,
    'version': Boolean,
    'slurp': Boolean,
    'json-input': Boolean,
    'null-input': Boolean,
    'compact-output': Boolean,
    'tab': Boolean,
    'indent': Number,
    'color-output': Boolean,
    'monochrome-output': Boolean
  },
  {
    "j" : ["--json-input"],
    "n" : ["--null-input"],
    "c" : ["--compact-output"],
    "C" : ["--color-output"],
    "M" : ["--monochrome-output"]
  }
);

if (argv['help']) {
  console.log('Usage: rj \'return _\'');
  process.exit(0);
}

if (argv['version']) {
  console.log('0.0.1');
  process.exit(0);
}

var indent = 2;
if (argv['compact-output']) {
  indent = null;
} else if (argv['tab']) {
  indent = '\t';
} else if (argv['indent']) {
  indent = argv['indent'];
}

var shouldColor = process.stdout.isTTY;
if (argv['color-output']) shouldColor = true;
if (argv['monochrome-output']) shouldColor = false;

global.emit = global.e = function(thing) {
  if (typeof thing === 'object') {
    var out = JSON.stringify(thing, null, indent);
    if (shouldColor) out = cardinal.highlight(out);
    console.log(out);
  } else {
    console.log(thing);
  }
};

global.exec = shell.exec;

try {
  var fn = new Function('_', '_i', argv.argv.remain[0]);
} catch (e) {
  console.log(e.message);
  process.exit(3);
}

var index = -1;
function proc(line) {
  index++;
  try {
    var value = fn(line, index);
  } catch (e) {
    console.error(e);
  }
  if (typeof value === 'undefined') return;
  emit(value);
}

var jsonInput = argv['json-input'];
if (argv['null-input']) {
  proc(jsonInput ? null : '');
} else {
  process.stdin
    .pipe(split())
    .on('data', function (line) {
      if (jsonInput) {
        // ToDo: try catch
        line = JSON.parse(line);
      }
      proc(line);
    });
}
