import React, { Component } from 'react';
import PropTypes from 'prop-types';
import createNode, { getRandomNodeMovement } from './node.js';
import './FloatingNodes.css';

export class FloatingNodes extends Component {
  constructor(props) {
    super(props);

    this.onMouseEnter = this.onMouseEnter.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseLeave = this.onMouseLeave.bind(this);
    this.onMouseDown = this.onMouseDown.bind(this);
    this.renderCanvas = this.renderCanvas.bind(this);
  }

  componentDidMount() {
    this.onStart();
  }

  componentWillReceiveProps(nextProps) {
      // resume the animation if it was previously paused
    if (nextProps.pauseAnimation === true && nextProps.pauseAnimation !== this.props.pauseAnimation)
      this.onResume();
  }

  shouldComponentUpdate(nextProps) {
      // only re-render on element dimension change
    if (nextProps.width !== this.props.width
      || nextProps.height !== this.props.height)
      return true;
    return false;
  }

  componentWillUnmount() {
      // stop the animation frame
    this.onStop();
  }

    // create the starting nodes and begin the animation
  onStart() {
      // initial amount of nodes to render
      // the default initial node count is 2.5x the square root of the canvas area
    const nodeCount = (this.props.initialNodeCount !== undefined)
      ? this.props.initialNodeCount
        : Math.sqrt(this.props.width + this.props.height)*2.5;

      // generate X nodes with random positions
    const nodes = [];
    for(let i = 0; i < nodeCount; i++) {
      nodes[i] = createNode({
        ...this.props.nodeParams,
        x: Math.ceil(Math.random() * this.props.width),
        y: Math.ceil(Math.random() * this.props.height)
      });
    }

    this.setState({
      nodes: nodes,
      animationFrame: requestAnimationFrame(this.renderCanvas)  // starts the rendering process
    });
  }

  onStop() {
    cancelAnimationFrame(this.state.animationFrame);
  }

  onResume() {
    this.setState({animationFrame: requestAnimationFrame(this.renderCanvas)});
  }

    // add a node which is following the mouse
  onMouseEnter() {
    if (!this.props.enableInteraction)
      return;

      // create the interactive node
    this.setState({
      cursorNode: createNode({...this.props.interactiveNodeParams})
    });
  }

    // update the mouse node position
  onMouseMove(event) {
    if (!this.state.cursorNode)
      return;

      // set the new interactive node position
    const clientRect = this.canvas.getBoundingClientRect();
    const clientX = event.clientX;
    const clientY = event.clientY;
    this.setState(prevState => ({
      cursorNode: Object.assign({}, prevState.cursorNode, {
        x: clientX - clientRect.left,
        y: clientY - clientRect.top,
      })
    }));
  }

    // remove the mouse node
  onMouseLeave() {
    if (!this.state.cursorNode)
      return;

    this.setState({cursorNode: null});
  }

    // create X new persistent nodes at the mouse position
  onMouseDown(event) {
      // are node drops enabled?
    if (!this.props.enableNodeDrop) return;

    const clientRect = this.canvas.getBoundingClientRect();
    const x = event.clientX - clientRect.left;
    const y = event.clientY - clientRect.top;
    this.setState(prevState => {
      const dropParams = this.props.nodeDropParams || {};
      const dropAmount = dropParams.amount || 1;  // default drop amount
      const dropNodes = [];
      for (let i = 0; i < dropAmount; i++) {
        dropNodes[i] = createNode({
          ...dropParams.nodeParams,
          x: x,
          y: y
        });
      }

        // add the new nodes to the persistent ones
      const nodes = prevState.nodes.concat(dropNodes);

        // if the dropped nodes exceeeds the node drop limit
        // remove the amount of exceeeding nodes from the persistent nodes
      let dropNodeCount = (prevState.dropNodeCount || 0) + dropAmount;
      if (dropParams.limit) {
        while(dropNodeCount > dropParams.limit) {
          dropNodeCount--;
          nodes.shift();
        }
      }

      return {
        nodes: nodes,
        dropNodeCount: dropNodeCount
      }
    });
  }

    // render the nodes and its connections
  renderCanvas(timestamp) {
    if (this.props.pauseAnimation)
      return this.onStop();

      // will contain the nodes with the updated position & direction
    let nodesUpdated = Object.assign([], this.state.nodes);
      // all nodes including the cursor node
    const nodes = (!this.state.cursorNode)
      ? this.state.nodes
        : this.state.nodes.concat([this.state.cursorNode]);

      // update the movement for each node every X seconds
      // default: 0.7 seconds
    const updateMovement = (
      (performance.now() - this.state.lastMovementUpdate) / 1000
      >= (this.props.movementUpdateTime || 0.7)
    ) ? true : false;

    const ctx = this.canvas.getContext('2d');
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // clear the canvas before redrawing

    nodes.forEach((node, index) => {
        // draw node
      ctx.fillStyle = node.color;           // node fill color
      ctx.lineWidth = node.connectionSize;  // connection line width
      ctx.beginPath();
      ctx.arc(
        node.x,         // pos x
        node.y,         // pos y
        node.radius,    // radius
        0,              // startAngle
        Math.PI * 2,    // endAngle
        false           // anticlockwise
      );
      ctx.fill();       // draw the node

        // draw connections
      nodes.forEach((_node, _index) => {
        if (_index === index) return;
          // distance between 2 nodes (Pythagoras: c^2 = a^2 + b^2)
        const xd = _node.x - node.x;
        const yd = _node.y - node.y;
        const distance = Math.sqrt((xd*xd) + (yd*yd));
        if (distance <= node.connectionThreshold) {
            // draw a connection if the distance is within the threshold
            // the connection gets more transparent the farther away it is
          ctx.strokeStyle = 'rgba(' + node.connectionColor[0] + // r
                            ',' + node.connectionColor[1] +     // g
                            ',' + node.connectionColor[2] +     // b
                            ',' + ((node.connectionStaticAlpha !== false)
                              ? node.connectionStaticAlpha      // static alpha value
                                : (1 - (distance / node.connectionThreshold)) / node.connectionAlphaDivisor) + ')';  // dynamic alpha value
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(_node.x, _node.y);
          ctx.stroke();
          ctx.closePath();
        }
      });

        // update the node's position & direction
      if (nodesUpdated[index]) {
        const nx = node.x + nodesUpdated[index].movement.x;
        const ny = node.y + nodesUpdated[index].movement.y;
          // if out of bound is enabled, reset the node if its out of bound
        if (this.props.enableOutOfBound
          && ((nx > this.props.width || nx < 0) || (ny > this.props.height || ny < 0))) {
            // define a new random position for the out of bound node
          nodesUpdated[index].x = Math.ceil(Math.random() * this.props.width);
          nodesUpdated[index].y = Math.ceil(Math.random() * this.props.height);
        } else {
            // update the node's position and update its direction
          nodesUpdated[index] = Object.assign({}, nodesUpdated[index], {
            x: nx, // new position y
            y: ny, // new position x
            movement: ((updateMovement && Math.random() > 0.5) // 50/50 chance to update the movement direction
              ? getRandomNodeMovement(nodesUpdated[index].speed, nodesUpdated[index].movement.dir) : nodesUpdated[index].movement)
          });
        }
      }
    });

    this.setState(prevState => ({
      nodes: nodesUpdated,
      animationFrame: requestAnimationFrame(this.renderCanvas),
      lastMovementUpdate: (updateMovement || !this.state.lastMovementUpdate) ? timestamp : prevState.lastMovementUpdate
    }));
  }

  render() {
    return (
      <div className="FloatingNodes-container">
        <canvas
          className="FloatingNodes-canvas"
          ref={canvas => this.canvas = canvas}
          width={this.props.width}
          height={this.props.height}
          onMouseEnter={this.onMouseEnter}
          onMouseMove={this.onMouseMove}
          onMouseLeave={this.onMouseLeave}
          onMouseDown={this.onMouseDown}
        />
      </div>
    );
  }
}

FloatingNodes.propTypes = {
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
  nodeParams: PropTypes.shape({
    color: PropTypes.arrayOf(PropTypes.number),
    speed: PropTypes.number,
    radiusRange: PropTypes.shape({
      min: PropTypes.number,
      max: PropTypes.number
    }),
    connectionSize: PropTypes.number,
    connectionColor: PropTypes.arrayOf(PropTypes.number),
    connectionThreshold: PropTypes.number,
    connectionAlphaDivisor: PropTypes.number,
    connectionStaticAlpha: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ])
  }),
  enableNodeDrop: PropTypes.bool,
  nodeDropParams: PropTypes.shape({
    amount: PropTypes.number,
    limit: PropTypes.number,
    nodeParams: PropTypes.shape({
      color: PropTypes.arrayOf(PropTypes.number),
      speed: PropTypes.number,
      radiusRange: PropTypes.shape({
        min: PropTypes.number,
        max: PropTypes.number
      }),
      connectionSize: PropTypes.number,
      connectionColor: PropTypes.arrayOf(PropTypes.number),
      connectionThreshold: PropTypes.number,
      connectionAlphaDivisor: PropTypes.number,
      connectionStaticAlpha: PropTypes.oneOfType([
        PropTypes.bool,
        PropTypes.number
      ])
    })
  }),
  enableInteraction: PropTypes.bool,
  interactiveNodeParams: PropTypes.shape({
    color: PropTypes.arrayOf(PropTypes.number),
    radius: PropTypes.number,
    connectionSize: PropTypes.number, // this is the outgoing connection size only !
    connectionColor: PropTypes.arrayOf(PropTypes.number),
    connectionThreshold: PropTypes.number,
    connectionAlphaDivisor: PropTypes.number,
    connectionStaticAlpha: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.number
    ])
  }),
  initialNodeCount: PropTypes.number,
  movementUpdateTime: PropTypes.number,
  enableOutOfBound: PropTypes.bool,
  pauseAnimation: PropTypes.bool
};

export default FloatingNodes;
