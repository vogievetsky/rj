'use strict';

RegExp.escape = function(str) {
  return String(str).replace(/([.*+?^=!:${}()|[\]\/\\])/g, '\\$1');
};

RegExp.prototype.match = function (str) {
  return String(str).match(this);
};
