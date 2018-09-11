import 'vendor/numeric.min.js'
import { Vector, vec } from 'utils/Vector'
import initialState from 'utils/initialState'
import { getTransform } from 'utils/matrixTransform'
import bgMask from 'utils/mask'
import measureText from 'utils/measureText'
import { dewi, china } from 'utils/fontObserver'
import { scrollState } from 'utils/scroll'
import { minmax, rnd } from 'utils/math'
import { onResize, sizeState, resizeCanvases } from 'utils/resize'
const smokemachine = require('vendor/smoke')
const noise = (window as any).noise
require('./css/intro.css')

let onLoad: () => void
export const introLoading = new Promise(resolve => {
  onLoad = resolve
})

export interface TextDrawing {
  delay: number
  dur: number
  isChinese: boolean
  path: Vector[][]
  text: string
}

export interface State {
  bgH: number
  bgW: number
  debugMode: boolean
  mouse: Vector
  textDrawings: TextDrawing[]
}

export class Intro {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  bufferCanvas: HTMLCanvasElement
  bufferCtx: CanvasRenderingContext2D

  smoke: any
  smokeCanvas: HTMLCanvasElement
  smokeCtx: CanvasRenderingContext2D
  lastSmokeSpawn: number = 0

  intoBody: HTMLElement
  renderHooks: ((t: number) => void)[] = []

  state: State = {
    bgH: 1000,
    bgW: 1491,
    debugMode: false,
    mouse: vec(0, 0),
    textDrawings: initialState,
  }

  constructor() {
    const intro = document.querySelector('.kwc-intro')

    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('kwc-intro-canvas')

    this.intoBody = document.createElement('div')
    this.intoBody.classList.add('kwc-intro-body')

    this.bufferCanvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.bufferCtx = this.bufferCanvas.getContext(
      '2d',
    ) as CanvasRenderingContext2D

    this.smokeCanvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.smokeCtx = this.smokeCanvas.getContext(
      '2d',
    ) as CanvasRenderingContext2D

    if (!intro) return
    intro.appendChild(this.canvas)
    intro.appendChild(this.intoBody)

    this.updateSizes()
    onResize.subscribe(this.updateSizes)

    window.addEventListener('mousemove', e => {
      this.state.mouse = vec(e.pageX, e.pageY)
    })

    this.canvas.addEventListener(
      'touchmove',
      e => (this.state.mouse = vec(e.touches[0].pageX, e.touches[0].pageY)),
    )

    this.updateSizes()

    Promise.all([dewi.load(), china.load()]).then(() => {
      this.renderLetters()
      onLoad()
    })

    this.ctx.imageSmoothingEnabled = true
    this.bufferCtx.imageSmoothingEnabled = true

    noise.seed(Math.random())

    // Smoke
    this.smoke = smokemachine(this.smokeCtx, [10, 10, 10])
    this.smoke.start()
    for (let k = 0; k < 20; k++) {
      this.spawnSmoke()
      this.smoke.step(10)
    }

    window.requestAnimationFrame(this.renderRaf)
  }

  updateSizes = () => {
    this.renderLetters()
    resizeCanvases([
      { c: this.canvas, ctx: this.ctx },
      { c: this.bufferCanvas, ctx: this.bufferCtx },
      { c: this.smokeCanvas, ctx: this.smokeCtx },
    ])
  }

  renderRaf = (time: number) => {
    if (scrollState.pos < sizeState.h) {
      const ctx = this.ctx
      const { w, h, scale } = sizeState
      const now = Date.now()

      ctx.save()
      this.bufferCtx.save()
      this.smokeCtx.save()
      if (scale !== 1) {
        ctx.scale(scale, scale)
        this.bufferCtx.scale(scale, scale)
        this.smokeCtx.scale(scale, scale)
      }

      ctx.clearRect(0, 0, w, h)
      this.renderSmoke(time, now)
      if (!this.state.debugMode) this.renderDarkness(time, now)
      this.renderHooks.forEach(hook => hook(time))

      ctx.restore()
      this.bufferCtx.restore()
      this.smokeCtx.restore()
    }

    window.requestAnimationFrame(this.renderRaf)
  }

  spawnSmoke() {
    const { w, h } = sizeState
    for (let k = 0; k < w / 250; k++) {
      this.smoke.addsmoke(rnd(-w / 2, w), rnd(0, h), 1, w * 3)
    }
  }

  renderSmoke(time: number, now: number) {
    if (now - this.lastSmokeSpawn > 100) {
      this.spawnSmoke()
      this.lastSmokeSpawn = now
    }

    const ctx = this.bufferCtx
    const { w, h } = sizeState

    ctx.save()

    ctx.clearRect(0, 0, w, h)
    ctx.drawImage(this.smokeCanvas, 0, 0)
    this.drawMask(ctx)
    ctx.clip()
    ctx.clearRect(0, 0, w, h)

    this.ctx.drawImage(this.bufferCanvas, 0, 0, w, h)

    ctx.restore()
  }

  drawMask(ctx: CanvasRenderingContext2D) {
    ctx.beginPath()
    bgMask.forEach((d, i) => {
      const { x, y } = this.restoreVec(d)
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    ctx.closePath()
  }

  renderDarkness(time: number, now: number) {
    const ctx = this.bufferCtx
    const { w, h } = sizeState
    const { mouse } = this.state

    const n = noise.simplex3(0, 0, (time % 5000) / 300)
    const hlRadius = Math.max(w / 8, h / 8)
    const r = hlRadius - hlRadius * n * 0.01
    const lightX = minmax(hlRadius, mouse.x, w - hlRadius)
    const lightY = minmax(hlRadius, mouse.y, h - hlRadius)

    ctx.save()
    ctx.clearRect(0, 0, w, h)
    this.drawMask(ctx)
    ctx.clip()
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, w, h)

    ctx.beginPath()

    var g = ctx.createRadialGradient(lightX, lightY, 0, lightX, lightY, r)

    g.addColorStop(1, 'rgba(255,255,255,0)')
    g.addColorStop(0.95, 'rgba(255,255,255,1)')
    g.addColorStop(0, 'rgba(255,255,255,1)')

    ctx.globalAlpha = minmax(0, 1 - n * 0.2, 1)
    ctx.fillStyle = g
    ctx.globalCompositeOperation = 'xor'

    ctx.fillRect(lightX - r, lightY - r, r * 2, r * 2)

    this.ctx.save()
    this.ctx.globalCompositeOperation = 'multiply'
    this.ctx.drawImage(this.bufferCanvas, 0, 0, w, h)
    this.ctx.restore()

    ctx.restore()
  }

  renderLetters = () => {
    const rv = this.restoreVec
    this.intoBody.innerHTML = ''

    this.state.textDrawings.forEach((itm, i) => {
      // Boxes where texts goes
      const stopBoxes = itm.path.slice(0, -1).map((p, j) => {
        const p1 = rv(p[0])
        const p2 = rv(p[1])
        const np1 = rv(itm.path[j + 1][0])
        const np2 = rv(itm.path[j + 1][1])
        const { x: x1, y: y1 } = p1
        const { x: x2, y: y2 } = p2
        const { x: nx1, y: ny1 } = np1
        const { x: nx2, y: ny2 } = np2
        return { x1, y1, x2, y2, nx1, ny1, nx2, ny2, p1, p2, np1, np2 }
      })

      let fz = 0
      let fullW = 0
      const medHs: number[] = []
      const widths: number[] = []

      stopBoxes.forEach(({ x1, y1, x2, y2, nx1, ny1, nx2, ny2 }, j) => {
        const w = nx1 - x1
        widths.push(w)

        fz += y2 - y1
        if (j === stopBoxes.length - 1) fz += ny2 - ny1

        const h1 = y2 - y1
        const h2 = ny2 - ny1
        medHs.push(Math.min(h1, h2))
      })

      fz /= stopBoxes.length + 1
      const textW = measureText(
        itm.text,
        'kwc-intro-text' + (itm.isChinese ? ' kwc-intro-text-chinese' : ''),
        fz,
      )

      const maxH = medHs.reduce((max, h) => Math.max(max, h), 0)
      const hCoeffs = medHs.map(h => h / maxH)
      stopBoxes.forEach(({ x1, y1, x2, y2, nx1, ny1, nx2, ny2 }, j) => {
        const h1 = y2 - y1
        const h2 = ny2 - ny1
        const c1 = Math.max(h1, h2) / Math.min(h1, h2)
        const c2 = 1 / hCoeffs[j]
        const pCoeff = c1 * c2
        widths[j] = widths[j] * pCoeff
        fullW += widths[j]
      })

      fullW += textW
      let currOffset = textW
      stopBoxes.forEach(
        ({ x1, y1, x2, y2, nx1, ny1, nx2, ny2, p1, np1, p2, np2 }, j) => {
          const w = widths[j]
          const h = fz

          // Perspective
          const perspective = document.createElement('div')
          perspective.classList.add('kwc-intro-text-perspective')
          perspective.style.width = w + 'px'
          perspective.style.height = h + 'px'

          const matrix = getTransform(
            [vec(0, 0), vec(w, 0), vec(0, h), vec(w, h)],
            [p1, np1, p2, np2],
          )

          perspective.style.transform = `matrix3d(${matrix})`

          // Text
          const text = document.createElement('div')
          text.classList.add('kwc-intro-text')
          if (itm.isChinese) text.classList.add('kwc-intro-text-chinese')
          text.textContent = itm.text
          text.style.fontSize = fz + 'px'
          text.style.height = h + 'px'

          // Mover
          const textMover = document.createElement('div')
          textMover.classList.add('kwc-intro-text-mover')
          textMover.style.width = fullW + 'px'
          textMover.style.height = h + 'px'
          textMover.style.left = -currOffset + 'px'
          textMover.style.animationDuration = itm.dur + 's'
          textMover.style.animationDelay = itm.delay + 's'

          // Appends
          textMover.appendChild(text)
          perspective.appendChild(textMover)
          this.intoBody.appendChild(perspective)

          // Next offset
          currOffset += w
        },
      )
    })
  }

  getRatiosDiffs = () => {
    const { bgW, bgH } = this.state
    const { w: winW, h: winH } = sizeState

    const winR = winW / winH
    const bgR = bgW / bgH

    const scale = winR < bgR ? bgH / winH : bgW / winW

    const diffX = (bgW - winW * scale) / 2
    const diffY = (bgH - winH * scale) / 2

    return { diffX, diffY, scale }
  }

  saveVec = (v: Vector) => {
    const { diffX, diffY, scale } = this.getRatiosDiffs()
    const x = Math.round(scale * v.x + diffX)
    const y = Math.round(scale * v.y + diffY)
    return vec(x, y)
  }

  restoreVec = (v: Vector) => {
    const { diffX, diffY, scale } = this.getRatiosDiffs()
    const x = Math.round((1 / scale) * (v.x - diffX))
    const y = Math.round((1 / scale) * (v.y - diffY))
    return vec(x, y)
  }
}
