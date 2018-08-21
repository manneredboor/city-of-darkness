;(function() {
  const Vector = window.KwnVector

  class Delegate {
    constructor() {
      this.listeners = []
    }

    fire() {
      this.listeners.forEach(fn => fn())
    }

    subscribe(fn) {
      if (this.listeners.indexOf(fn) === -1) {
        this.listeners.push(fn)
      }
    }

    unsubscribe(fn) {
      const index = this.listeners.indexOf(fn)
      if (index !== -1) {
        this.listeners.splice(index, 1)
      }
    }
  }

  class KwnEditor {
    loadStyles() {
      const style = document.createElement('link')
      style.rel = 'stylesheet'
      style.href = 'editor.css'
      document.head.appendChild(style)
    }

    createDrag(el, x, y) {
      const dragEl = document.createElement('div')
      dragEl.classList.add('editor-drag')
      el.appendChild(dragEl)

      let isDown = false
      let offset = new Vector(0, 0)
      let xOffset = 0
      let yOffset = 0

      const drag = (x, y) => {
        el.style.left = x + 'px'
        el.style.top = y + 'px'
      }

      drag(x, y)

      dragEl.addEventListener('mousedown', e => {
        isDown = !isDown
        dragEl.classList.toggle('active', isDown)
        offset = new Vector(e.pageX - el.offsetLeft, e.pageY - el.offsetTop)
      })

      window.addEventListener('mousemove', e => {
        if (!isDown) return
        drag(e.pageX - offset.x, e.pageY - offset.y)
      })
    }

    createWindow(x, y) {
      const el = document.createElement('div')
      el.classList.add('editor-window')
      document.body.appendChild(el)
      this.createDrag(el, x, y)
      const content = document.createElement('div')
      content.classList.add('editor-content')
      el.appendChild(content)
      return content
    }

    createButton({ text, onClick }) {
      const textButton = document.createElement('div')
      textButton.classList.add('editor-button')
      textButton.textContent = text
      this.wrap.appendChild(textButton)
      textButton.addEventListener('click', onClick)
    }

    renderHierarchy() {
      this.hierarchy.innerHTML = ''
      this.state.drawings.forEach((itm, i) => {
        const el = document.createElement('div')
        el.textContent = `${itm.type} ${itm.text}`
        el.classList.add('editor-hierarchy-item')
        el.addEventListener('click', () => (this.state.selected = i))
        this.hierarchy.appendChild(el)
      })
    }

    renderDot() {
      const ctx = this.intro.ctx
      ctx.save()
      ctx.beginPath()
      const { x, y } = this.restoreVec(this.state.dot)
      ctx.arc(x, y, 8, 0, 2 * Math.PI, false)
      ctx.fillStyle = 'yellow'
      ctx.fill()
      ctx.restore()
    }

    render() {
      const ctx = this.intro.ctx
      const state = this.state

      // this.renderDot()

      state.drawings.forEach((itm, i) => {
        ctx.save()
        switch (itm.type) {
          case 'text':
            const { x, y } = this.restoreVec(itm.pos)
            const w = this.restoreW(itm.w)
            const h = this.restoreH(itm.h)

            ctx.beginPath()
            ctx.rect(x, y, w, h)
            ctx.strokeStyle = '#fff'
            ctx.stroke()

            if (state.selected === i) {
              ctx.beginPath()
              ctx.rect(x, y - 20, 10, 10)
              ctx.fillStyle = '#fff'
              ctx.fill()
              if (state.isDown) {
                this.state.drawings[i].pos = this.saveVec(this.state.mouse)
              }
            }
        }
        ctx.restore()
      })
    }

    constructor() {
      this.render = this.render.bind(this)
      this.renderDot = this.renderDot.bind(this)
      this.renderHierarchy = this.renderHierarchy.bind(this)

      const intro = (this.intro = window.kwnIntro)
      const state = (this.state = intro.state)

      intro.renderHooks.push(this.render)

      this.stateUpdate = new Delegate()

      this.restoreH = intro.restoreH
      this.restoreVec = intro.restoreVec
      this.restoreW = intro.restoreW
      this.saveH = intro.saveH
      this.saveVec = intro.saveVec
      this.saveW = intro.saveW

      state.dot = new Vector(0, 0)
      state.isDown = false
      state.mouse = new Vector(0, 0)

      this.loadStyles()
      this.wrap = this.createWindow(20, 20)
      this.hierarchy = this.createWindow(20, 100)

      this.renderHierarchy()
      this.stateUpdate.subscribe(this.renderHierarchy)

      intro.canvas.addEventListener('mousemove', e => {
        const { mouse, isDown } = this.state
        this.state.mouse = new Vector(e.pageX, e.pageY)
        if (isDown) this.state.dot = this.saveVec(mouse)
      })

      intro.canvas.addEventListener('mousedown', e => {
        this.state.isDown = true
        this.state.dot = this.saveVec(this.state.mouse)
      })

      intro.canvas.addEventListener('mouseup', e => {
        this.state.isDown = false
      })

      // Text Button
      this.createButton({
        text: 'T',
        onClick: () => {
          const x = window.innerWidth / 2
          const y = window.innerHeight / 2
          state.drawings.push({
            pos: this.saveVec(new Vector(x, y)),
            text: 'LOLKEK',
            type: 'text',
            w: 400,
            h: 30,
          })
          this.stateUpdate.fire()
        },
      })
    }
  }

  window.kowloonEditor = new KwnEditor()
})()
