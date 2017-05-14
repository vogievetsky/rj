const { expect } = require('chai');
const { exec } = require('child_process');
const { sane } = require('./utils');

describe('basics', () => {
  it('--help', (testComplete) => {
    exec('bin/rj --help', (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout.replace(/\d+\.\d+\.\d+/, 'VERSION')).to.equal(sane`
        rj - command line JS multi-tool [version VERSION]
        Usage: rj [options] <rj filter> [file...]
        Example: rj -J '{ foo: $.bar }' myfile.json
        
          rj is a tool for processing JSON inputs, applying the
          given filter to its JSON text inputs and producing the
          filter's results as JSON on standard output.
        
          Some of the options include:
           -c             compact instead of pretty-printed output
           -n             use \`null\` as the single input value
           -e             set the exit status code based on the output
           -s             read (slurp) all inputs into an array apply filter to it
           -r             output raw strings, not JSON texts
           -R             read raw strings, not JSON texts
           -C             colorize JSON
           -M             monochrome (don't colorize JSON)
           --tab          use tabs for indentation
           --arg a v      set variable $a to value <v>
           --argjson a v  set variable $a to JSON value <v>

      `);
      testComplete();
    });
  });

  it('--version', (testComplete) => {
    exec('bin/rj --version', (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout.replace(/\d+\.\d+\.\d+/, 'VERSION')).to.equal(sane`
        VERSION
      `);
      testComplete();
    });
  });

  it('--null-input', (testComplete) => {
    exec(`bin/rj --null-input '{ a: 1 + 2, b: "Hello" }'`, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout).to.equal(sane`
        {
          "a": 3,
          "b": "Hello"
        }
      `);
      testComplete();
    });
  });

  it('--null-input (emit)', (testComplete) => {
    exec(`bin/rj --null-input 'emit({ a: 1 + 2, b: "Hello" })'`, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout).to.equal(sane`
        {
          "a": 3,
          "b": "Hello"
        }
      `);
      testComplete();
    });
  });

  it('--json-input (normal)', (testComplete) => {
    exec(`bin/rj --json-input '$.forEach(d => e({t: d.time, c: d.channel}))' test-data/edits.json`, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout).to.equal(sane`
        {
          "t": "2015-09-12T00:46:58Z",
          "c": "en"
        }
        {
          "t": "2015-09-12T00:47:02Z",
          "c": "es"
        }
        {
          "t": "2015-09-12T00:47:05Z",
          "c": "en"
        }
      `);
      testComplete();
    });
  });

  it('--json-input (ndjson)', (testComplete) => {
    exec(`bin/rj --json-input '{t: $.time, c: $.channel}' test-data/edits.line.json`, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout).to.equal(sane`
        {
          "t": "2015-09-12T00:46:58Z",
          "c": "en"
        }
        {
          "t": "2015-09-12T00:47:02Z",
          "c": "es"
        }
        {
          "t": "2015-09-12T00:47:05Z",
          "c": "en"
        }
      `);
      testComplete();
    });
  });

  it('--input csv --has-header', (testComplete) => {
    exec(`bin/rj --input csv --has-header '{t: $.time, c: $.channel}' test-data/edits.csv`, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout).to.equal(sane`
        {
          "t": "2015-09-12T00:46:58Z",
          "c": "en"
        }
        {
          "t": "2015-09-12T00:47:02Z",
          "c": "es"
        }
        {
          "t": "2015-09-12T00:47:05Z",
          "c": "en"
        }
      `);
      testComplete();
    });
  });

  it('--input tsv --has-header', (testComplete) => {
    exec(`bin/rj --input tsv --has-header '{t: $.time, c: $.channel}' test-data/edits.tsv`, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout).to.equal(sane`
        {
          "t": "2015-09-12T00:46:58Z",
          "c": "en"
        }
        {
          "t": "2015-09-12T00:47:02Z",
          "c": "es"
        }
        {
          "t": "2015-09-12T00:47:05Z",
          "c": "en"
        }
      `);
      testComplete();
    });
  });

  it('use trailing ; to suppress output', (testComplete) => {
    exec(`bin/rj --json-input '$.map(d => e({t: d.time, c: d.channel}));' test-data/edits.json`, (error, stdout, stderr) => {
      expect(error).to.equal(null);
      expect(stderr).to.equal('');
      expect(stdout).to.equal(sane`
        {
          "t": "2015-09-12T00:46:58Z",
          "c": "en"
        }
        {
          "t": "2015-09-12T00:47:02Z",
          "c": "es"
        }
        {
          "t": "2015-09-12T00:47:05Z",
          "c": "en"
        }
      `);
      testComplete();
    });
  });
});
