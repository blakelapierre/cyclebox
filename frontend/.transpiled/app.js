'use strict';

var _rx = require('rx');

var _rx2 = _interopRequireDefault(_rx);

var _core = require('@cycle/core');

var _core2 = _interopRequireDefault(_core);

var _dom = require('@cycle/dom');

var _dom2 = _interopRequireDefault(_dom);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function main() {
  return {
    DOM: _rx2.default.Observable.interval(1000).map(function (i) {
      return _dom2.default.h('h1', '' + i + ' seconds elapsed');
    })
  };
}

var drivers = {
  DOM: _dom2.default.makeDOMDriver('#app')
};

_core2.default.run(main, drivers);