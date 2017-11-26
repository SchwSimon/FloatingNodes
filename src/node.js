  // returns a generic array of possible directional movement data
export const getDirectionMovements = (speed) => ([
  {dir: 0, x: -speed, y: -speed},  // TOP_LEFT
  {dir: 1, x: speed, y: -speed},   // TOP
  {dir: 2, x: speed, y: -speed},   // TOP_RIGHT
  {dir: 3, x: speed, y: 0},        // RIGHT
  {dir: 4, x: speed, y: speed},    // BOTTOM_RIGHT
  {dir: 5, x: 0, y: speed},        // BOTTOM
  {dir: 6, x: -speed, y: speed},   // BOTTOM_LEFT
  {dir: 7, x: -speed, y: 0}        // LEFT
]);

// get a random direction
// OR if a last direction is passed, get a random direction which is + or - 45°
export const getRandomNodeMovement = (speed, lastMovementDir = null) => getDirectionMovements(speed)[
  (lastMovementDir === null)
    ? Math.floor(Math.random()*8)
      : lastMovementDir + ((Math.random() >= 0.5) ? ((lastMovementDir === 7) ? -7 : 1) : ((!lastMovementDir) ? 7 : -1))
];

// the default node structrue
export const defaultNodeStructure = {
  x: 0,
  y: 0,
  color: [0,0,0,1],           // rgba
  speed: 0.09,                // pixel per frame
  radiusRange: {
    min: 2,                   // pixel (inclusive)
    max: 5                    // pixel (inclusive)
  },
  connectionSize: 1,          // pixel
  connectionColor: [0,0,0],   // rgb
  connectionThreshold: 120,   // pixel
  connectionAlphaDivisor: 8,  // 1 - x
  connectionStaticAlpha: false  // alpha 0.00 - 1.00 || false
};

// returns a parameterized node
export const createNode = (params) => {
  params = Object.assign({}, defaultNodeStructure, params);
  return {
    x: params.x,
    y: params.y,
      // Set the radius if given
      // ELSE set a random radius within the given range
      // NOTE: min and max are inclusive
    radius: (params.radius !== undefined) ? params.radius : Math.floor(Math.random() * ((params.radiusRange.max+1) - params.radiusRange.min)) + params.radiusRange.min,
    color: 'rgba(' + params.color[0] + ',' + params.color[1] + ',' + params.color[2] + ',' + params.color[3] + ')',
    speed: params.speed,
    connectionSize: params.connectionSize,
    connectionColor: params.connectionColor,
    connectionAlphaDivisor: params.connectionAlphaDivisor,
    connectionStaticAlpha: params.connectionStaticAlpha,
      // connect nodes with a line if their distance is lower or equal the connectionThreshold
    connectionThreshold: params.connectionThreshold,
    movement: getRandomNodeMovement(params.speed)
  }
};

export default createNode;
