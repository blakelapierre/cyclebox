//Slightly cleaned up version of http://cycle.js.org/custom-elements.html

import Rx from 'rx';
import Cycle from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';

function labeledSlider(responses) {
  function intent(DOM) {
    return {
      changeValue$: DOM.select('.slider').events('input')
        .map(ev => ev.target.value)
    };
  }

  function model({props}, {changeValue$}) {
    const initialValue$ = props.get('initial').first(),
          value$ = initialValue$.concat(changeValue$),
          props$ = props.getAll();

    return Rx.Observable
      .combineLatest(props$, value$, (props, value) => ({props, value}));
  }

  function view(state$) {
    return state$.map(({props, value}) => {
      const {label, unit, min, max} = props;
      return h('div.labeled-slider', [
        h('span.label', [label + ' ' + value + unit]),
        h('input.slider', {type: 'range', min, max, value})
      ]);
    });
  }

  const actions = intent(responses.DOM),
        DOM = view(model(responses, actions));

  return {
    DOM,
    events: {
      newValue: actions.changeValue$
    }
  };
}

function calculateBMI(weight, height) {
  const heightMeters = height * 0.01;
  return Math.round(weight / (heightMeters * heightMeters));
}

function intent(DOM) {
  return {
    changeWeight: DOM.select('#weight').events('newValue')
      .map(ev => ev.detail),
    changeHeight: DOM.select('#height').events('newValue')
      .map(ev => ev.detail)
  };
}

function model({changeWeight, changeHeight}) {
  return Rx.Observable
    .combineLatest(
      changeWeight.startWith(70),
      changeHeight.startWith(170),
      (weight, height) => {
        return {
          weight,
          height,
          bmi: calculateBMI(weight, height)
        };
      }
    );
}

function view(state) {
  return state.map(({weight, height, bmi}) =>
    h('div', [
      h('labeled-slider#weight', {
        key: 1, label: 'Weight', unit: 'kg',
        min: 40, initial: weight, max: 140
      }),
      h('labeled-slider#height', {
        key: 2, label: 'Height', unit: 'cm',
        min: 140, initial: height, max: 210
      }),
      h('h2', 'BMI is ' + bmi)
    ])
  );
}

function main({DOM}) {
  return {
    DOM: view(model(intent(DOM)))
  };
}

Cycle.run(main, {
  DOM: makeDOMDriver('#app', {
    'labeled-slider': labeledSlider
  })
});