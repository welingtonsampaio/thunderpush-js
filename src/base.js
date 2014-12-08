var isMSIE = /*@cc_on!@*/0;
(function(window, undefined){
  "use strict";

  /** Underscore Functions **/
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  var
    push = ArrayProto.push,
    slice = ArrayProto.slice,
    concat = ArrayProto.concat,
    toString = ObjProto.toString,
    hasOwnProperty = ObjProto.hasOwnProperty;

  var
    nativeForEach = ArrayProto.forEach,
    nativeMap = ArrayProto.map,
    nativeReduce = ArrayProto.reduce,
    nativeReduceRight = ArrayProto.reduceRight,
    nativeFilter = ArrayProto.filter,
    nativeEvery = ArrayProto.every,
    nativeSome = ArrayProto.some,
    nativeIndexOf = ArrayProto.indexOf,
    nativeLastIndexOf = ArrayProto.lastIndexOf,
    nativeIsArray = Array.isArray,
    nativeKeys = Object.keys,
    nativeBind = FuncProto.bind;

  var _ = function (obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  if (typeof (/./) !== 'function') {
    _.isFunction = function (obj) {
      return typeof obj === 'function';
    };
  }
  _.identity = function (value) {
    return value;
  };
  _.lookupIterator = function (value) {
    return _.isFunction(value) ? value : function (obj) {
      return obj[value];
    };
  };
  _.sortedIndex = function (array, obj, iterator, context) {
    iterator = iterator == null ? _.identity : _.lookupIterator(iterator);
    var value = iterator.call(context, obj);
    var low = 0, high = array.length;
    while (low < high) {
      var mid = (low + high) >>> 1;
      iterator.call(context, array[mid]) < value ? low = mid + 1 : high = mid;
    }
    return low;
  };
  _.indexOf = function (array, item, isSorted) {
    if (array == null) return -1;
    var i = 0, l = array.length;
    if (isSorted) {
      if (typeof isSorted === 'number') {
        i = (isSorted < 0 ? Math.max(0, l + isSorted) : isSorted);
      } else {
        i = _.sortedIndex(array, item);
        return array[i] === item ? i : -1;
      }
    }
    if (nativeIndexOf && array.indexOf === nativeIndexOf) return array.indexOf(item, isSorted);
    for (; i < l; i++) if (array[i] === item) return i;
    return -1;
  };
  _.extends = function (_new, old){
    var i;
    for(i in old){
      if ( !_new.hasOwnProperty(i) || _new[i] === undefined || _new[i] === null ){
        _new[i] = old[i];
      }
    }
    return _new;
  };
  window._ = _;
  /** UnderscoreJS Functions **/
})(window);
