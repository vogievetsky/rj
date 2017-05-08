const { expect } = require('chai');
const { exec } = require('child_process');

function sameSame(cmd1, cmd2, verbose) {
  return (testComplete) => {
    exec(cmd1, (error1, stdout1, stderr1) => {
      expect(error1).to.equal(null);
      exec(cmd2, (error2, stdout2, stderr2) => {
        expect(error2).to.equal(null);

        expect(stderr1).to.equal(stderr2);
        expect(stdout1).to.equal(stdout2);
        if (verbose) console.log(stdout2);
        testComplete();
      });
    });
  }
}

describe('equivalence', () => {
  it('--null-input', sameSame(
    `jq --null-input '{ b: 3, a: "Hello" }'`,
    `bin/rj --null-input '{ b: 3, a: "Hello" }'`
  ));

  it('--null-input --compact-output', sameSame(
    `jq --null-input --compact-output '{ b: 3, a: "Hello" }'`,
    `bin/rj --null-input --compact-output '{ b: 3, a: "Hello" }'`
  ));

  it('--null-input --compact-output --sort-keys', sameSame(
    `jq --null-input --compact-output --sort-keys '{ b: 3, a: "Hello" }'`,
    `bin/rj --null-input --compact-output --sort-keys '{ b: 3, a: "Hello" }'`
  ));

  it('some json input (single object)', sameSame(
    `jq '.' test-data/edits.json`,
    `bin/rj '$' test-data/edits.json`
  ));

  it('some json input (multi object)', sameSame(
    `jq '.' test-data/edits.multi.json`,
    `bin/rj '$' test-data/edits.multi.json`
  ));

  it('some ndjson input', sameSame(
    `jq '.' test-data/edits.line.json`,
    `bin/rj '$' test-data/edits.line.json`
  ));

  it('--slurp some ndjson input', sameSame(
    `jq --slurp '.' test-data/edits.line.json`,
    `bin/rj --slurp '$' test-data/edits.line.json`
  ));

  it('some text input --raw-input', sameSame(
    `jq --raw-input '.' test-data/two-cities.txt`,
    `bin/rj --raw-input '$' test-data/two-cities.txt`
  ));

  it('extract a string', sameSame(
    `jq '.channel' test-data/edits.line.json`,
    `bin/rj '$.channel' test-data/edits.line.json`
  ));

  it('extract a string --raw-output', sameSame(
    `jq --raw-output '.channel' test-data/edits.line.json`,
    `bin/rj --raw-output '$.channel' test-data/edits.line.json`
  ));

  it('--join-output', sameSame(
    `jq --join-output '.' test-data/edits.line.json`,
    `bin/rj --join-output '$' test-data/edits.line.json`
  ));

  it('--tab', sameSame(
    `jq --tab '.' test-data/edits.line.json`,
    `bin/rj --tab '$' test-data/edits.line.json`
  ));

  it('--indent', sameSame(
    `jq --indent 4 '.' test-data/edits.line.json`,
    `bin/rj --indent 4 '$' test-data/edits.line.json`
  ));

  it('--arg', sameSame(
    `jq --null-input --arg a Hello --arg b World '$a + $b'`,
    `bin/rj --null-input --arg a Hello --arg b World '$a + $b'`
  ));

  it('--argjson', sameSame(
    `jq --null-input --argjson a '{"X": 1, "Y": 2}' --argjson b 5 '{ a: $a, b: $b }'`,
    `bin/rj --null-input --argjson a '{"X": 1, "Y": 2}' --argjson b 5 '{ a: $a, b: $b }'`
  ));

});
