import 'vendor/numeric.min.js'
import { Vector, vec } from 'utils/Vector'
import initialState from 'utils/initialState'
import bgMask from 'utils/mask'

export const minmax = (min: number, value: number, max: number) =>
  Math.max(min, Math.min(max, value))

export interface TextDrawing {
  dur: number
  delay: number
  path: Vector[][]
  text: string
}

export interface State {
  bgH: number
  bgW: number
  hlRadius: number
  isDarkShown: boolean
  mouse: Vector
  textDrawings: TextDrawing[]
  winH: number
  winW: number
}

interface TextPath {
  el: HTMLElement
  w: number
}

interface TextProgs {
  prog: { [key: string]: number }
  path: TextPath[]
}

export class Intro {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  intoBody: HTMLElement
  letters: TextProgs[]
  renderHooks: ((t: number) => void)[] = []
  scale: number

  state: State = {
    bgH: 1000,
    bgW: 1491,
    hlRadius: 100,
    isDarkShown: true,
    mouse: vec(0, 0),
    textDrawings: initialState,
    winH: -1,
    winW: -1,
  }

  constructor() {
    this.scale =
      typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 1

    this.letters = []
    this.intoBody = document.querySelector('.kwc-intro-body') as HTMLElement
    this.canvas = document.querySelector(
      '.kwc-intro-canvas',
    ) as HTMLCanvasElement
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    this.updateSizes()
    this.renderLetters()

    window.addEventListener('resize', () => {
      this.updateSizes()
      this.renderLetters()
    })

    this.canvas.addEventListener(
      'mousemove',
      e => (this.state.mouse = vec(e.pageX, e.pageY)),
    )

    window.requestAnimationFrame(this.renderRaf)
  }

  propsGetters: { [key: string]: (t: number) => string } = {
    opacity: (prog: number) => String(prog),
    transform: (prog: number) => `translateX(${prog * 100}%)`,
  }

  renderRaf = (time: number) => {
    const ctx = this.ctx
    const { width: w, height: h } = ctx.canvas
    const { mouse, hlRadius } = this.state

    if (this.scale !== 1) ctx.scale(this.scale, this.scale)
    ctx.imageSmoothingEnabled = true
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height)

    if (this.state.isDarkShown) {
      ctx.save()

      ctx.beginPath()
      bgMask.forEach((dot, i) => {
        const d = this.restoreVec(dot)
        if (i === 0) {
          ctx.moveTo(d.x, d.y)
        } else {
          ctx.lineTo(d.x, d.y)
        }
      })
      ctx.closePath()
      ctx.clip()
      // ctx.fillStyle = '#000'
      // ctx.globalCompositeOperation = 'xor'
      // ctx.fill()

      ctx.globalAlpha = 0.85
      ctx.fillRect(0, 0, w, h)

      var g = ctx.createRadialGradient(
        mouse.x,
        mouse.y,
        0,
        mouse.x,
        mouse.y,
        hlRadius,
      )

      g.addColorStop(1, 'rgba(0,0,0,0)')
      g.addColorStop(0.95, 'rgba(0,0,0,1)')
      g.addColorStop(0, 'rgba(0,0,0,1)')

      ctx.globalAlpha = 1
      ctx.fillStyle = g
      ctx.globalCompositeOperation = 'xor'

      ctx.fillRect(
        mouse.x - hlRadius,
        mouse.y - hlRadius,
        hlRadius * 2,
        hlRadius * 2,
      )

      ctx.restore()
    }

    this.renderHooks.forEach(hook => hook(time))
    window.requestAnimationFrame(this.renderRaf)
  }

  // https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
  // prettier-ignore
  getTransform = (from: Vector[], to: Vector[]) => {
    var A, H, b, h, i, k, l, ref;
    // var A, H, b, h, i, k, k_i, l, lhs, m, ref, rhs;
    console.assert((from.length === (ref = to.length) && ref === 4));
    A = []; // 8x8
    for (i = k = 0; k < 4; i = ++k) {
      A.push([from[i].x, from[i].y, 1, 0, 0, 0, -from[i].x * to[i].x, -from[i].y * to[i].x]);
      A.push([0, 0, 0, from[i].x, from[i].y, 1, -from[i].x * to[i].y, -from[i].y * to[i].y]);
    }
    b = []; // 8x1
    for (i = l = 0; l < 4; i = ++l) {
      b.push(to[i].x);
      b.push(to[i].y);
    }
    // Solve A * h = b for h
    h = (window as any).solve(A, b);
    H = [[h[0], h[1], 0, h[2]], [h[3], h[4], 0, h[5]], [0, 0, 1, 0], [h[6], h[7], 0, 1]];
    // Sanity check that H actually maps `from` to `to`
    // for (i = m = 0; m < 4; i = ++m) {
    //   lhs = numeric.dot(H, [from[i].x, from[i].y, 0, 1]);
    //   k_i = lhs[3];
    //   rhs = numeric.dot(k_i, [to[i].x, to[i].y, 0, 1]);
    //   console.assert(numeric.norm2(numeric.sub(lhs, rhs)) < 1e-9, "Not equal:", lhs, rhs);
    // }
    // return H;

    var k, results;
    results = [];
    for (i = k = 0; k < 4; i = ++k) {
      results.push((() => {
        var l, results1;
        results1 = [];
        for (let j = l = 0; l < 4; j = ++l) {
          results1.push(H[j][i].toFixed(20));
        }
        return results1;
      })());
    }
    return results.join(',');
  }

  renderLetters = () => {
    const rv = this.restoreVec
    this.letters = []
    this.intoBody.innerHTML = ''

    this.state.textDrawings.forEach((itm, i) => {
      this.letters[i] = {
        prog: {},
        path: [],
      }

      let itmGlobH = 0
      let totalW = 0
      let currOffset = 0

      itm.path.forEach((p, j) => {
        const { x: x1, y: y1 } = rv(p[0])
        const { y: y2 } = rv(p[1])
        const h = y2 - y1
        itmGlobH += h

        if (j < itm.path.length - 1) {
          const { x: nx1 } = rv(itm.path[j + 1][0])
          const w = nx1 - x1
          totalW += w
        }
      })

      itmGlobH /= itm.path.length
      itmGlobH *= 0.75

      const textMeasure = document.createElement('div')
      textMeasure.classList.add('kwc-intro-text')
      textMeasure.textContent = itm.text
      textMeasure.style.fontSize = itmGlobH + 'px'
      textMeasure.style.position = 'absolute'
      textMeasure.style.visibility = 'hidden'
      document.body.appendChild(textMeasure)
      const textW = textMeasure.clientWidth
      document.body.removeChild(textMeasure)

      totalW += textW
      currOffset = textW

      itm.path.forEach((p, j) => {
        const p1 = rv(p[0])
        const p2 = rv(p[1])
        const { x: x1 } = p1
        // const { x: x1, y: y1 } = p1
        // const { x: x2, y: y2 } = p2

        if (j < itm.path.length - 1) {
          const np1 = rv(itm.path[j + 1][0])
          const np2 = rv(itm.path[j + 1][1])
          const { x: nx1 } = np1
          // const { x: nx1, y: ny1 } = np1
          // const { x: nx2, y: ny2 } = np2

          const w = nx1 - x1
          // const h1 = y2 - y1
          // const h2 = ny2 - ny1
          // const h = Math.min(h1, h2)
          // const h = Math.max(h1, h2)
          // const h = (h1 + h2) / 2
          const h = itmGlobH

          // Perspective
          const perspective = document.createElement('div')
          perspective.classList.add('kwc-intro-text-perspective')
          perspective.style.width = w + 'px'
          perspective.style.height = h + 'px'
          const matrix = this.getTransform(
            [vec(0, 0), vec(w, 0), vec(0, h), vec(w, h)],
            [p1, np1, p2, np2],
          )
          perspective.style.transform = `matrix3d(${matrix})`

          // Text
          const text = document.createElement('div')
          text.classList.add('kwc-intro-text')
          text.textContent = itm.text
          text.style.fontSize = h + 'px'

          // Scale
          const textScale = document.createElement('div')
          textScale.classList.add('kwc-intro-text-scale')

          // Mover
          const textMover = document.createElement('div')
          textMover.classList.add('kwc-intro-text-mover')
          textMover.style.width = totalW + 'px'
          textMover.style.left = -currOffset + 'px'
          textMover.style.animationDuration = itm.dur + 's'
          textMover.style.animationDelay = itm.delay + 's'

          // Appends
          textMover.appendChild(text)
          perspective.appendChild(textMover)
          this.intoBody.appendChild(perspective)

          // Save
          this.letters[i].path[j] = {
            el: textMover,
            w,
          }

          // Next offset
          currOffset += w
        }
      })
    })
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
    this.canvas.width = w
    this.canvas.height = h
    this.state.hlRadius = Math.max(w / 7, h / 7)
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
    const x = scale * v.x + diffX
    const y = scale * v.y + diffY
    return vec(x, y)
  }

  restoreVec = (v: Vector) => {
    const { diffX, diffY, scale } = this.getRatiosDiffs()
    const x = (1 / scale) * (v.x - diffX)
    const y = (1 / scale) * (v.y - diffY)
    return vec(x, y)
  }

  // saveW = (x: number) => {
  //   const { scale } = this.getRatiosDiffs()
  //   return x * scale
  // }

  // saveH = (x: number) => {
  //   const { scale } = this.getRatiosDiffs()
  //   return x * scale
  // }

  // restoreW = (x: number) => {
  //   const { scale } = this.getRatiosDiffs()
  //   return x * (1 / scale)
  // }

  // restoreH = (x: number) => {
  //   const { scale } = this.getRatiosDiffs()
  //   return x * (1 / scale)
  // }
}
