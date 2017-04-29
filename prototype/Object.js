'use strict';

var toString = Object.prototype.toString;

Object.isFunction = function (object) {
  return toString.call(object) === '[object Function]';
};

Object.isString = function (object) {
  return toString.call(object) === '[object String]';
};

Object.isNumber = function (object) {
  return toString.call(object) === '[object Number]';
};

Object.isDate = function (object) {
  return toString.call(object) === '[object Date]';
};

Object.isUndefined = function (object) {
  return typeof object === "undefined";
};
