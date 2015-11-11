import Rx from 'rx';
import {h} from '@cycle/dom';

export function labeledSlider(responses) {
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
    return state$.map(({props, value}) => {
      const {label, unit, min, max} = props;
      return h('div.labeled-slider', [
        h('span.label', [label + ' ' + value + unit]),
        h('input.slider', {type: 'range', min, max, value})
      ]);
    });
  }

  const events = intent(responses.DOM),
        DOM = view(model(responses, events));

  return {DOM, events};
}