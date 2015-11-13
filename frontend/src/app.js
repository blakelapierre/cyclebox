//Slightly cleaned up version of http://cycle.js.org/custom-elements.html

import Rx from 'rx';
import Cycle from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';

import {main, dependencies} from './demoApp';

Cycle.run(main, {
  DOM: makeDOMDriver('#app', dependencies)
});