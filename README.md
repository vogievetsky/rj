# rj - a JavaScript multi-tool

rj is a simple little command line tool and a conceptual fork of [jq](https://stedolan.github.io/jq/).
rj allows you to leverage ES6 JS to write handy little command line utilities for processing text, JSON, and more. 
  
  
## Why rj?

I love [jq](https://stedolan.github.io/jq/) and use it daily but I after years of use I still struggle to remember the syntax for the more advanced parts of the language.
For me writing anything but the simplest jq filter requires opening the [manual](https://stedolan.github.io/jq/manual/).
This is not jq's fault.
You need practice to get good at something and since the jq filters are so short it would take a very long time to become proficient.
I wanted to have a tool just like jq in API (which jq nails) but with a filter syntax that is more accessible.


## Installation

To install rj simply make sure you have an up to date node (node >= 0.6.x) and use npm:

```bash
npm i -g rj
```

This will create two binaries `rj` and `jrj`.
`rj` is API equivalent to `jq --raw-input` and treats input as raw text by default.
A convenience utility `jrj` is an alias for `rj --json-input` which more like `jq`.


## Usage

The code you provide to rj is wrapped in a function like so:

```javascript
function(_, i) {
  /* <your code> */
}
```

This function is then called on every value on the incoming stream with `_` bound to the value and `i` to the index.
Anything returned form the function will be edited on the `stdout`.
You can also call a global function `emit` (alias `e`) to emit multiple results (or instead of the return).

Here is a basic example that reads text form a file and numbers every line:

```bash
rj 'return i + ": " + _' some_file.txt
```

You can affect how rj reads and writes its input and output using some command-line options:

- `--version`

  Output the rj version and exit with zero.
  
- `--help`

  Print a usage guide.  

- `--slurp` / `-s`
  
  Instead of running the filter for each JSON object in the input, read the entire input stream into a large array and run the filter just once.
  
- `--json-input` / `-J` and `--raw-input` / `-R` 
  
  With `--json-input` the input will pe parsed as JSON.
  With `--raw-input` the input wont be parsed as JSON.
  Instead, each line of text is passed to the function as a string.
  If combined with `--slurp`, then the entire input is passed to the filter as a single long string.
  `--json-input` is on by default in rj and `--raw-input` is on by default in jrj.
  
- `--null-input` / `-n`
  
  Don't read any input at all!
  Instead, the filter is run once using null as the input.
  This is useful when using rj as a calculator or to construct JSON data from scratch.
  
- `--compact-output` / `-c`
  
  By default, rj pretty-prints JSON objects.
  Using this option will result in more compact output by instead putting each JSON object on a single line.
  
- `--tab`
  
  Use a tab for each indentation level instead of two spaces.
  
- `--indent n`
  
  Use the given number of spaces (no more than 8) for indentation.
  
- `--color-output` / `-C` and `--monochrome-output` / `-M`
  
  By default, rj outputs colored JSON if writing to a terminal. You can force it to produce color even if writing to a pipe or a file using -C, and disable color with -M.
  
- `--parsable-output` / `-p` and `--raw-output` / `-r`
  
  With `--parsable-output` the emmited result will always be pparsable JSON even if a string is emitted. 
  With `--raw-output`, if the emitted result is a string then it will be written directly to standard output rather than being formatted as a JSON parsable string with quotes.
  `--raw-output` is on by default in rj and `--parsable-output` is on by default in jrj.
  
- `--arg name value`
  
  This option passes a value to the rj program as a predefined variable.
  If you run rj with `--arg foo bar`, then `$foo` is available as a global and has the value `"bar"`.
  Note that value will be treated as a string, so `--arg foo 123` will bind `$foo` to `"123"`.
  
- `--argjson name JSON-text`
  
  This option passes a JSON-encoded value to the rj program as a predefined variable.
  If you run rj with `--argjson foo '{"a": 1}'`, then `$foo` is available as a global and has the value `{"a": 1}`.

