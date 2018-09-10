import 'vendor/numeric.min.js'
import { Vector, vec } from 'utils/Vector'
import initialState from 'utils/initialState'
import { getTransform } from 'utils/matrixTransform'
import measureText from 'utils/measureText'
import scroll from 'utils/scroll'
const smokemachine = require('vendor/smoke')
require('vendor/parlin-noise')
const noise = (window as any).noise

export const minmax = (min: number, value: number, max: number) =>
  Math.max(min, Math.min(max, value))

const rnd = (min: number, max: number) => Math.random() * (max - min) + min

export interface State {
  bgH: number
  bgW: number
  debugMode: boolean
  hlRadius: number
  mouse: Vector
  winH: number
  winW: number
}

export class NavBg {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  bufferCanvas: HTMLCanvasElement
  bufferCtx: CanvasRenderingContext2D

  intoBody: HTMLElement
  renderHooks: ((t: number) => void)[] = []
  scale: number =
    typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 1

  state: State = {
    bgH: 1000,
    bgW: 1491,
    debugMode: false,
    hlRadius: 100,
    mouse: vec(0, 0),
    winH: -1,
    winW: -1,
  }

  constructor() {
    const intro = document.querySelector('.menu-bg') as HTMLElement

    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('kwc-intro-canvas')
    intro.appendChild(this.canvas)

    this.intoBody = document.createElement('div')
    this.intoBody.classList.add('kwc-intro-body')
    intro.appendChild(this.intoBody)

    this.bufferCanvas = document.createElement('canvas')
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D
    this.bufferCtx = this.bufferCanvas.getContext(
      '2d',
    ) as CanvasRenderingContext2D

    window.addEventListener('resize', () => {
      this.updateSizes()
    })

    window.addEventListener('mousemove', e => {
      this.state.mouse = vec(e.pageX, e.pageY)
    })

    this.canvas.addEventListener(
      'touchmove',
      e => (this.state.mouse = vec(e.touches[0].pageX, e.touches[0].pageY)),
    )

    this.updateSizes()

    this.ctx.imageSmoothingEnabled = true
    this.bufferCtx.imageSmoothingEnabled = true

    noise.seed(Math.random())

    window.requestAnimationFrame(this.renderRaf)
  }

  renderRaf = (time: number) => {
    if (scroll.pos < this.state.winH) {
      const ctx = this.ctx
      const { winW: w, winH: h } = this.state
      const now = Date.now()

      ctx.save()
      this.bufferCtx.save()
      if (this.scale !== 1) {
        ctx.scale(this.scale, this.scale)
        this.bufferCtx.scale(this.scale, this.scale)
      }

      ctx.clearRect(0, 0, w, h)
      if (!this.state.debugMode) this.renderDarkness(time, now)
      this.renderHooks.forEach(hook => hook(time))

      ctx.restore()
      this.bufferCtx.restore()
    }

    window.requestAnimationFrame(this.renderRaf)
  }

  renderDarkness(time: number, now: number) {
    const ctx = this.bufferCtx
    const { winW: w, winH: h, mouse, hlRadius } = this.state
    
    const n = noise.simplex3(0, 0, (time % 5000) / 300)

    ctx.save()
    ctx.clearRect(0, 0, w, h)
    ctx.clip()
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, 500, 500)

    const r = hlRadius - hlRadius * n * 0.01

    ctx.beginPath()

    const lightX = minmax(hlRadius, mouse.x, w - hlRadius)
    const lightY = minmax(hlRadius, mouse.y, h - hlRadius)

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

  updateSizes = () => {
    const rootEl =
      document.compatMode === 'BackCompat'
        ? document.body
        : document.documentElement
    const h = Math.min(rootEl.clientHeight, window.innerHeight)
    const w = rootEl.clientWidth

    this.state.winW = w
    this.state.winH = h

    this.scale =
      typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 1

    const canvases = [
      { c: this.canvas, ctx: this.ctx },
      { c: this.bufferCanvas, ctx: this.bufferCtx }
    ]
    canvases.forEach(({ c, ctx }) => {
      c.style.width = w + 'px'
      c.style.height = h + 'px'

      c.width = w * this.scale
      c.height = h * this.scale

      c.style.width = w + 'px'
      c.style.height = h + 'px'
    })

    this.state.hlRadius = Math.max(w / 8, h / 8)
  }

  getRatiosDiffs = () => {
    const { winW, winH, bgW, bgH } = this.state

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