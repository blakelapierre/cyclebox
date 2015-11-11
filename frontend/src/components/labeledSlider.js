import Rx from 'rx';
import {h} from '@cycle/dom';

import {component} from './component';

export function labeledSlider(responses) {
  return component(responses, intent, model, view);
}

function intent(DOM) {
  return {
    newValue: DOM.select('.slider').events('input')
      .map(ev => ev.target.value)
  };
}

function model({props}, {newValue}) {
  const initialValue$ = props.get('initial').first(),
        value$ = initialValue$.concat(newValue),
        props$ = props.getAll();

  return Rx.Observable
    .combineLatest(props$, value$, (props, value) => ({props, value}));
}

function view(state$) {
  return state$
    .map(({props: {label, unit, min, max}, value }) =>
      h('div.labeled-slider', [
        h('span.label', [label + ' ' + value + unit]),
        h('input.slider', {type: 'range', min, max, value})
      ]));
}