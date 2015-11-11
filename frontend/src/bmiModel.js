import Rx from 'rx';

export function model({changeWeight, changeHeight}) {
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

function calculateBMI(weight, height) {
  const heightMeters = height * 0.01;
  return Math.round(weight / (heightMeters * heightMeters));
}