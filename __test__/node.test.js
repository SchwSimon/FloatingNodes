import sinon from 'sinon';
import { getDirectionMovements, getRandomNodeMovement, defaultNodeStructure, createNode } from '../src/node';

const MathRandomStub = sinon.stub(Math, 'random');
const MathFloorReturn = 5;
const MathFloorStub = sinon.stub(Math, 'floor').returns(MathFloorReturn);

describe('function getDirectionMovements()', () => {
  it('must return a correct array', () => {
    const speed = 2;
    expect(getDirectionMovements(speed)).toEqual([
      {dir: 0, x: -speed, y: -speed},  // TOP_LEFT
      {dir: 1, x: speed, y: -speed},   // TOP
      {dir: 2, x: speed, y: -speed},   // TOP_RIGHT
      {dir: 3, x: speed, y: 0},        // RIGHT
      {dir: 4, x: speed, y: speed},    // BOTTOM_RIGHT
      {dir: 5, x: 0, y: speed},        // BOTTOM
      {dir: 6, x: -speed, y: speed},   // BOTTOM_LEFT
      {dir: 7, x: -speed, y: 0}        // LEFT
    ]);
  });
});

describe('function getRandomNodeMovement()', () => {
  const speed = 3;
  const movementArray = getDirectionMovements(speed);

  it('must the correct movement element', () => {
    expect(getRandomNodeMovement(speed)).toEqual(movementArray[MathFloorReturn]);
  });

  it('must the last direction index + 1', () => {
    MathRandomStub.returns(0.5);
    expect(getRandomNodeMovement(speed, 5)).toEqual(movementArray[6]);
  });

  it('must the last direction index - 7', () => {
    MathRandomStub.returns(0.5);
    expect(getRandomNodeMovement(speed, 7)).toEqual(movementArray[0]);
  });

  it('must the last direction index - 1', () => {
    MathRandomStub.returns(0.4);
    expect(getRandomNodeMovement(speed, 5)).toEqual(movementArray[4]);
  });

  it('must the last direction index + 7', () => {
    MathRandomStub.returns(0.4);
    expect(getRandomNodeMovement(speed, 0)).toEqual(movementArray[7]);
  });
});

describe('constant defaultNodeStructure', () => {
  it('must match exact', () => {
    expect(defaultNodeStructure).toEqual({
      x: 0,
      y: 0,
      color: [0,0,0,1],         // rgba
      speed: 0.09,               // pixel per frame
      radiusRange: {
        min: 2,                 // pixel (inclusive)
        max: 5                  // pixel (inclusive)
      },
      connectionSize: 1,        // pixel
      connectionColor: [0,0,0], // rgb
      connectionThreshold: 120, // pixel
      connectionAlphaDivisor: 8,  // 1 - x
      connectionStaticAlpha: false  // alpha 0.00 - 1.00 || false
    });
  });
});

describe('function createNode()', () => {
  it('must return a node with default values only', () => {
    const params = Object.assign({}, defaultNodeStructure);
    expect(createNode()).toEqual({
      x: params.x,
      y: params.y,
      radius: MathFloorReturn + params.radiusRange.min,
      color: 'rgba(' + params.color[0] + ',' + params.color[1] + ',' + params.color[2] + ',' + params.color[3] + ')',
      speed: params.speed,
      connectionSize: params.connectionSize,
      connectionColor: params.connectionColor,
      connectionThreshold: params.connectionThreshold,
      connectionAlphaDivisor: params.connectionAlphaDivisor,
      connectionStaticAlpha: params.connectionStaticAlpha,
      movement: getRandomNodeMovement(params.speed)
    });
  });

  it('must return a correct node', () => {
    const params = {
      x: 1,
      y: 2,
      color: [255,0,0,0.8],
      speed: 0.1,
      radius: 10,
      connectionSize: 3,
      connectionColor: [0,0,255],
      connectionThreshold: 150,
      connectionAlphaDivisor: 5,
      connectionStaticAlpha: 0.5
    };
    expect(createNode(params)).toEqual({
      x: params.x,
      y: params.y,
      radius: params.radius,
      color: 'rgba(' + params.color[0] + ',' + params.color[1] + ',' + params.color[2] + ',' + params.color[3] + ')',
      speed: params.speed,
      connectionSize: params.connectionSize,
      connectionColor: params.connectionColor,
      connectionThreshold: params.connectionThreshold,
      connectionAlphaDivisor: 5,
      connectionStaticAlpha: 0.5,
      movement: getRandomNodeMovement(params.speed)
    });
  });
});
