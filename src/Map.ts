import { Vector, vec } from 'utils/Vector'
import { WatchedValue } from 'utils/WatchedValue'
import { sizeState, onResize } from 'utils/resize'
import { scrollState } from 'utils/scroll'
import { minmax } from 'utils/math'
require('./css/map.css')

const W = 1403
const H = 955
// const SVG_URL = '../img/map.svg'
const SVG_URL = 'http://ucraft.neekeesh.com/img/map.svg'
const MIN_ZOOM = 1
const MAX_ZOOM = 3

const texts: { [key: string]: string } = {
  church: 'Храм',
  school: 'Начальная школа',
  olds: 'Центр для пожилых людей',
  yamen: 'Ямен',
  hospital: 'Клиника',
  well: 'Колодец',
}

export class Map {
  el: HTMLElement | null = null
  hover: WatchedValue<string | null> = new WatchedValue(null)
  isLoaded: boolean = false
  mapEl: HTMLElement | null = null
  mouse: WatchedValue<Vector> = new WatchedValue(vec(0, 0))
  offset: WatchedValue<Vector> = new WatchedValue(vec(0.5, 0.5))
  svg: SVGElement | null = null
  mapMover: HTMLElement | undefined
  tip: HTMLElement | undefined
  zoom: WatchedValue<number> = new WatchedValue(1.1)

  constructor() {
    this.el = document.querySelector('.kwc-map')
    if (!this.el) return
    this.hover.subscribe(this.renderTip)
    this.mouse.subscribe(this.renderTip)
    this.zoom.subscribe(this.renderOffset)
    this.offset.subscribe(this.renderOffset)
    onResize.subscribe(this.handleResize)
    this.load()
  }

  getScale() {
    const { w, h } = sizeState
    const winR = w / h
    const bgR = W / H
    return winR > bgR ? H / h : W / w
  }

  handleResize = () => {
    if (!this.svg || !this.mapMover || !this.mapEl) return
    const mapMover = this.mapMover
    const scale = 1 / this.getScale()
    this.svg.style.width = W * scale + 'px'
    this.svg.style.height = H * scale + 'px'
    mapMover.style.width = W * scale + 'px'
    mapMover.style.height = H * scale + 'px'
    this.renderOffset()
  }

  renderOffset = () => {
    if (!this.mapMover) return
    const { x, y } = this.offset.value
    this.mapMover.style.transform = `
      translate(${-x * 100}%, ${-y * 100}%)
      scale(${this.zoom.value})
    `
  }

  renderTip = () => {
    if (!this.el || !this.isLoaded) return
    if (!this.tip) {
      this.tip = document.createElement('div')
      this.tip.classList.add('kwc-map-tip')
      this.el.appendChild(this.tip)
    }

    const id = this.hover.value
    if (id && this.tip.textContent !== id) {
      const { x, y } = this.mouse.value
      this.tip.style.transform = `translate(${x + 5}px, ${y + 15}px)`

      const text = texts[String(id).replace('kwc-map-', '')]
      this.tip.textContent = text
    }

    if (!id && this.tip.textContent) this.tip.textContent = ''
  }

  async load() {
    if (!this.el) return
    const res = await fetch(SVG_URL)
    const svg = await res.text()

    const map = document.createElement('div')
    map.classList.add('kwc-map-in')

    const mapMover = document.createElement('div')
    mapMover.classList.add('kwc-map-mover')
    mapMover.innerHTML = svg

    map.appendChild(mapMover)
    this.el.appendChild(map)
    this.mapEl = map
    this.mapMover = mapMover

    this.svg = map.querySelector('svg')
    if (!this.svg) return

    const hovers = map.querySelectorAll('.kwc-map-hover')

    hovers.forEach(el => {
      const id = el.getAttribute('id')
      el.addEventListener('mouseenter', () => {
        this.hover.set(id)
      })
      el.addEventListener('mouseleave', () => {
        if (this.hover.value === id) this.hover.set(null)
      })
    })

    this.createWaves()
    this.handleResize()
    this.createControls()
    this.createGestures()
    this.isLoaded = true
  }

  addZoom = (z: number) =>
    this.zoom.set(minmax(MIN_ZOOM, this.zoom.value + z, MAX_ZOOM))

  zoomIn = () => this.addZoom(0.4)
  zoomOut = () => this.addZoom(-0.4)

  createGestures() {
    if (!this.mapEl) return
    const el = this.mapEl

    let isDown = new WatchedValue(false)
    let downAt = vec(0, 0)
    let downOffset = vec(0, 0)
    let downTime = 0
    isDown.subscribe(g => el.classList.toggle('i-grabbing', g))

    el.addEventListener('mousedown', e => {
      isDown.set(true)
      const x = e.pageX
      const y = e.pageY - scrollState.pos - el.getBoundingClientRect().top
      const o = this.offset.value
      const now = Date.now()
      downAt = vec(x, y)
      downOffset = vec(o.x, o.y)
      if (now - downTime < 200) {
        if (e.button === 0) {
          this.zoomIn()
        } else if (e.button === 2) {
          this.zoomOut()
        }
      }
      downTime = now
    })

    el.addEventListener('mouseup', () => isDown.set(false))

    el.addEventListener('mouseleave', () => isDown.set(false))

    el.addEventListener('mousemove', e => {
      const { w, h } = sizeState
      const x = e.pageX
      const y = e.pageY - scrollState.pos - el.getBoundingClientRect().top

      if (this.hover.value) {
        this.mouse.set(vec(x, y))
      }

      if (isDown.value) {
        const dx = (x - downAt.x) / w
        const dy = (y - downAt.y) / h
        const o = downOffset
        this.offset.set(vec(o.x - dx, o.y - dy))
      }
    })

    el.addEventListener('contextmenu', e => e.preventDefault())
  }

  createControls() {
    if (!this.el) return
    const el = this.el

    const controls = document.createElement('div')
    controls.classList.add('kwc-map-controls')

    const zoomIn = document.createElement('div')
    zoomIn.classList.add('kwc-map-zoom-in')
    zoomIn.addEventListener('click', this.zoomIn)

    const zoomOut = document.createElement('div')
    zoomOut.classList.add('kwc-map-zoom-out')
    zoomOut.addEventListener('click', this.zoomOut)

    const zoomBar = document.createElement('div')
    zoomBar.classList.add('kwc-map-zoom-bar')

    const zoomDot = document.createElement('div')
    zoomDot.classList.add('kwc-map-zoom-dot')

    let isDown = false
    zoomBar.addEventListener('mousedown', () => (isDown = true))
    controls.addEventListener('mouseup', () => (isDown = false))
    controls.addEventListener('mouseleave', () => (isDown = false))
    zoomBar.addEventListener('mousemove', e => {
      if (isDown) {
        const rect = zoomBar.getBoundingClientRect()
        const zoom = 1 - (e.pageY - scrollState.pos - rect.top) / rect.height
        this.zoom.set(zoom * (MAX_ZOOM - MIN_ZOOM) + MIN_ZOOM)
      }
    })

    const handleZoom = () =>
      (zoomDot.style.top =
        (1 - (this.zoom.value - 1) / (MAX_ZOOM - 1)) * 100 + '%')
    handleZoom()
    this.zoom.subscribe(handleZoom)

    controls.appendChild(zoomIn)
    zoomBar.appendChild(zoomDot)
    controls.appendChild(zoomBar)
    controls.appendChild(zoomOut)
    el.appendChild(controls)
  }

  createWaves() {
    if (!this.mapEl || !this.mapMover) return
    const mapMover = this.mapMover
    const hovers = this.mapEl.querySelectorAll('.kwc-map-hover')

    hovers.forEach(el => {
      const id = el.getAttribute('id')
      if (id === 'kwc-map-well') {
        const waves = this.createWavesItem()
        const x = Number(el.getAttribute('cx')) / W
        const y = Number(el.getAttribute('cy')) / H
        waves.style.left = x * 100 + '%'
        waves.style.top = y * 100 + '%'
        mapMover.appendChild(waves)
      }
    })
  }

  createWavesItem() {
    const waves = document.createElement('div')
    waves.classList.add('kwc-map-waves')
    const dur = 2
    Array.from(Array(4)).forEach((_, i) => {
      const wave = document.createElement('div')
      wave.classList.add('kwc-map-wave')
      wave.style.animationDelay = i / dur + 's'
      waves.appendChild(wave)
    })
    return waves
  }
}
