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
  helixValue: 0.01,
  pointSize: 1
};

const projections = {
  'cartesian': {
    scale: (width, height) => [16/9, 1, 1]
  },
  'polar': {
    // x: function(min, max) { return [min, Math.sqrt(max)]; },
    x: (min, max) => [min, max],
    range: (x_min, x_max, y_min, y_max, z_min, z_max) =>
            [
              [x_min, x_max],
              [y_min, y_max],
              [z_min, z_max]
              // [Math.round(Math.sqrt(Math.abs(z_min))), Math.round(Math.sqrt(Math.abs(z_max)))]
            ],
    scale: (width, height) => [16/9, 1, 1],
    helix: 0.01
  },
  'spherical': {
    x: (min, max) => [min, Math.sqrt(max)],
    range: (x_min, x_max, y_min, y_max, z_min, z_max) =>
            [
              [x_min, x_max],
              [Math.sqrt(y_min), Math.sqrt(y_max)],
              // [y_min, y_max],
              // [z_min, z_max],
              // [Math.log(z_min), Math.log(z_max)]
              [Math.round(Math.sqrt(Math.abs(z_min))), Math.round(Math.sqrt(Math.abs(z_max)))]
            ],
    scale: (width, height) => [16/9, 1, 1]
  }
};

const {xMin, yMin, width, height, projection, helix, helixValue, pointSize} = defaults;

export function intent(DOM) {
  return {
    changeXMin: DOM.select('#xMin').events('newValue').map(parseIntFromDetail),
    changeYMin: DOM.select('#yMin').events('newValue').map(parseIntFromDetail),
    changeWidth: DOM.select('#width').events('newValue').map(parseIntFromDetail),
    changeHeight: DOM.select('#height').events('newValue').map(parseIntFromDetail),
    changeProjection: DOM.select('#projection').events('change').map(ev => ev.target.value),
    changeHelix: DOM.select('#helix').events('change').map(ev => ev.target.checked),
    changeHelixValue: DOM.select('#helixValue').events('newValue').map(parseFloatFromDetail),
    changePointSize: DOM.select('#pointSize').events('newValue').map(parseIntFromDetail)
  };
}

// these can throw exceptions
function parseIntFromDetail({detail}) { return parseInt(detail); }
function parseFloatFromDetail({detail}) { return parseFloat(detail); }

// export const model = () =>{
//   return combineAll();
// };

export function model({changeXMin, changeYMin, changeWidth, changeHeight, changeProjection, changeHelix, changeHelixValue, changePointSize}) {
  return Rx.Observable
    .combineLatest(
      changeXMin.startWith(xMin),
      changeYMin.startWith(yMin),
      changeWidth.startWith(width),
      changeHeight.startWith(height),
      changeProjection.startWith(projection),
      changeHelix.startWith(helix),
      changeHelixValue.startWith(helixValue),
      changePointSize.startWith(pointSize),
      (...args) => args
      // (xMin, yMin, width, height, projection, helix, helixValue, pointSize) =>
      // ({xMin, yMin, width, height, projection, helix, helixValue, pointSize})
    )
    .debounce(0);
}

export function view(state) {
  return state.map(config => {
    setView(config);

    console.log({config});

    const [xMin, yMin, width, height, projection, helix, helixValue, pointSize] = config;

    return h('div', [
      h('labeled-slider#xMin', {
        key: 1, label: 'xMin',
        min: -Math.pow(2, 10), initial: xMin, max: Math.pow(2, 10)
      }),
      h('labeled-slider#yMin', {
        key: 2, label: 'yMin',
        min: -Math.pow(2, 10), initial: yMin, max: Math.pow(2, 10)
      }),
      h('labeled-slider#width', {
        key: 3, label: 'width',
        min: Math.pow(2, 0), initial: width, max: Math.pow(2, 14)
      }),
      h('labeled-slider#height', {
        key: 4, label: 'height',
        min: Math.pow(2, 0), initial: height, max: Math.pow(2, 13)
      }),
      h('div', [
        h('select#projection', [
          h('option', {text: 'Cartesian', value: 'cartesian', selected: projection === 'cartesian'}), //wtf
          h('option', {text: 'Polar',     value: 'polar',     selected: projection === 'polar'}),
          h('option', {text: 'Spherical', value: 'spherical', selected: projection === 'spherical'})
        ]),
        h(`label#helixLabel${projection === 'polar' ? '.visible' : ''}`, [
          'Helix',
          h('input#helix', {type: 'checkbox', value: helix}),
          h(`div${helix ? '.visible' : '.hidden'}`, [
            h('labeled-slider#helixValue', {
              key: 5, label: 'helix value',
              min: 0.0001, max: 2, step: 0.0001,
              initial: 0.001
            })
          ])
        ])
      ]),
      h('labeled-slider#pointSize', {
        key: 6, label: 'pointSize',
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


const mathbox = mathBox({
  plugins: ['core', 'controls', 'cursor', 'stats'],
  controls: {
    klass: THREE.OrbitControls
  },
});
const three = mathbox.three;

// three.camera.position.set(-5, 5, 0);

three.renderer.setClearColor(new THREE.Color(0x000000), 1.0);

const camera = mathbox.camera({
  proxy: true,
  position: [0, 0, 2],
  fov: 60
});

function setView(config) {
  clear();
  addView(config);
}

function clear() {
  const view = mathbox.select('');

  if (view.length > 0) view.remove();
}

function addView([x_min, y_min, width, height, projection, helix, helixValue, pointSize]) {
  x_min = x_min || 1;
  y_min =  y_min || 1;

  width = width || defaultWidth;
  height = height || Math.round(Math.sqrt(defaultWidth));

  projection = projection || 'cartesian';

  const x_max = x_min + width - 1,
        y_max = y_min + height - 1;

  const view = buildProjection(projection, x_min, x_max, y_min, y_max, helix, helixValue);

  view
    .matrix({
      width ,
      height ,
      // axes: [1, 2],
      channels: 3,
      expr: divisors(x_min, y_min),
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

  function divisors(x_min, y_min) {
    return (emit, x, y, i, j, t) => {
      x = x + x_min;
      y = y + y_min;

      if (x !== 0 && y !== 0 && x % y === 0) emit(x, y, 2);
    };
  }
}

function buildProjection(name, x_min, x_max, y_min, y_max, helix, helixValue) {
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

  const width = x_max - x_min + 1,
        height = y_max - y_min + 1;
  const options = {
    range: [[x_min, x_max], [y_min, y_max], [z_min, z_max]],
    scale: projection.scale ? projection.scale(width, height) : [1, 1, 1],
    position: [Math.sqrt(Math.PI), 0, 0],
  };

  if (name === 'polar' && helix) {
    options.helix = projection.helix;
    options.helix = helixValue;
  }

  console.log('build', helix, options);

  return mathbox[name](options);
}
