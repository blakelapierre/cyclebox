import Rx from 'rx';
import {h} from '@cycle/dom';

export function labeledSlider(responses) {
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