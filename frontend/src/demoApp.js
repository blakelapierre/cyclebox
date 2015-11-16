import Rx from 'rx';

import {h} from '@cycle/dom';

import {components} from './components';

const defaults = {
  xMin: 1,
  yMin: 1,
  width: Math.pow(2, 5),
  height: Math.pow(2, 4),
  projection: 'polar',
  helix: false,
  pointSize: 1
};

const {xMin, yMin, width, height, projection, helix, pointSize} = defaults;

export function intent(DOM) {
  return {
    changeXMin: DOM.select('#xMin').events('newValue').map(ev => parseInt(ev.detail)),
    changeYMin: DOM.select('#yMin').events('newValue').map(ev => parseInt(ev.detail)),
    changeWidth: DOM.select('#width').events('newValue').map(ev => parseInt(ev.detail)),
    changeHeight: DOM.select('#height').events('newValue').map(ev => parseInt(ev.detail)),
    changeProjection: DOM.select('#projection').events('change').map(ev => ev.target.value),
    changeHelix: DOM.select('#helix').events('change').map(ev => ev.target.checked),
    changePointSize: DOM.select('#pointSize').events('newValue').map(ev => parseInt(ev.detail))
  };
}

// export const model = () =>{
//   return combineAll();
// };

export function model({changeXMin, changeYMin, changeWidth, changeHeight, changeProjection, changeHelix, changePointSize}) {
  return Rx.Observable
    .combineLatest(
      changeXMin.startWith(xMin),
      changeYMin.startWith(yMin),
      changeWidth.startWith(width),
      changeHeight.startWith(height),
      changeProjection.startWith(projection),
      changeHelix.startWith(helix),
      changePointSize.startWith(pointSize),
      (xMin, yMin, width, height, projection, helix, pointSize) =>
      ({xMin, yMin, width, height, projection, helix, pointSize})
    )
    .debounce(0);
}

export function view(state) {
  return state.map(config => {
    setView(config);

    const {xMin, yMin, width, height, projection, helix, pointSize} = config;

    return h('div', [
      h('labeled-slider#xMin', {
        key: 1, label: 'xMin',
        min: 1, initial: xMin, max: Math.pow(2, 15)
      }),
      h('labeled-slider#yMin', {
        key: 2, label: 'yMin',
        min: 1, initial: yMin, max: Math.pow(2, 15)
      }),
      h('labeled-slider#width', {
        key: 3, label: 'width',
        min: Math.pow(2, 1), initial: width, max: Math.pow(2, 12)
      }),
      h('labeled-slider#height', {
        key: 4, label: 'height',
        min: Math.pow(2, 1), initial: height, max: Math.pow(2, 12)
      }),
      h('div', [
        h('select#projection', [
          h('option', {text: 'Cartesian', value: 'cartesian', selected: projection === 'cartesian'}), //wtf
          h('option', {text: 'Polar',     value: 'polar',     selected: projection === 'polar'}),
          h('option', {text: 'Spherical', value: 'spherical', selected: projection === 'spherical'})
        ]),
        h('label', [
          'Helix',
          h('input#helix', {type: 'checkbox', 'class': projection === 'polar' ? '' : 'hidden', value: helix === 'true'})
        ])
      ]),
      h('labeled-slider#pointSize', {
        key: 5, label: 'pointSize',
        min: 1, initial: pointSize, max: 20
      })
    ]);
  });
}

export function main({DOM}) {
  return {
    DOM: view(model(intent(DOM)))
  };
}

export const dependencies = components;


var mathbox = mathBox({
  plugins: ['core', 'controls', 'cursor', 'stats'],
  controls: {
    klass: THREE.OrbitControls
  },
});
var three = mathbox.three;

three.camera.position.set(-5, 5, 0);

three.renderer.setClearColor(new THREE.Color(0x000000), 1.0);

function clear() {
  var view = mathbox.select('');

  if (view.length > 0) view.remove();
}

function setView(config) {
  clear();
  addView(config);
}

function addView({xMin: x_min, yMin: y_min, width, height, projection, helix, pointSize}) {
  x_min = x_min || 1;
  y_min =  y_min || 1;

  width = width || defaultWidth;
  height = height || Math.round(Math.sqrt(defaultWidth));

  projection = projection || 'cartesian';

  const x_max = x_min + width - 1,
        y_max = y_min + height - 1;

  const view = buildProjection(projection, x_min, x_max, y_min, y_max, helix);

  view
    .matrix({
      width ,
      height ,
      // axes: [1, 2],
      channels: 3,
      expr: divisors,
    })
    .point({
      color: [68/255, 174/255, 218/255],
      // colors: 'area',
      size: pointSize || 1,
      blending: 'add',
      shape: 'square',
      opacity: 0.8,
      zWrite: false,
      zTest: false,
    });
}

function divisors(emit, x, y, i, j, t) {
  if (x > 0 && y > 0 && x % y === 0) emit(x, y, y);
}

const projections = {
  'cartesian': {
    scale: [16/9, 1, 1]
  },
  'polar': {
    // x: function(min, max) { return [min, Math.sqrt(max)]; },
    x: (min, max) => [min, max],
    range: (x_min, x_max, y_min, y_max, z_min, z_max) => [[x_min, x_max], [Math.round(Math.sqrt(y_min)), Math.round(Math.sqrt(y_max))], [Math.round(Math.sqrt(z_min)), Math.round(Math.sqrt(z_max))]],
    helix: 0.01
  },
  'spherical': {
    x: (min, max) => [min, Math.sqrt(max)],
    range: (x_min, x_max, y_min, y_max, z_min, z_max) => [[x_min, x_max], [y_min, y_max], [Math.round(Math.sqrt(z_min)), Math.round(Math.sqrt(z_max))]],
    scale: [16/9, 1, 1]
  }
};

function buildProjection(name, x_min, x_max, y_min, y_max, helix) {
  let z_min = y_min,
      z_max = y_max;

  const projection = projections[name];

  if (projection.z) {
    const transformed = projection.z(z_min, z_max);

    z_min = transformed[0];
    z_max = transformed[1];
  }

  if (projection.range) {
    const range = projection.range(x_min, x_max, y_min, y_max, z_min, z_max);

    x_min = range[0][0];
    x_max = range[0][1];
    y_min = range[1][0];
    y_max = range[1][1];
    z_min = range[2][0];
    z_max = range[2][1];
  }

  const options = {
    range: [[x_min, x_max], [y_min, y_max], [z_min, z_max]],
    scale: projection.scale || [1, 1, 1],
    position: [0, 0, 0],
  };

  if (projection.helix) {
    options.helix = projection.helix;
    options.helix = helix ? 0.01 : undefined;
  }

  console.log('build', helix, options);

  return mathbox[name](options);
}
