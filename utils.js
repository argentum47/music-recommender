'use strict';

Array.prototype.flatMap = function(lambda) {
  return Array.prototype.concat.apply([], this.map(lambda)); 
};


Array.prototype.groupBy = function(lambda) {
  let result = {};

  for(let i = 0; i < this.length; i+= 1) {
    let key = lambda(this[i]);
    result[key] ? result[key].push(this[i]) : result[key] = [this[i]];
  }
  
  return result;
};

Object.values = function(value) {
  return Object.keys(value).reduce((acc, k) => {
    if(typeof k === "string" && value.propertyIsEnumerable(k)) acc = acc.concat(value[k]);
    return acc;
  }, [])
};