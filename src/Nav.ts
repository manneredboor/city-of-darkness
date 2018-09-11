import { Vector, vec } from 'utils/Vector'
import { minmax } from 'utils/math'
import { onResize, sizeState, resizeCanvases } from 'utils/resize'
import { lockScroll, unlockScroll } from 'utils/scroll'
require('./css/nav.css')
require('./css/footer.css')
const anime = require('vendor/anime')
const noise = (window as any).noise

const menuHtml = `
  <div class="menu-bg"></div>
  <div class="menu-col menu-col-1">
    <span class="menu-border"></span>
    <span class="menu-num">01</span>
    <div class="nav-box">
      <p class="nav-title">Архитектура</p>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Коулун</p>
      </div>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Архитектура</p>
      </div>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Быт</p>
      </div>
    </div>
  </div>
  <div class="menu-col menu-col-2">
    <span class="menu-border"></span>
    <span class="menu-num">02</span>
    <div class="nav-box">
      <p class="nav-title">Люди</p>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Население</p>
      </div>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Сферы жизни</p>
      </div>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">История</p>
      </div>
    </div>
  </div>
  <div class="menu-col menu-col-3">
    <span class="menu-border"></span>
    <span class="menu-num">03</span>
    <div class="nav-box">
      <p class="nav-title">История</p>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Зарождение</p>
      </div>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Развитие</p>
      </div>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Снос</p>
      </div>
    </div>
  </div>
  <div class="menu-col menu-col-4">
    <span class="menu-num">04</span>
    <div class="nav-box">
      <p class="nav-title">Факты</p>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Самолеты</p>
      </div>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Парк</p>
      </div>
      <div class="nav-item-box">
        <span class="nav-item-line"></span>
        <p class="nav-item">Упоминания</p>
      </div>
    </div>
  </div>
`

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

  renderHooks: ((t: number) => void)[] = []

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
    this.menu.innerHTML = menuHtml
    this.menu.classList.add('kwc-menu')
    document.body.appendChild(this.menu)

    this.menuCols = this.menu.querySelectorAll('.menu-border')
    this.navRows = this.menu.querySelectorAll('.nav-box')
    const bgWrap = this.menu.querySelector('.menu-bg')

    this.canvas = document.createElement('canvas')
    this.canvas.classList.add('kwc-intro-canvas')
    this.ctx = this.canvas.getContext('2d') as CanvasRenderingContext2D

    if (!this.navBtn || !this.menu || !bgWrap) return

    bgWrap.appendChild(this.canvas)

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

    window.requestAnimationFrame(this.renderRaf)
  }

  updateSizes = () => {
    resizeCanvases([{ c: this.canvas, ctx: this.ctx }])
  }

  handleClickNav = () => {
    const menu = this.menu
    const navBtn = this.navBtn

    if (!navBtn || !menu) return

    if (menu.classList.contains('open')) {
      menu.classList.remove('open')
      navBtn.classList.remove('open')
      unlockScroll()
      return
    }
    menu.classList.add('open')
    navBtn.classList.add('open')
    lockScroll()

    anime
      .timeline()
      .add({
        targets: this.menuCols,
        height: '100vh',
        duration: 1700,
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
      .add({
        targets: '.nav-box p',
        color: '#fff',
        duration: 1000,
        easing: 'easeInOutQuart',
        offset: '0',
      })
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
