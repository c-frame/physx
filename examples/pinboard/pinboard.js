// creates a pinboard height x width, + 2m at top & bottom, laid flat.
AFRAME.registerComponent('pinboard', {

    schema: {
        physics: {type: 'string'}, // physx or ammo.
        width: {type: 'number', default: 10},
        height: {type: 'number', default: 10},
    },

    init() {

        const width = this.data.width;
        const height = this.data.height;

        const createBox = (width, height, depth, x, y, z, color, yRot) => {
            const box = document.createElement('a-box');
            box.setAttribute('width', width)
            box.setAttribute('height', height)
            box.setAttribute('depth', depth)
            box.setAttribute('color', color)

            if (this.data.physics === "ammo") {
                box.setAttribute('ammo-body', 'type:static')
                box.setAttribute('ammo-shape', 'type:box;fit:all')
            }
            else {
                box.setAttribute('physx-body', 'type:static')
            }
            
            box.object3D.position.set(x, y, z)
            box.object3D.rotation.set(0, yRot, 0)
            this.el.appendChild(box)

            return box
        }

        this.base = createBox(width, 1, height + 4, 0, -0.5, 0, 'grey', 0)
        createBox(0.1, 2, height + 4, width / 2 + 0.05, 0, 0, 'grey', 0)
        createBox(0.1, 2, height + 4, -width / 2 - 0.05, 0, 0, 'grey', 0)

        for (let ii = 0; ii < this.data.height; ii++) {
            const even = ii % 2
            for (let jj = 0; jj < this.data.width - 1; jj++) {

                createBox(0.1, 1, 0.1,
                          jj - width / 2  + even / 2 + 0.75,
                          0.5,
                          ii - height / 2 + 0.5,
                          'black',
                          Math.PI / 4)
            }
        }
    }
})

AFRAME.registerComponent('dynamic-ball', {

    schema: {
        physics: {type: 'string'}, // physx or ammo.
        yKill: {type: 'number', default: -10}
    },

    init() {
        const el = this.el
        el.setAttribute('radius', 0.3)

        if (this.data.physics === "ammo") {
            el.setAttribute('ammo-body', 'type:dynamic')
            el.setAttribute('ammo-shape', 'type:sphere; fit:all')
            
        }
        else {
            el.setAttribute('physx-body', 'type:dynamic')
        }
        
        el.setAttribute('color', 'yellow')
    },

    tick() {
        if (this.el.object3D.position.y < this.data.yKill) {
            this.el.emit("recycle")
        }
    }
})

AFRAME.registerComponent('ball-recycler', {

    schema: {
        physics: {type: 'string'}, // physx or ammo.
        ballCount: {type: 'number', default: 10},
        width: {type: 'number', default: 8}, // width of spawn field
        depth: {type: 'number', default: 8}, // depth of spawn field (after initial spawn balls always spawned at far depth)
        yKill: {type: 'number', default: -10}
    },

    init() {

        this.recycleBall = this.recycleBall.bind(this);

        // at start of day, spawn balls 
        for (let ii = 0; ii < this.data.ballCount; ii++) {

            this.createBall(false)
        }
    },

    createBall(recycled) {

        const { height, depth, width } = this.data
        const pos = this.el.object3D.position

        const ball = document.createElement('a-sphere')
            
        ball.setAttribute('dynamic-ball', {yKill: this.data.yKill,
                                           physics: this.data.physics})
        x = pos.x + Math.random() * width - width / 2
        z = recycled ? (pos.z -depth / 2) : (pos.z + Math.random() * depth - depth / 2)
        ball.object3D.position.set(x, pos.y, z)
        this.el.sceneEl.appendChild(ball)

        ball.addEventListener('recycle', this.recycleBall);

    },

    recycleBall(evt) {

        const ball = evt.target

        ball.parentNode.removeChild(ball);

        this.createBall(true)
    }
})


AFRAME.registerComponent('tick-time-display', {

    schema: {
        outputEl: {type: 'selector'},
        sceneOutputEl: {type: 'selector'}
    },

    init() {
        this.updateData = this.updateData.bind(this);

        this.el.sceneEl.addEventListener('physics-tick-timer', this.updateData)

    },

    updateData(evt) {

        this.data.outputEl.innerHTML = `${evt.detail.engine} engine / ${evt.detail.wrapper} wrapper`
        this.data.sceneOutputEl.setAttribute("text", `value: Average tick (msecs): ${evt.detail.engine} engine /  ${evt.detail.wrapper} wrapper`)
    }
})