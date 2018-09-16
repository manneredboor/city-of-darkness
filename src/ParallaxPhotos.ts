import { scrollPos } from 'utils/scroll'
import { sizeState } from 'utils/resize'
import { minmax } from 'utils/math'
require('./css/parallax-photo.css')

const coeff = 20

const selectors = [
  '.kwc-photo',
  '[datamodule-id="1797"] img',
  '[datamodule-id="1800"] img',
  '[datamodule-id="1832"] img',
  '[datamodule-id="1860"] img',
  '[datamodule-id="1874"] img',
  '[datamodule-id="1941"] img',
  '[datamodule-id="1948"] img',
  '[datamodule-id="1953"] img',
  '[datamodule-id="1907"] img',
  '[datamodule-id="1913"] img',
  '[datamodule-id="1923"] img',
  '[datamodule-id="1934"] img',
  '[datamodule-id="1982"] img',
  '[datamodule-id="1992"] img',
]
const photos = document.querySelectorAll(selectors.join(', '))

const initPhoto = (img: HTMLImageElement) => {
  const parent = img.parentNode as HTMLElement
  if (!parent) return

  const wrap = document.createElement('div')
  wrap.classList.add('kwc-parallax-photo__wrap')
  wrap.style.paddingBottom = (img.naturalHeight / img.naturalWidth) * 100 + '%'
  parent.insertBefore(wrap, img)

  img.classList.add('kwc-parallax-photo__img')
  img.style.top = `-${coeff / 2}%`
  img.style.left = `-${coeff / 2}%`
  img.style.width = `${coeff + 100}%`
  img.style.minWidth = `${coeff + 100}%`
  wrap.appendChild(img)

  let lastRender = -1

  const handleScroll = (value: number) => {
    const rect = wrap.getBoundingClientRect()
    const imgH = rect.height
    const path = sizeState.h + imgH
    const prog = minmax(0, (rect.top + imgH) / path, 1)
    const offset = imgH * (coeff / 100)
    const pos = Math.round((1 - prog) * offset - offset / 2)
    if (pos !== lastRender) {
      lastRender = pos
      img.style.transform = `translateY(${pos}px)`
    }
  }

  scrollPos.subscribe(handleScroll)
}

photos.forEach((img: HTMLImageElement) => {
  if (img.complete) {
    initPhoto(img)
  } else {
    img.addEventListener('load', () => initPhoto(img))
  }
})
