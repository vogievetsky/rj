'use strict';

String.prototype.toNumber = function () {
  return Number(this);
};

String.prototype.toDate = function () {
  return new Date(this);
};

String.prototype.toArray = function () {
  return this.split('');
};

String.prototype.succ = function () {
  return this.slice(0, this.length - 1) + String.fromCharCode(this.charCodeAt(this.length - 1) + 1);
};

String.prototype.times = function (count) {
  return count < 1 ? '' : new Array(count + 1).join(this);
};

String.prototype.camelize = function () {
  return this.replace(/-+(.)?/g, function(match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
};

String.prototype.capitalize = function () {
  return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase();
};

String.prototype.underscore = function () {
  return this
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
    .replace(/([a-z\d])([A-Z])/g, '$1_$2')
    .replace(/-/g, '_')
    .toLowerCase();
};

String.prototype.dasherize = function () {
  return this.replace(/_/g, '-');
};

String.prototype.parseJSON = function () {
  return JSON.parse(this);
};

String.prototype.isEmpty = function () {
  return this === '';
};

String.prototype.isBlank = function () {
  return this.trim() === '';
};

String.prototype.utf8ByteLength = function () {
  return Buffer.byteLength(this, "utf8");
};

/*
  function prepareReplacement(replacement) {
    if (Object.isFunction(replacement)) return replacement;
    var template = new Template(replacement);
    return function(match) { return template.evaluate(match) };
  }

  function gsub(pattern, replacement) {
    var result = '', source = this, match;
    replacement = prepareReplacement(replacement);

    if (Object.isString(pattern))
      pattern = RegExp.escape(pattern);

    if (!(pattern.length || pattern.source)) {
      replacement = replacement('');
      return replacement + source.split('').join(replacement) + replacement;
    }

    while (source.length > 0) {
      if (match = source.match(pattern)) {
        result += source.slice(0, match.index);
        result += String.interpret(replacement(match));
        source  = source.slice(match.index + match[0].length);
      } else {
        result += source, source = '';
      }
    }
    return result;
  }

  function sub(pattern, replacement, count) {
    replacement = prepareReplacement(replacement);
    count = Object.isUndefined(count) ? 1 : count;

    return this.gsub(pattern, function(match) {
      if (--count < 0) return match[0];
      return replacement(match);
    });
  }

  function scan(pattern, iterator) {
    this.gsub(pattern, iterator);
    return String(this);
  }

  function truncate(length, truncation) {
    length = length || 30;
    truncation = Object.isUndefined(truncation) ? '...' : truncation;
    return this.length > length ?
      this.slice(0, length - truncation.length) + truncation : String(this);
  }

  function escapeHTML() {
    return this.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }

  function unescapeHTML() {
    return this.stripTags().replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&amp;/g,'&');
  }
*/
