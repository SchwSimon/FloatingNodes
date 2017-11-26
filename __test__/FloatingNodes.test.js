import React from 'react';
import sinon from 'sinon';
import Enzyme, { shallow } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { FloatingNodes } from '../src/FloatingNodes';
import { createNode } from '../src/node';

Enzyme.configure({ adapter: new Adapter() });

  // define window.performance if its not supported
if (!window.performance) {
  window.performance = new class {
    now() { return Date.now(); }
  };
}

describe('<FloatingNodes />', () => {
  const props = {
    width: 500,
    height: 600,
    initialNodeCount: 3,
  };
	const wrapper = shallow(<FloatingNodes {...props} />);

  it('renders without crashing', () => {
		expect(wrapper.length).toBe(1);
  });

  describe('Lifecycle', () => {
    describe('componentDidMount', () => {
      it('must trigger onStart()', () => {
        const onStartStub = sinon.stub(wrapper.instance(), 'onStart');
        wrapper.instance().componentDidMount();
        onStartStub.restore();
    		expect(onStartStub.called).toBeTruthy();
      });
    });

    describe('componentWillReceiveProps', () => {
      it('must trigger onResume()', () => {
        const onResumeStub = sinon.stub(wrapper.instance(), 'onResume');
        wrapper.instance().componentWillReceiveProps({
          pauseAnimation: true
        });
        onResumeStub.restore();
    		expect(onResumeStub.called).toBeTruthy();
      });
    });

    describe('componentWillUnmount', () => {
      it('must trigger onStop()', () => {
        const onStopStub = sinon.stub(wrapper.instance(), 'onStop');
        wrapper.instance().componentWillUnmount();
        onStopStub.restore();
    		expect(onStopStub.called).toBeTruthy();
      });
    });
  });

  describe('functionality', () => {
    describe('onStart()', () => {
      const requestAnimationFrameStub = sinon.stub(window, 'requestAnimationFrame').returns(1);
      const renderCanvasStub = sinon.stub(wrapper.instance(), 'renderCanvas');
      wrapper.instance().onStart();
      const state = Object.assign({}, wrapper.state());
      requestAnimationFrameStub.restore();
      renderCanvasStub.restore();

      it('must set the correct amount of state:nodes', () => {
        expect(state.nodes.length).toBe(props.initialNodeCount);
      });

      it('must trigger requestAnimationFrame with renderCanvas()', () => {
        expect(requestAnimationFrameStub.calledWith(renderCanvasStub)).toBeTruthy();
      });

      it('must set the state:animationFrame to the return value of requestAnimationFrame', () => {
        expect(state.animationFrame).toBe(1);
      });
    });

    describe('onStop()', () => {
      it('must trigger cancelAnimationFrame with the state:animationFrame', () => {
        const cancelAnimationFrameStub = sinon.stub(window, 'cancelAnimationFrame');
        const animationFrame = wrapper.state().animationFrame;
        wrapper.instance().onStop();
        cancelAnimationFrameStub.restore();
        expect(cancelAnimationFrameStub.calledWith(animationFrame)).toBeTruthy();
      });
    });

    describe('onResume()', () => {
      const requestAnimationFrameStub = sinon.stub(window, 'requestAnimationFrame').returns(2);
      const renderCanvasStub = sinon.stub(wrapper.instance(), 'renderCanvas');
      wrapper.instance().onResume();
      const state = Object.assign({}, wrapper.state());
      requestAnimationFrameStub.restore();
      renderCanvasStub.restore();

      it('must trigger requestAnimationFrame with renderCanvas()', () => {
        expect(requestAnimationFrameStub.calledWith(renderCanvasStub)).toBeTruthy();
      });

      it('must set the state:animationFrame to the return value of requestAnimationFrame', () => {
        expect(state.animationFrame).toBe(2);
      });
    });

    describe('onMouseEnter()', () => {
      it('must set the state:cursorNode to be a new node', () => {
        wrapper.setProps({enableInteraction: true});
        wrapper.find('.FloatingNodes-canvas').simulate('mouseEnter');
        expect(wrapper.state().cursorNode).toHaveProperty('x');
        expect(wrapper.state().cursorNode).toHaveProperty('y');
      });
    });

    describe('onMouseMove()', () => {
      it('must update the state:cursorNode position (x, y)', () => {
        wrapper.instance().canvas = {
          getBoundingClientRect: () => ({
            left: 3,
            top: 4
          })
        };
        wrapper.find('.FloatingNodes-canvas').simulate('mouseMove', {
          clientX: 1,
          clientY: 2
        });
        expect(wrapper.state().cursorNode).toMatchObject({
          x: 1 - 3,
          y: 2 - 4,
        });
      });
    });

    describe('onMouseLeave()', () => {
      it('must set the state:cursorNode to null', () => {
        wrapper.find('.FloatingNodes-canvas').simulate('mouseLeave');
        expect(wrapper.state().cursorNode).toBeNull();
      });
    });

    describe('onMouseDown()', () => {
      wrapper.setProps({
        enableNodeDrop: true,
        nodeDropParams: {
          amount: 2
        }
      });
      wrapper.instance().canvas = {
        getBoundingClientRect: () => ({
          left: 1,
          top: 1
        })
      };
      const prevNodeCount = wrapper.state().nodes.length;
      const event = {clientX: 5,clientY: 6};
      wrapper.find('.FloatingNodes-canvas').simulate('mouseDown', event);
      const state = Object.assign({}, wrapper.state());

      it('must add 2 more nodes', () => {
        expect(state.nodes.length).toBe(prevNodeCount + 2);
      });

      it('must set state:dropNodeCount to 2', () => {
        expect(state.dropNodeCount).toBe(2);
      });

      it('must set state:dropNodeCount to 3 (the limit)', () => {
        wrapper.setProps({
          enableNodeDrop: true,
          nodeDropParams: {
            amount: 2,
            limit: 3
          }
        });
        wrapper.instance().onMouseDown(event);
        expect(wrapper.state().dropNodeCount).toBe(3);
      });
    });

    describe('renderCanvas()', () => {
      it('must trigger onStop() if prop:pauseAnimation is true', () => {
        const onStopStub = sinon.stub(wrapper.instance(), 'onStop');
        wrapper.setProps({pauseAnimation: true});
        wrapper.instance().renderCanvas();
        onStopStub.restore();
        expect(onStopStub.called).toBeTruthy();
      });

      const requestAnimationFrameStub = sinon.stub(window, 'requestAnimationFrame').returns(3);
      const performanceNow = performance.now();
      wrapper.setProps({
        pauseAnimation: false,
        movementUpdateTime: 1,
        lastMovementUpdate: performanceNow - 999999 // updateMovement to be true
      });
      wrapper.state().lastMovementUpdate = 0;
      const clearRectSpy = sinon.spy();
      const beginPathSpy = sinon.spy();
      const arcSpy = sinon.spy();
      const fillSpy = sinon.spy();
      const moveToSpy = sinon.spy();
      const lineToSpy = sinon.spy();
      const strokeSpy = sinon.spy();
      const closePathSpy = sinon.spy();
      const context = {
        clearRect: clearRectSpy,
        beginPath: beginPathSpy,
        arc: arcSpy,
        fill: fillSpy,
        moveTo: moveToSpy,
        lineTo: lineToSpy,
        stroke: strokeSpy,
        closePath: closePathSpy
      };
      wrapper.instance().canvas = {
        width: 100,   // for clearRectSpy args
        height: 200,  ///
        getContext: () => context
      };
      wrapper.state().nodes.forEach(node => {
        node.x = node.y = 0;
        node.connectionColor = [0,0,0];
        node.movement.dir = 3;
        node.connectionAlphaDivisor = 5;
      });
      const nodeA = wrapper.state().nodes[0];
        // for the movement update 50/50 chance
      const MathRandomStub = sinon.stub(Math, 'random').returns(1);
      wrapper.instance().renderCanvas(performanceNow);
      requestAnimationFrameStub.restore();
      MathRandomStub.restore();
      const state = Object.assign({}, wrapper.state());

      it('must trigger clearRectSpy with args', () => {
        expect(clearRectSpy.calledWith(0, 0, 100, 200)).toBeTruthy();
      });

      describe('drawing nodes', () => {
        it('set fillStyle', () => {
          expect(context.fillStyle).toBe(nodeA.color);
        });
        it('set lineWidth', () => {
          expect(context.lineWidth).toBe(nodeA.connectionSize);
        });
        it('call beginPath()', () => {
          expect(beginPathSpy.called).toBeTruthy();
        });
        it('call arc() with args', () => {
          expect(arcSpy.calledWith(
            nodeA.x, nodeA.y, nodeA.radius, 0, Math.PI*2, false
          )).toBeTruthy();
        });
        it('call fill()', () => {
          expect(fillSpy.called).toBeTruthy();
        });
      });

      describe('drawing node connections', () => {
        it('strokeStyle', () => {
            // 1: max alpha, 0: node distance
          const alpha = (1 - (0 / nodeA.connectionThreshold)) / nodeA.connectionAlphaDivisor;
          expect(context.strokeStyle).toBe('rgba(0,0,0,' + alpha + ')');
        });
        it('call moveTo() with args', () => {
          expect(moveToSpy.calledWith(nodeA.x, nodeA.y)).toBeTruthy();
        });
        it('call lineTo() with args', () => {
          expect(lineToSpy.calledWith(nodeA.x, nodeA.y)).toBeTruthy();
        });
        it('call stroke()', () => {
          expect(strokeSpy.called).toBeTruthy();
        });
        it('call closePath()', () => {
          expect(closePathSpy.called).toBeTruthy();
        });
      });

      describe('update node position and movement', () => {
        it('must update the position', () => {
          expect(state.nodes[0]).toMatchObject({
            x: nodeA.x + nodeA.movement.x,
            y: nodeA.y + nodeA.movement.y
          });
        });
        it('must update the movement direction', () => {
          expect(state.nodes[0].movement.dir).toBeGreaterThanOrEqual(
            nodeA.movement.dir - 1
          );
          expect(state.nodes[0].movement.dir).toBeLessThanOrEqual(
            nodeA.movement.dir + 1
          );
        });

        describe('out of bound enabled', () => {
          it('must update the position correct', () => {
            const MathCeilStub = sinon.stub(Math, 'ceil').returns(33);
            wrapper.setProps({
              width: 1,
              height: 1,
              enableOutOfBound: true
            });
            wrapper.instance().canvas = {
              getContext: () => context
            };
            wrapper.state().nodes[0].x = 5; // node out of bound
            wrapper.instance().renderCanvas();
            MathCeilStub.restore();
            expect(wrapper.state().nodes[0]).toMatchObject({
              x: 33,
              y: 33
            });
          });
        });
      });

      describe('state update', () => {
        it('must trigger requestAnimationFrame with renderCanvas()', () => {
          expect(requestAnimationFrameStub.calledWith(wrapper.instance().renderCanvas)).toBeTruthy();
        });
        it('must set state:animationFrame with the return value of requestAnimationFrame', () => {
          expect(state.animationFrame).toBe(3);
        });
        it('must set state:lastMovementUpdate to the timestamp input argument', () => {
          expect(state.lastMovementUpdate).toBe(performanceNow);
        });
      });
    });
  });
});
