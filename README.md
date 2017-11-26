# FloatingNodes

[![npm](https://img.shields.io/npm/v/npm.svg)](https://www.npmjs.com/package/floatingnodes)
![Travis Build](https://travis-ci.org/SchwSimon/FloatingNodes.svg?branch=master)
[![License](https://img.shields.io/badge/license-ISC-blue.svg?style=flat)](https://opensource.org/licenses/ISC)

## Installation & Usage

```sh
npm install floatingnodes --save
```

### Include the Component

```js
import React from 'react'
import FloatingNodes from 'floatingnodes'

class Component extends React.Component {
  render() {
    return <FloatingNodes
      width={300}
      height={300}
    />
  }
}
```
This will produce something like this:  
![Example image](/example/example-image.png)

### Props

key | prop type / notes | example
----|---------|------
`width` | number (required) | `300`
`width` | number (required) | `300`
`nodeParams` | object | [see #nodeParams](#nodeparams)
`enableNodeDrop` | bool | `true`, `false`
`nodeDropParams` | object | [see #nodeDropParams](#nodedropparams)
`enableInteraction` | bool | `true`, `false`
`interactiveNodeParams` | object | [see #nodeParams](#nodeparams)
`initialNodeCount` | number | `25`
`movementUpdateTime` | number(every X seconds each nodes has a 50% chance to update their movement direction)  | `0.7`
`enableOutOfBound` | bool (out of bound nodes are getting a new random position) | `true`, `false`
`pauseAnimation` | bool | `true`, `false`

#### #nodeParams

key | prop type / notes | example
----|---------|------
`color` | array (of numbers) | `[0,255,0,0.9]`
`speed` | number (has no effect for `interactiveNodeParams`) | `0.1`
`radius` | number (fixed radius) | `6`
`radiusRange` | object (random radius, has no effect if `radius` is defined, has no effect for `interactiveNodeParams`) | `{min: 2, max: 8}`
`connectionSize` | number | `0.3`
`connectionColor` | array (of numbers) | `[0,0,255]`
`connectionThreshold` | number | `120`
`connectionAlphaDivisor` | number | `8`
`connectionStaticAlpha` | bool/number (if not false `connectionAlphaDivisor` has no effect) | `false`, `0.7`

#### #nodeDropParams

key | prop type / notes | example
----|---------|------
`amount` | number (nodes per drop) | `3`
`limit` | number (removes nodes over limit, `0` means no limit) | `6`
`nodeDropParams` | object | [see #nodeParams](#nodeparams)
