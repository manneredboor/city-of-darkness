import { Vector, vec } from 'utils/Vector'
import { minmax } from 'utils/math'
import { onResize, sizeState, resizeCanvases } from 'utils/resize'
import { lockScroll, unlockScroll } from 'utils/scroll'
require('./css/nav.css')
require('./css/footer.css')
const anime = require('vendor/anime')
const noise = (window as any).noise

// prettier-ignore
const menu: {
  title: string
  mainLink?: string
  links: { text: string; href?: string }[]
}[] = [
  {
    title: 'Архитектура',
    links: [
      { text: 'Коулун', href: 'http://www.kwc.guide/#letter-k' }, 
      { text: 'Архитектура', href: 'http://www.kwc.guide/#letter-a' }, 
      { text: 'Быт', href: 'http://www.kwc.guide/#letter-b' }
    ],
  },
  {
    title: 'Люди',
    links: [
      { text: 'Население', href: 'http://www.kwc.guide/people#letter-n' },
      { text: 'Сферы жизни', href: 'http://www.kwc.guide/people#letter-c' },
      { text: 'История', href: 'http://www.kwc.guide/people#letter-e' },
    ],
  },
  {
    title: 'История',
    links: [
      { text: 'Зарождение', href: 'http://www.kwc.guide/%D0%BD%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D0%BB%D0%B8' },
      { text: 'Развитие', href: 'http://www.kwc.guide/%D0%BD%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D0%BB%D0%B8' },
      { text: 'Снос', href: 'http://www.kwc.guide/%D0%BD%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D0%BB%D0%B8' }
    ],
  },
  {
    title: 'Факты',
    links: [
      { text: 'Самолеты', href: 'http://www.kwc.guide/%D0%BD%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D0%BB%D0%B8' },
      { text: 'Парк', href: 'http://www.kwc.guide/%D0%BD%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D0%BB%D0%B8' },
      { text: 'Упоминания', href: 'http://www.kwc.guide/%D0%BD%D0%B5-%D1%83%D1%81%D0%BF%D0%B5%D0%BB%D0%B8' }
    ],
  },
]

interface State {
  mouse: Vector
}

export class NavBg {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  navBtn: HTMLElement | null
  menu: HTMLElement | null
  menuCols: NodeListOf<HTMLElement>
  navRows: NodeListOf<HTMLElement>
  isOpened: boolean = false
  anim: any

  state: State = {
    mouse: vec(0, 0),
  }

  constructor() {
    document.body.insertAdjacentHTML(
      'beforeend',
      '<div class="nav-btn"><div class="nav-bar-box"><span class="nav-bar"></span><span class="nav-bar"></span><span class="nav-bar"></span></div></div>',
    )

    this.navBtn = document.querySelector('.nav-btn')
    this.menu = document.createElement('div')
    this.menu.classList.add('kwc-menu')
    this.menu.innerHTML = `
      <div class="menu-bg"></div>
      ${menu
        .map(
          (itm, i) => `
          <div class="menu-col menu-col-${i + 1}">
            <span class="menu-border"></span>
            <span class="menu-num">0${i + 1}</span>
            <div class="nav-box">
              <p class="nav-title">${itm.title}</p>
              ${itm.links
                .map(
                  link => `
                    <div class="nav-item-box">
                      <span class="nav-item-line"></span>
                      <a href="${link.href}">
                        <p class="nav-item">${link.text}</p>
                      </a>
                    </div>
                  `,
                )
                .join('')}
            </div>
          </div>
        `,
        )
        .join('')}
    `

    document.body.appendChild(this.menu)

    this.menuCols = this.menu.querySelectorAll('.menu-border')
    this.navRows = this.menu.querySelectorAll('.nav-box')
    const bgWrap = this.menu.querySelector('.menu-bg')

    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('kwc-intro-canvas')
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    if (!this.navBtn || !this.menu || !bgWrap) return

    bgWrap.appendChild(this.canvas)

    this.createAnim()
    this.navBtn.addEventListener('click', this.handleClickNav)

    this.menu.addEventListener('mousemove', e => {
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
  }

  updateSizes = () => {
    resizeCanvases([{ c: this.canvas, ctx: this.ctx }])
  }

  createAnim() {
    this.anim = anime
      .timeline()
      .add({
        targets: this.menuCols,
        height: '100vh',
        duration: 1200,
        easing: 'easeInOutQuart',
      })
      .add({
        targets: '.menu-num',
        opacity: 1,
        left: 30,
        duration: 1000,
        easing: 'easeInOutQuart',
        offset: '0',
      })
      .add({
        targets: this.navRows,
        opacity: 1,
        left: 30,
        duration: 1000,
        easing: 'easeInOutQuart',
        offset: '0',
      })
  }

  handleClickNav = () => {
    const menu = this.menu
    const navBtn = this.navBtn

    if (!navBtn || !menu) return

    this.isOpened = !this.isOpened

    menu.classList.toggle('open', this.isOpened)
    navBtn.classList.toggle('open', this.isOpened)

    if (this.isOpened) {
      lockScroll()
      window.requestAnimationFrame(this.renderRaf)
      this.anim.restart()
    } else {
      unlockScroll()
    }
  }

  renderRaf = (time: number) => {
    if (!this.isOpened) return
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
