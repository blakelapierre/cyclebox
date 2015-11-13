import Rx from 'rx';

import {h} from '@cycle/dom';

import {component} from '../component';

export function intent(DOM) {
  return {};
}

export function model() {
  return Rx.Observable.just(true);
}

export function view(state) {
  return state.map(() => {
    console.log({state});
    h('div.mathbox');
  });
}



// function view(state$) {
//   return state$
//     .map(({props: {xMin, yMin, width, height, projection}, value }) => {
//       console.log('side effecty stuff goes here');
//       return h('div.mathbox');
//     });
//       // h('div.labeled-slider', [
//       //   h('span.label', [label + ' ' + value + unit]),
//       //   h('input.slider', {type: 'range', min, max, value})
//       // ]));
// }

// function intent(DOM) {
//   return {
//     newValue: DOM.select('.slider').events('input')
//       .map(ev => ev.target.value)
//   };
// }

export function numberModel(responses) {
  return component(responses, intent, model, view);
}