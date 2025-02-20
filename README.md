# physx
A-Frame physics using PhysX - based on an [original implementation by Zach Capalbo](https://vartiste.xyz/docs.html#physics.js)

For examples of usage, see:

[Examples](examples/README.md)



## Installation

There is just one main JS module, `physx.js`, which triggers download of a specified additional wasm module.

The URL for the PhysX wasm module is specified on the `physx` component schema - but the default settings should work for most cases.

### Installation via Script Tags

You can either download the module from the `dist`  directory of this repo and include them like this:

```
<script src="physx.js"></script>
```

Or you can download via JSDelivr CDN (specifying the version number you want to use)

```
<script src="https://cdn.jsdelivr.net/gh/c-frame/physx@latest/dist/physx.min.js"></script>
```

### Installation via npm

Not supported yet - if you want this, please raise an issue.  PRs also welcome!



## Build

Clone this repo, and run

`npm install`

To run for development purposes, run: 

`npm run dev` or `npm start`

Examples can be viewed at /examples

To build (both development & production builds), run:

`npm run dist`


## System `physx` 

Implements the a physics system using an emscripten compiled PhysX engine.

If `autoLoad` is `true`, or when you call `startPhysX()`, the `physx` system will automatically load and initialize the physics system with reasonable defaults and a ground plane. All you have to do is add [`physx-body`](#component-physx-body) to the bodies that you want to be part of the simulation. The system will take try to take care of things like collision meshes, position updates, etc automatically. The simplest physics scene looks something like:

```
<a-scene physx="autoLoad: true">
 <a-assets><a-asset-item id="#mymodel" src="..."></a-asset-item></a-assets>

 <a-box physx-body="type: static" color="green" position="0 0 -3"></a-box>
 <a-sphere physx-body="type: dynamic" position="0.4 2 -3" color="blue"></a-sphere>
 <a-entity physx-body="type: dynamic" position="0 5 -3" gltf-model="#mymodel"></a-entity>
</a-scene>
```

If you want a little more control over how things behave, you can set the [`physx-material`](#component-physx-material) component on the objects in your simulation, or use [`physx-joint`s](#component-physx-joint), [`physx-joint-constraint`s](#component-physx-joint-constraint) and [`physx-joint-driver`s](#component-physx-joint-driver) to add some complexity to your scene.

If you need more low-level control, the PhysX bindings are exposed through the `PhysX` property of the system. So for instance, if you wanted to make use of the [`PxCapsuleGeometry`](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxapi/files/classPxCapsuleGeometry.html) in your own component, you would call:

```
   let myGeometry = new this.el.sceneEl.PhysX.PxCapsuleGeometry(1.0, 2.0)
```

The system uses [Zach Capalbo's fork](https://github.com/zach-capalbo/PhysX) of PhysX, built using the [Docker Wrapper](https://github.com/ashconnell/physx-js). To see what's exposed to JavaScript, see [PxWebBindings.cpp](https://github.com/zach-capalbo/PhysX/blob/emscripten_wip/physx/source/physxwebbindings/src/PxWebBindings.cpp)

For a complete example of how to use this, you can see the [aframe-vartiste-toolkit Physics Playground](https://glitch.com/edit/#!/fascinated-hip-period?path=index.html)

It is also helpful to refer to the [NVIDIA PhysX documentation](https://gameworksdocs.nvidia.com/PhysX/4.0/documentation/PhysXGuide/Manual/Index.html)

### physx Schema

| Property              | Type             | Default                                                      | Description                                                  |
| --------------------- | ---------------- | ------------------------------------------------------------ | ------------------------------------------------------------ |
| delay                 | number           | 5000                                                         | Amount of time to wait after loading before starting the physics. Can be useful if there is still some things loading or initializing elsewhere in the scene |
| throttle              | number           | 10                                                           | Throttle for running the physics simulation. On complex scenes, you can increase this to avoid dropping video frames |
| autoLoad              | boolean          | false                                                        | If true, the PhysX will automatically be loaded and started. If false, you will have to call `startPhysX()` manually to load and start the physics engine |
| speed                 | number           | 1                                                            | Simulation speed multiplier. Increase or decrease to speed up or slow down simulation time |
| wasmUrl               | string           | https://cdn.jsdelivr.net/gh/c-frame/physx/wasm/physx.release.wasm | URL for the PhysX WASM bundle.                               |
| useDefaultScene       | boolean          | true                                                         | If true, sets up a default scene with a ground plane and bounding cylinder. |
| wrapBounds            | boolean          | false                                                        | NYI                                                          |
| groundCollisionLayers | string           |                                                              | Which collision layers the ground belongs to                 |
| groundCollisionMask   | string           |                                                              | Which collision layers will collide with the ground          |
| gravity               | vec3             | { x: 0, y: -9.8, z: 0 }                                      | Global gravity vector                                        |
| stats                 | array of strings |                                                              | Where to output performance stats (if any), `panel`, `console`, `events` (or some combination). <br />- `panel` output stats to a panel similar to the A-Frame stats panel.<br />-`events` generates `physics-tick-timer` events, which can be processed externally.<br/> -`console`outputs stats to the console. |

### physx Methods

| Signature       | Description                           |
| --------------- | ------------------------------------- |
| startPhysX `()` | Loads PhysX and starts the simulation |

------



## Component `physx-material`

Controls physics properties for individual shapes or rigid bodies. You can set this either on an entity with the `phyx-body` component, or on a shape or model contained in an entity with the `physx-body` component. If it's set on a `physx-body`, it will be the default material for all shapes in that body. If it's set on an element containing geometry or a model, it will be the material used for that shape only.

For instance, in the following scene fragment:

```
<a-entity id="bodyA" physx-body physx-material="staticFriction: 0.5">
  <a-box id="shape1" physx-material="staticFriction: 1.0"></a-box>
  <a-sphere id="shape2"></a-sphere>
</a-entity>
<a-cone id="bodyB" physx-body></a-cone>
```

`shape1`, which is part of the `bodyA` rigid body, will have static friction of 1.0, since it has a material set on it. `shape2`, which is also part of the `bodyA` rigid body, will have a static friction of 0.5, since that is the body default. `bodyB` will have the component default of 0.2, since it is a separate body.

### physx-material Schema

| Property           | Type   | Default        | Description                                                  |
| ------------------ | ------ | -------------- | ------------------------------------------------------------ |
| staticFriction     | number | 0.2            | Static friction                                              |
| dynamicFriction    | number | 0.2            | Dynamic friction                                             |
| restitution        | number | 0.2            | Restitution, or "bounciness"                                 |
| density            | number |                | Density for the shape. If densities are specified for *all* shapes in a rigid body, then the rigid body's mass properties will be automatically calculated based on the different densities. However, if density information is not specified for every shape, then the mass defined in the overarching [`physx-body`](#component-physx-body) will be used instead. |
| collisionLayers    | array  | [1]            | Which collision layers this shape is present on              |
| collidesWithLayers | array  | [ 1, 2, 3, 4 ] | Array containing all layers that this shape should collide with |
| collisionGroup     | number | 0              | If `collisionGroup` is greater than 0, this shape will *not* collide with any other shape with the same `collisionGroup` value |
| contactOffset      | string |                | If >= 0, this will set the PhysX contact offset, indicating how far away from the shape simulation contact events should begin. |
| restOffset         | string |                | If >= 0, this will set the PhysX rest offset                 |

------



## Component `physx-body`

Turns an entity into a PhysX rigid body. This is the main component for creating physics objects.

**Types**

There are 3 types of supported rigid bodies. The type can be set by using the `type` proeprty, but once initialized cannot be changed.

- `dynamic` objects are objects that will have physics simulated on them. The entity's world position, scale, and rotation will be used as the starting condition for the simulation, however once the simulation starts the entity's position and rotation will be replaced each frame with the results of the simulation.
- `static` objects are objects that cannot move. They can be used to create collidable objects for `dynamic` objects, or for anchor points for joints.
- `kinematic` objects are objects that can be moved programmatically, but will not be moved by the simulation. They can however, interact with and collide with dynamic objects. Each frame, the entity's `object3D` will be used to set the position and rotation for the simulation object.

**Shapes**

When the component is initialized, and on the `object3dset` event, all visible meshes that are descendents of this entity will have shapes created for them. Each individual mesh will have its own convex hull automatically generated for it. This means you can have reasonably accurate collision meshes both from building up shapes with a-frame geometry primitives, and from importing 3D models.

Visible meshes can be excluded from this shape generation process by setting the `physx-no-collision` attribute on the corresponding `a-entity` element. Invisible meshes can be included into this shape generation process by settingt the `physx-hidden-collision` attribute on the corresponding `a-entity` element. This can be especially useful when using an external tool (like [Blender V-HACD](https://github.com/andyp123/blender_vhacd)) to create a low-poly convex collision mesh for a high-poly or concave mesh. This leads to this pattern for such cases:

```
   <a-entity physx-body="type: dynamic">
     <a-entity gltf-model="HighPolyOrConcaveURL.gltf" physx-no-collision=""></a-entity>
     <a-entity gltf-model="LowPolyConvexURL.gltf" physx-hidden-collision="" visible="false"></a-entity>
   </a-entity>
```

Note, in such cases that if you are setting material properties on individual shapes, then the property should go on the collision mesh entity

### physx-body Schema

| Property            | Type    | Default              | Description                                                  |
| ------------------- | ------- | -------------------- | ------------------------------------------------------------ |
| type                | string  | dynamic              | **[dynamic, static, kinematic]** Type of the rigid body to create |
| mass                | number  | 1                    | Total mass of the body                                       |
| angularDamping      | number  | 0                    | If > 0, will set the rigid body's angular damping            |
| linearDamping       | number  | 0                    | If > 0, will set the rigid body's linear damping             |
| emitCollisionEvents | boolean | false                | If set to `true`, it will emit `contactbegin` and `contactend` events when collisions occur |
| highPrecision       | boolean | false                | If set to `true`, the object will receive extra attention by the simulation engine (at a performance cost). |
| shapeOffset         | vec3    | { x: 0, y: 0, z: 0 } |                                                              |

### physx-body Methods

| Signature          | Description              |
| ------------------ | ------------------------ |
| toggleGravity `()` | Turns gravity on and off |

------



## Component `physx-joint-driver` 

Creates a driver which exerts force to return the joint to the specified (currently only the initial) position with the given velocity characteristics.

This can only be used on an entity with a `physx-joint` component. Currently only supports **D6** joint type. E.g.

```
<a-box physx-body>
   <a-entity position="0.2 0.3 0.4" rotation="0 90 0"
             physx-joint="type: D6; target: #other-body"
             physx-joint-driver="axes: swing, twist; stiffness: 30; angularVelocity: 3 3 0">
   </a-entity>
</a-box>
```

### physx-joint-driver Schema

| Property        | Type    | Default                | Description                                                  |
| --------------- | ------- | ---------------------- | ------------------------------------------------------------ |
| axes            | array   | []                     | Which axes the joint should operate on. Should be some combination of `x`, `y`, `z`, `twist`, `swing` |
| stiffness       | number  | 1                      | How stiff the drive should be                                |
| damping         | number  | 1                      | Damping to apply to the drive                                |
| forceLimit      | number  | 3.4028234663852886e+38 | Maximum amount of force used to get to the target position   |
| useAcceleration | boolean | true                   | If true, will operate directly on body acceleration rather than on force |
| linearVelocity  | vec3    | { x: 0, y: 0, z: 0 }   | Target linear velocity relative to the joint                 |
| angularVelocity | vec3    | { x: 0, y: 0, z: 0 }   | Targget angular velocity relative to the joint               |
| lockOtherAxes   | boolean | false                  | If true, will automatically lock axes which are not being driven |
| slerpRotation   | boolean | true                   | If true SLERP rotation mode. If false, will use SWING mode.  |

------



## Component `physx-joint-constraint` 

Adds a constraint to a [`physx-joint`](#component-physx-joint). Currently only **D6** joints are supported.

Can only be used on an entity with the `physx-joint` component. You can set multiple constraints per joint. Note that in order to specify attributes of individual axes, you will need to use multiple constraints. For instance:

```
<a-box physx-body>
  <a-entity physx-joint="type: D6"
            physx-joint-constraint__xz="constrainedAxes: x,z; linearLimit: -1 20"
            physx-joint-constraint__y="constrainedAxes: y; linearLimit: 0 3; stiffness: 3"
            physx-joint-constraint__rotation="lockedAxes: twist,swing"></a-entity>
</a-box>
```

In the above example, the box will be able to move from -1 to 20 in both the x and z direction. It will be able to move from 0 to 3 in the y direction, but this will be a soft constraint, subject to spring forces if the box goes past in the y direction. All rotation will be locked. (Note that since no target is specified, it will use the scene default target, effectively jointed to joint's initial position in the world)

### physx-joint-constraint Schema

| Property        | Type   | Default | Description                                                  |
| --------------- | ------ | ------- | ------------------------------------------------------------ |
| lockedAxes      | array  | []      | Which axes are explicitly locked by this constraint and can't be moved at all. Should be some combination of `x`, `y`, `z`, `twist`, `swing` |
| constrainedAxes | array  | []      | Which axes are constrained by this constraint. These axes can be moved within the set limits. Should be some combination of `x`, `y`, `z`, `twist`, `swing` |
| freeAxes        | array  | []      | Which axes are explicitly freed by this constraint. These axes will not obey any limits set here. Should be some combination of `x`, `y`, `z`, `twist`, `swing` |
| linearLimit     | vec2   |         | Limit on linear movement. Only affects `x`, `y`, and `z` axes. First vector component is the minimum allowed position |
| limitCone       | vec2   |         | Two angles specifying a cone in which the joint is allowed to swing, like a pendulum. |
| twistLimit      | vec2   |         | Minimum and maximum angles that the joint is allowed to twist |
| damping         | number | 0       | Spring damping for soft constraints                          |
| restitution     | number | 0       | Spring restitution for soft constraints                      |
| stiffness       | number | 0       | If greater than 0, will make this joint a soft constraint, and use a spring force model |

------



## Component `physx-joint`

Creates a PhysX joint between an ancestor rigid body and a target rigid body.

The `physx-joint` is designed to be used either on or within an entity with the `physx-body` component. For instance:

```
<a-entity physx-body="type: dynamic">
  <a-entity physx-joint="target: #other-body" position="1 0 0"></a-entity>
</a-entity>
```

The position and rotation of the `physx-joint` will be used to create the corresponding PhysX joint object. Multiple joints can be created on a body, and multiple joints can target a body.

**Stapler Example**

Here's a simplified version of the stapler from the [physics playground demo]()

```
<a-entity id="stapler">
  <a-entity id="stapler-top" physx-body="type: dynamic" class="grab-root">
    <a-entity class="clickable" propogate-grab="" gltf-part-plus="src: #asset-stapler; part: Top"></a-entity>
    <a-entity physx-joint="target: #stapler-bottom; type: Revolute; collideWithTarget: true" position="0 0.0254418 -3.7280"></a-entity>
  </a-entity>
  <a-entity id="stapler-bottom" gltf-part-plus="src: #asset-stapler; part: Bottom" physx-body="type: dynamic"></a-entity>
</a-entity>
```

Notice the joint is created between the top part of the stapler (which contains the joint) and the bottom part of the stapler at the position of the `physx-joint` component's entity. This will be the pivot point for the stapler's rotation.

![Stapler with joint highlighted](https://vartiste.xyz/bce1dc6210d4b9aa9db6.png)

### physx-joint Schema

| Property          | Type     | Default          | Description                                                  |
| ----------------- | -------- | ---------------- | ------------------------------------------------------------ |
| type              | string   | Spherical        | Rigid body joint type to use. See the [NVIDIA PhysX joint documentation](https://gameworksdocs.nvidia.com/PhysX/4.0/documentation/PhysXGuide/Manual/Joints.html) for details on each type |
| target            | selector |                  | Target object. If specified, must be an entity having the `physx-body` component. If no target is specified, a scene default target will be used, essentially joining the joint to its initial position in the world. |
| breakForce        | vec2     | { x: -1, y: -1 } | Force needed to break the constraint. First component is the linear force, second component is angular force. Set both components are >= 0 |
| removeElOnBreak   | boolean  | false            | If true, removes the entity containing this component when the joint is broken. |
| collideWithTarget | boolean  | false            | If false, collision will be disabled between the rigid body containing the joint and the target rigid body. |
| softFixed         | boolean  | false            | When used with a D6 type, sets up a "soft" fixed joint. E.g., for grabbing things |



## Collision Events

If `emitCollisionEvents` is set of a `physx-body` then `contactbegin` and `contactend` events are emitted on that entity when it collides with other bodies.

---------

Note the important restriction that **SDK state changes are not permitted from an event callback** ([full details here](https://gameworksdocs.nvidia.com/PhysX/4.1/documentation/physxguide/Manual/Simulation.html#callback-sequence)).  This means that you should never add / remove / modify bodies, materials, joints, etc. directly from a collision event callback.

If you need to make such changes in response to a collision event, you can use setTimeout() with a zero timer to delay the update until the physics processing for this tick has completed.

--------

These events include a `detail` object with the following properties:

| Property       | Description                                                  |
| -------------- | ------------------------------------------------------------ |
| thisShape      | A `PxShape` for the shape within this body involved in the collision.  This can be used to look up the `physx-body` that owns the shape using `this.shapeMap` on the `phsyx` component on the scene.  For a compound shape, there is currently no way to map this back to a specific object3D that corresponds to the shape in question. |
| otherShape     | A `PxShape` for the shape within the other body involved in the collision.  See row above for what can be done with this. |
| points         | The set of contact points, a `PxVec3Vector`.  Read length from `points.size()`, then access using `points.get(index)` for each index < `size`, which returns a JS object with properties x, y & z (like a THREE.Vector3, but not actually one).<br /><br />This will be null on a `contactend` event. |
| impulses       | The set of impulses at these contact points, a `VectorPxReal`.  Read length from `impulses.size()`, then access using `impulses.get(index)` for each index < `size`, which returns a number.<br /><br />This will be null on a `contactend` event. |
| otherComponent | The `physx-body` component for the other object in the collision. |



## Statistics

The following statistics are available from PhysX.  Each of these is refreshed every 100 ticks (i.e. every 100 frames).

| Statistic | Meaning                                                      |
| --------- | ------------------------------------------------------------ |
| Static    | The number of static bodies being handled by the physics engine. |
| Dynamic   | The number of dynamic bodies being handled by the physics engine. |
| Kinematic | The number of kinematic bodies being handled by the physics engine. |
| After     | The number of milliseconds per tick after invoking the physics engine.  Typically this is the time taken to synchronize the physics engine state into the scene, e.g. movements of dynamic bodies.<br />Median = median value in the last 100 ticks<br />90th % = 90th percentile value in the last 100 ticks<br />99th % = maximum recorded value over the last 100 ticks.<br />Note that unlike the physics implementations in aframe-physics-system, PhysX has no significant per-frame processing before invoking the physics engine, so the "after" statistic accounts for all the work done outside the PhysX WASM code. |
| Engine    | The number of milliseconds per tick actually running the physics engine.<br />Reported as Median / 90th / 99th percentiles, as above. |
| Total     | The total number of milliseconds of physics processing per tick: Engine + After.  Reported as Median / 90th / 99th percentiles, as above. |





## Acknowledgements

This repository is based on an original implementation of A-Frame physics using PhysX by [Zach Capalbo](https://vartiste.xyz/docs.html#physics.js)

Simplification into a standalone codebase by [Lee Stemkoski](https://stemkoski.github.io/A-Frame-Examples/)

