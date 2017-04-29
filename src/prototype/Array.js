'use strict';

function makeFn(iterator) {
  var type = typeof iterator;
  switch (type) {
    case 'function':
      return iterator;

    case 'string':
    case 'number':
      return function (x) {
        return x[iterator];
      };

    case 'undefined':
      return function (x) {
        return x;
      };

    default:
      throw new Error('could not convert ' + String(iterator) + ' to function');
  }
}

Array.prototype.toArray = function () {
  return this;
};

Array.prototype.first = function () {
  return this[0];
};

Array.prototype.last = function () {
  return this[this.length - 1];
};

Array.prototype.filterMap = function (iterator, context) {
  iterator = makeFn(iterator);
  let newArray = [];
  this.forEach((value, index) => {
    let v = iterator.call(context, value, index);
    if (typeof v !== 'undefined') {
      newArray.push(v);
    }
  });
  return newArray;
};

Array.prototype.flatMap = function (iterator, context) {
  iterator = makeFn(iterator);
  let newArray = [];
  this.forEach((value, index) => {
    let v = iterator.call(context, value, index);
    if (typeof v !== 'undefined') {
      newArray = newArray.concat(v);
    }
  });
  return newArray;
};

Array.prototype.sortBy = function (iterator, context) {
  iterator = makeFn(iterator);
  return this
    .map(function(value, index) {
      return {
        value: value,
        criteria: iterator.call(context, value, index)
      };
    })
    .sort(function(left, right) {
      var a = left.criteria, b = right.criteria;
      return a < b ? -1 : a > b ? 1 : 0;
    })
    .map(function (x) { return x.value });
};

Array.prototype.randomize = function () {
  return this.sortBy(function () {
    return Math.random();
  });
};

Array.prototype.min = function (iterator, context) {
  iterator = makeFn(iterator);
  var result;
  this.forEach(function(value, index) {
    value = iterator.call(context, value, index);
    if (result == null || value < result)
      result = value;
  });
  return result;
};

Array.prototype.max = function (iterator, context) {
  iterator = makeFn(iterator);
  var result;
  this.forEach(function(value, index) {
    value = iterator.call(context, value, index);
    if (result == null || value >= result)
      result = value;
  });
  return result;
};





/*
function collect(iterator, context) {
  iterator = iterator || Prototype.K;
  var results = [];
  this.each(function(value, index) {
    results.push(iterator.call(context, value, index));
  });
  return results;
}

function detect(iterator, context) {
  var result;
  this.each(function(value, index) {
    if (iterator.call(context, value, index)) {
      result = value;
      throw $break;
    }
  });
  return result;
}

function grep(filter, iterator, context) {
  iterator = iterator || Prototype.K;
  var results = [];

  if (Object.isString(filter))
    filter = new RegExp(RegExp.escape(filter));

  this.each(function(value, index) {
    if (filter.match(value))
      results.push(iterator.call(context, value, index));
  });
  return results;
}

function include(object) {
  if (Object.isFunction(this.indexOf))
    if (this.indexOf(object) != -1) return true;

  var found = false;
  this.each(function(value) {
    if (value == object) {
      found = true;
      throw $break;
    }
  });
  return found;
}

function inGroupsOf(number, fillWith) {
  fillWith = Object.isUndefined(fillWith) ? null : fillWith;
  return this.eachSlice(number, function(slice) {
    while(slice.length < number) slice.push(fillWith);
    return slice;
  });
}


function partition(iterator, context) {
  iterator = iterator || Prototype.K;
  var trues = [], falses = [];
  this.each(function(value, index) {
    (iterator.call(context, value, index) ?
      trues : falses).push(value);
  });
  return [trues, falses];
}

function reject(iterator, context) {
  var results = [];
  this.each(function(value, index) {
    if (!iterator.call(context, value, index))
      results.push(value);
  });
  return results;
}

function zip() {
  var iterator = Prototype.K, args = $A(arguments);
  if (Object.isFunction(args.last()))
    iterator = args.pop();

  var collections = [this].concat(args).map($A);
  return this.map(function(value, index) {
    return iterator(collections.pluck(index));
  });
}



  function compact() {
    return this.select(function(value) {
      return value != null;
    });
  }

  function flatten() {
    return this.inject([], function(array, value) {
      if (Object.isArray(value))
        return array.concat(value.flatten());
      array.push(value);
      return array;
    });
  }

  function without() {
    var values = slice.call(arguments, 0);
    return this.select(function(value) {
      return !values.include(value);
    });
  }

  function uniq(sorted) {
    return this.inject([], function(array, value, index) {
      if (0 == index || (sorted ? array.last() != value : !array.include(value)))
        array.push(value);
      return array;
    });
  }

  function intersect(array) {
    return this.uniq().findAll(function(item) {
      return array.detect(function(value) { return item === value });
    });
  }


  function clone() {
    return slice.call(this, 0);
  }

*/
