import { Delegate } from './Delegate'

export const onResize = new Delegate()

export const sizeState = {
  h: -1,
  scale: 1,
  w: -1,
}

const handleResize = () => {
  const rootEl =
    document.compatMode === 'BackCompat'
      ? document.body
      : document.documentElement
  sizeState.h = Math.min(rootEl.clientHeight, window.innerHeight)
  sizeState.w = rootEl.clientWidth
  sizeState.scale =
    typeof window.devicePixelRatio === 'number' ? window.devicePixelRatio : 1
  onResize.fire()
}

window.addEventListener('resize', handleResize)
handleResize()

export const resizeCanvases = (
  canvases: { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D }[],
) => {
  const { w, h, scale } = sizeState
  canvases.forEach(({ c, ctx }) => {
    c.style.width = w + 'px'
    c.style.height = h + 'px'

    c.width = w * scale
    c.height = h * scale

    c.style.width = w + 'px'
    c.style.height = h + 'px'
  })
}
