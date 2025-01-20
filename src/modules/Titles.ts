import measureText from 'modules/utils/measureText'
import { fonts } from 'modules/utils/fontObserver'
import { scrollState } from 'modules/utils/scroll'
import { onResize } from 'modules/utils/resize'

const titles = document.querySelectorAll('.kwc-title')

const genTexts = (text: string, n: number) => {
  const mover = document.createElement('div')
  mover.classList.add('kwc-title-mover')
  mover.innerHTML = Array.from(Array(n))
    .map(() => `<div class="kwc-title-text">${text}</div>`)
    .join('')
  return mover
}

let scrollers: (() => void)[] = []
let lastRenderedScroll = 0

const render = () => {
  scrollers = []

  if (titles) {
    titles.forEach((title, i) => {
      const el = title as HTMLElement
      const text = String(el.dataset.text)
      const isReversed = el.classList.contains('kwc-title-reverse')

      title.innerHTML = `
        <div class="kwc-title-inner">
          <div class="kwc-title-skew"></div>
          <div class="kwc-title-column"></div>
        </div>
      `

      const column = title.querySelector('.kwc-title-column') as HTMLElement
      const skew = title.querySelector('.kwc-title-skew') as HTMLElement

      column.style.textAlign = 'left'

      const columnW = column.offsetWidth
      const skewW = skew.offsetWidth
      const textW = measureText(text, 'kwc-title-text')

      column.innerHTML = ''
      skew.innerHTML = ''
      const columnText = genTexts(text, Math.ceil(columnW / textW) * 2)
      const skewText = genTexts(text, Math.ceil(columnW / textW) * 2)
      column.appendChild(columnText)
      skew.appendChild(skewText)

      skewText.style.transform = `translateX(${-columnW}px)`

      const handleScroll = () => {
        const pos = (scrollState.pos * 0.85) % textW
        if (isReversed) {
          columnText.style.transform = `translateX(${pos - skewW}px)`
          skewText.style.transform = `translateX(${pos}px)`
        } else {
          columnText.style.transform = `translateX(${pos}px)`
          skewText.style.transform = `translateX(${pos - columnW}px)`
        }
      }

      handleScroll()
      scrollers[i] = handleScroll
    })
  }
}

fonts.then(render)
onResize.subscribe(render)

const raf = () => {
  if (lastRenderedScroll !== scrollState.pos) {
    scrollers.forEach((s) => s())
    lastRenderedScroll = scrollState.pos
  }
  window.requestAnimationFrame(raf)
}

window.requestAnimationFrame(raf)
