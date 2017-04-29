'use strict';

Number.prototype.succ = function () {
  return this + 1;
};

Number.prototype.toColorPart = function () {
  return this.pad(2, 16);
};

Number.prototype.to = function (end) {
  var results = [];
  for (var i = this; i < end; i++) {
    results.push(i);
  }
  return results;
};

Number.prototype.pad = function (length, radix) {
  var string = this.toString(radix || 10);
  return new Array(length - string.length + 1).join('0') + string;
};

Number.prototype.abs = function () {
  return Math.abs(this);
};

Number.prototype.round = function () {
  return Math.round(this);
};

Number.prototype.ceil = function () {
  return Math.ceil(this);
};

Number.prototype.floor = function () {
  return Math.floor(this);
};

Number.prototype.sqrt = function () {
  return Math.sqrt(this);
};

Number.prototype.pow = function (x) {
  return Math.pow(this, x);
};
