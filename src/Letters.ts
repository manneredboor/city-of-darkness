import measureText from 'utils/measureText'
import { dewi } from 'utils/fontObserver'
import { scrollState } from 'utils/scroll'
import { onResize, sizeState } from 'utils/resize'
require('./css/letters.css')

const letters = document.querySelectorAll('.kwc-letter')

let scrollers: (() => void)[] = []
let lastRenderedScroll = 0

const render = () => {
  scrollers = []

  const { w: winW } = sizeState

  if (letters) {
    letters.forEach((letter: HTMLDivElement, i) => {
      const text = String(letter.dataset.text) + '&nbsp;&nbsp;'
      const textsWraps = letter.querySelectorAll('.kwc-letter-text')

      const textW = measureText(text, 'kwc-letter-text')
      const repeats = Array.from(Array(Math.ceil(winW / textW) * 2))
      const fullText = [...repeats].map(() => text).join('')

      const textEls = Array.from(textsWraps).map(() => {
        const el = document.createElement('div')
        el.classList.add('kwc-letter-text-itm')
        el.innerHTML = fullText
        return el
      })

      textsWraps.forEach((el: HTMLDivElement, i) => {
        el.innerHTML = ''
        el.appendChild(textEls[i])
      })

      const handleScroll = () => {
        const pos = (scrollState.pos * 0.85) % textW

        textsWraps.forEach((el: HTMLDivElement, i) => {
          const textEl = textEls[i]
          const offset = el.offsetLeft - pos + textEl.clientWidth / 2
          textEl.style.transform = `translateX(-${offset}px)`
        })
      }

      handleScroll()
      scrollers[i] = handleScroll
    })
  }
}

dewi.load().then(render)
onResize.subscribe(render)

const raf = () => {
  if (lastRenderedScroll !== scrollState.pos) {
    scrollers.forEach(s => s())
    lastRenderedScroll = scrollState.pos
  }
  window.requestAnimationFrame(raf)
}

window.requestAnimationFrame(raf)
