import { Vector } from './Vector'

export interface Drawing {
  h: number
  path: [Vector, Vector][]
  pos: Vector
  text: string
  type: string
}

export interface State {
  bgW: number
  bgH: number
  winH: number
  winW: number
  drawings: Drawing[]
}

export class KwnIntro {
  scale: number
  renderHooks: ((t: number) => void)[] = []
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D

  state: State = {
    bgW: 1491,
    bgH: 1000,
    winH: window.innerHeight,
    winW: window.innerWidth,
    drawings: [],
  }

  constructor() {
    this.scale =
      typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 1

    this.canvas = document.querySelector('#canvas') as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    window.requestAnimationFrame(this.render)

    window.addEventListener('resize', this.updateSizes)
    this.updateSizes()
  }

  render = (time: number) => {
    const ctx = this.ctx
    const state = this.state

    if (this.scale !== 1) ctx.scale(this.scale, this.scale)
    ctx.imageSmoothingEnabled = true

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    state.drawings.forEach(itm => {
      ctx.save()
      switch (itm.type) {
        case 'text':
          const { x, y } = this.restoreVec(itm.path[0][1])
          // const w = this.restoreW(itm.w)
          const h = this.restoreH(itm.h)
          ctx.font = h + 'px Arial'
          ctx.fillStyle = '#fff'
          ctx.fillText(itm.text, x, y)
      }
      ctx.restore()
    })

    this.renderHooks.forEach(hook => hook(time))

    window.requestAnimationFrame(this.render)
  }

  updateSizes = () => {
    const w = window.innerWidth
    const h = window.innerHeight
    this.state.winW = w
    this.state.winH = h
    this.canvas.width = w
    this.canvas.height = h
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

  saveVec = (vec: Vector) => {
    const { diffX, diffY, scale } = this.getRatiosDiffs()
    const x = scale * vec.x + diffX
    const y = scale * vec.y + diffY
    return new Vector(x, y)
  }

  restoreVec = (vec: Vector) => {
    const { diffX, diffY, scale } = this.getRatiosDiffs()
    const x = (1 / scale) * (vec.x - diffX)
    const y = (1 / scale) * (vec.y - diffY)
    return new Vector(x, y)
  }

  saveW = (x: number) => {
    const { scale } = this.getRatiosDiffs()
    return x * scale
  }

  saveH = (x: number) => {
    const { scale } = this.getRatiosDiffs()
    return x * scale
  }

  restoreW = (x: number) => {
    const { scale } = this.getRatiosDiffs()
    return x * (1 / scale)
  }

  restoreH = (x: number) => {
    const { scale } = this.getRatiosDiffs()
    return x * (1 / scale)
  }
}
