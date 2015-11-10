import Rx from 'rx';
import Cycle from '@cycle/core';
import CycleDOM from '@cycle/dom';

function main() {
  return {
    DOM: Rx.Observable.interval(1000)
      .map(i => CycleDOM.h(
        'h1', '' + i + ' seconds elapsed'
      ))
  };
}

let drivers = {
  DOM: CycleDOM.makeDOMDriver('#app')
};

Cycle.run(main, drivers);