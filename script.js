;(function() {
  class Vector {
    constructor(x, y) {
      this.x = x
      this.y = y
    }
  }

  window.KwnVector = Vector

  class KwnIntro {
    updateSizes() {
      this.state.winW = window.innerWidth
      this.state.winH = window.innerHeight
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    getRatiosDiffs() {
      const { winW, winH, bgW, bgH } = this.state

      const winR = winW / winH
      const bgR = bgW / bgH

      const scale = winR < bgR ? bgH / winH : bgW / winW

      const diffX = (bgW - winW * scale) / 2
      const diffY = (bgH - winH * scale) / 2

      return { diffX, diffY, scale }
    }

    saveVec(vec) {
      const { diffX, diffY, scale } = this.getRatiosDiffs()
      const x = scale * vec.x + diffX
      const y = scale * vec.y + diffY
      return new Vector(x, y)
    }

    restoreVec(vec) {
      const { diffX, diffY, scale } = this.getRatiosDiffs()
      const x = (1 / scale) * (vec.x - diffX)
      const y = (1 / scale) * (vec.y - diffY)
      return new Vector(x, y)
    }

    saveW(x) {
      const { scale } = this.getRatiosDiffs()
      return x * scale
    }

    saveH(x) {
      const { scale } = this.getRatiosDiffs()
      return x * scale
    }

    restoreW(x) {
      const { scale } = this.getRatiosDiffs()
      return x * (1 / scale)
    }

    restoreH(x) {
      const { scale } = this.getRatiosDiffs()
      return x * (1 / scale)
    }

    render() {
      const ctx = this.ctx
      const state = this.state

      if (this.scale !== 1) ctx.scale(this.scale, this.scale)
      ctx.imageSmoothingEnabled = true

      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

      state.drawings.forEach(itm => {
        ctx.save()
        switch (itm.type) {
          case 'text':
            const { x, y } = this.restoreVec(itm.pos)
            const w = this.restoreW(itm.w)
            const h = this.restoreH(itm.h)
            ctx.font = `${h}px Arial`
            ctx.fillStyle = '#fff'
            ctx.fillText(itm.text, x, y + h)
        }
        ctx.restore()
      })

      this.renderHooks.forEach(hook => hook())

      window.requestAnimationFrame(this.render)
    }

    constructor() {
      this.getRatiosDiffs = this.getRatiosDiffs.bind(this)
      this.render = this.render.bind(this)
      this.restoreH = this.restoreH.bind(this)
      this.restoreVec = this.restoreVec.bind(this)
      this.restoreW = this.restoreW.bind(this)
      this.saveH = this.saveH.bind(this)
      this.saveVec = this.saveVec.bind(this)
      this.saveW = this.saveW.bind(this)
      this.updateSizes = this.updateSizes.bind(this)

      this.scale =
        typeof window.devicePixelRatio === 'number'
          ? window.devicePixelRatio
          : 1

      this.renderHooks = []

      this.state = {
        bgW: 1491,
        bgH: 1000,
        winH: window.innerHeight,
        winW: window.innerWidth,
        drawings: [],
      }

      this.canvas = document.querySelector('#canvas')
      this.ctx = canvas.getContext('2d')

      window.requestAnimationFrame(this.render)

      window.addEventListener('resize', this.updateSizes)
      this.updateSizes()
    }
  }

  window.kwnIntro = new KwnIntro()
})()
