import { Vector, vec } from 'utils/Vector'
import { minmax } from 'utils/math'
const noise = (window as any).noise
import { onResize, sizeState, resizeCanvases } from 'utils/resize'

interface State {
  mouse: Vector
}

export class NavBg {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  renderHooks: ((t: number) => void)[] = []

  state: State = {
    mouse: vec(0, 0),
  }

  constructor() {
    const intro = document.querySelector('.menu-bg') as HTMLElement
    const menu = document.querySelector('.kwc-menu') as HTMLElement

    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('kwc-intro-canvas')
    intro.appendChild(this.canvas)

    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    menu.addEventListener('mousemove', e => {
      this.state.mouse = vec(e.clientX, e.clientY)
    })

    this.canvas.addEventListener(
      'touchmove',
      e => (this.state.mouse = vec(e.touches[0].pageX, e.touches[0].pageY)),
    )

    this.updateSizes()
    onResize.subscribe(this.updateSizes)

    this.ctx.imageSmoothingEnabled = true

    noise.seed(Math.random())

    window.requestAnimationFrame(this.renderRaf)
  }

  updateSizes = () => {
    resizeCanvases([{ c: this.canvas, ctx: this.ctx }])
  }

  renderRaf = (time: number) => {
    const ctx = this.ctx
    const { mouse } = this.state
    const { w, h, scale } = sizeState

    const hlRadius = Math.max(w / 8, h / 8)
    const n = noise.simplex3(0, 0, (time % 5000) / 300)
    const r = hlRadius - hlRadius * n * 0.01
    const lightX = minmax(hlRadius, mouse.x, w - hlRadius)
    const lightY = minmax(hlRadius, mouse.y, h - hlRadius)

    ctx.save()
    if (scale !== 1) ctx.scale(scale, scale)

    ctx.clearRect(0, 0, w, h)

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
    ctx.restore()

    window.requestAnimationFrame(this.renderRaf)
  }
}
