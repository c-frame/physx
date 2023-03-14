/**
 * Based on an original component by Don McCurdy in aframe-physics-system
 * 
 * Copyright (c) 2016 Don McCurdy
 * 
 * Rain of Entities component.
 *
 * Creates a spawner on the scene, which periodically generates new entities
 * and drops them from the sky. Objects falling below altitude=0 will be
 * recycled after a few seconds.
 *
 * Requires: physics
 */
AFRAME.registerComponent('rain-of-entities', {
  schema: {
    tagName:    { default: 'a-box' },
    components: { default: ['dynamic-body', 'force-pushable', 'color|#39BB82', 'scale|0.2 0.2 0.2'] },
    spread:     { default: 10, min: 0 },
    maxCount:   { default: 10, min: 0 },
    interval:   { default: 1000, min: 0 },
    lifetime:   { default: 10000, min: 0 }
  },
  init: function () {
    this.boxes = [];
    this.timeout = setInterval(this.spawn.bind(this), this.data.interval);
  },
  spawn: function () {
    if (this.boxes.length >= this.data.maxCount) {
      clearInterval(this.timeout);
      this.timeout= null;
      return;
    }

    var data = this.data,
        box = document.createElement(data.tagName);

    this.boxes.push(box);
    this.el.appendChild(box);

    box.setAttribute('position', this.randomPosition());
    data.components.forEach(function (s) {
      var parts = s.split('|');
      box.setAttribute(parts[0], parts[1] || '');
    });

    // Recycling is important, kids.
    setInterval(function () {
      if (box.object3D.position.y > 0) return;
      this.recycleBox(box);
    }.bind(this), this.data.lifetime);
    
  },
  randomPosition: function () {
    var spread = this.data.spread;
    return {
      x: Math.random() * spread - spread / 2,
      y: 3,
      z: Math.random() * spread - spread / 2
    };
  },

  recycleBox(box) {


    box.removeAttribute("physx-body")
    box.object3D.position.copy(this.randomPosition());
    box.object3D.quaternion.identity();
    box.setAttribute("physx-body", "")

  },

  remove() {
    if (this.timeout) {
      clearInterval(this.timeout)
    }
  }
});
