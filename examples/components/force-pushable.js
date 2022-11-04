/**
 * Force Pushable component.
 *
 * Applies behavior to the current entity such that cursor clicks will apply a
 * strong impulse, pushing the entity away from the viewer.
 *
 * Requires: physx
 */
AFRAME.registerComponent('physx-force-pushable', {
  schema: {
    force: { default: 10 }
  },
  init: function () {

    this.pStart = new THREE.Vector3();
    this.sourceEl = this.el.sceneEl.querySelector('[camera]');
    this.el.addEventListener('click', this.forcePushPhysX.bind(this));

    this.force = new THREE.Vector3();
    this.pos = new THREE.Vector3();
  },

  forcePushPhysX: function (e) {

    if(!PhysX) return;

    const el = this.el
    if (!el.components['physx-body']) return
    const body = el.components['physx-body'].rigidBody
    if (!body) return

    const force = this.force
    force.copy(el.object3D.position)
    force.normalize();

    // not sure about units, but force seems stronger with PhysX than Cannon, so scaling down
    // by a factor of 5.
    force.multiplyScalar(this.data.force / 5);

    // use data from intersection to determine point at which to apply impulse.
    const pos = this.pos
    pos.copy(e.detail.intersection.point)
    el.object3D.worldToLocal(pos)

    body.addImpulseAtLocalPos(force, pos);
  }
});
