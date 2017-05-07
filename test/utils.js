// To be used as a tag
exports.sane = function() {
  let str = String.raw.apply(String, arguments);

  let match = str.match(/^\n( *)/m);
  if (!match) throw new Error('sane string must start with a \\n is:' + str);
  let spaces = match[1].length;

  let lines = str.split('\n');
  lines.shift(); // Remove the first empty lines
  lines = lines.map((line) => line.substr(spaces)); // Remove indentation

  return lines.join('\n')
    .replace(/\\`/g, '`')    // Fix \` that should be `
    .replace(/\\\{/g, '{')   // Fix \{ that should be {
    .replace(/\\\\/g, '\\'); // Fix \\ that should be \
};
