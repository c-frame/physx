AFRAME.registerComponent('physx-grab', {
  init: function () {

    this.GRABBED_STATE = 'grabbed';

    this.grabbing = false;
    this.hitEl =      /** @type {AFRAME.Element}    */ null;
    this.physics =    /** @type {AFRAME.System}     */ this.el.sceneEl.systems.physics;
    this.constraint = /** @type {CANNON.Constraint} */ null;

    // Bind event handlers
    this.onHit = this.onHit.bind(this);
    this.onGripOpen = this.onGripOpen.bind(this);
    this.onGripClose = this.onGripClose.bind(this);

  },

  play: function () {
    var el = this.el;
    el.addEventListener('collide', this.onHitCannon);
    el.addEventListener('collidestart', this.onHitAmmo);
    el.addEventListener('gripdown', this.onGripClose);
    el.addEventListener('gripup', this.onGripOpen);
    el.addEventListener('trackpaddown', this.onGripClose);
    el.addEventListener('trackpadup', this.onGripOpen);
    el.addEventListener('triggerdown', this.onGripClose);
    el.addEventListener('triggerup', this.onGripOpen);
  },

  pause: function () {
    var el = this.el;
    el.removeEventListener('collide', this.onHitCannon);
    el.removeEventListener('collidestart', this.onHitAmmo);
    el.removeEventListener('gripdown', this.onGripClose);
    el.removeEventListener('gripup', this.onGripOpen);
    el.removeEventListener('trackpaddown', this.onGripClose);
    el.removeEventListener('trackpadup', this.onGripOpen);
    el.removeEventListener('triggerdown', this.onGripClose);
    el.removeEventListener('triggerup', this.onGripOpen);
  },

  onGripClose: function (evt) {
    this.grabbing = true;
  },

  onGripOpen: function (evt) {
    var hitEl = this.hitEl;
    this.grabbing = false;
    if (!hitEl) { return; }
    hitEl.removeState(this.GRABBED_STATE);

    if (this.driver === "cannon") {
      this.system.removeConstraint(this.constraint);
      this.constraint = null;
    }
    else {
      // Ammo
      this.hitEl.removeAttribute(`ammo-constraint__${this.el.id}`)
    }
    this.hitEl = undefined;
    
  },

  onHit: function (evt) {
    var hitEl = evt.detail.targetEl;
    // If the element is already grabbed (it could be grabbed by another controller).
    // If the hand is not grabbing the element does not stick.
    // If we're already grabbing something you can't grab again.
    if (!hitEl || hitEl.is(this.GRABBED_STATE) || !this.grabbing || this.hitEl) { return; }
    hitEl.addState(this.GRABBED_STATE);
    this.hitEl = hitEl;

    this.addJoint(hitEl, this.el)
  },

  addJoint(el, target) {

    if (this.joint) {
      removeJoint(joint)
    }

    this.joint = document.createElement('a-entity') 
    this.joint.setAttribute("physx-joint", `target: ${target.el.id}`)
    this.joint.setAttribute("physx-joint-constraint", "lockedAxes: xyz, linearLimit: 0 0")

    this.el.appendChild(this.joint)
  },

  removeJoint(joint) {

    joint.parentEl.removeChild(joint)
  }
});
