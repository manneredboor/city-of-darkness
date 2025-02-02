import { scrollPos } from 'modules/utils/scroll'
import { sizeState } from 'modules/utils/resize'
import { minmax } from 'modules/utils/math'
import { getPosition } from 'modules/utils/getPosition'

const MutationObserver =
  (window as any).MutationObserver ||
  (window as any).WebKitMutationObserver ||
  (window as any).MozMutationObserver

const coeff = 30

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
  if (img.dataset.original && img.src !== img.dataset.original) {
    if (!MutationObserver) return

    const observer = new MutationObserver((mutations: any) => {
      mutations.forEach((mutation: any) => {
        if (mutation.type == 'attributes' && mutation.attributeName === 'src') {
          observer.disconnect()
          initPhoto(img)
        }
      })
    })

    observer.observe(img, { attributes: true })

    return
  } else if (!img.complete) {
    img.addEventListener('load', () => initPhoto(img))
    return
  }

  const parent = img.parentNode as HTMLElement
  if (!parent) return

  const wrap = document.createElement('div')
  wrap.classList.add('kwc-parallax-photo__wrap')
  wrap.style.paddingBottom =
    (img.naturalHeight / img.naturalWidth) * (100 - coeff / 2) + '%'
  parent.insertBefore(wrap, img)

  img.classList.add('kwc-parallax-photo__img')
  // img.style.top = `-${coeff / 2}%`
  // img.style.left = `-${coeff / 2}%`
  // img.style.width = `${coeff + 100}%`
  // img.style.minWidth = `${coeff + 100}%`
  wrap.appendChild(img)

  let lastRender = -1

  const handleScroll = (value: number) => {
    // const rect = wrap.getBoundingClientRect()
    const rect = getPosition(wrap)
    const imgH = rect.height
    const top = rect.top - scrollPos.value + imgH
    const path = sizeState.h + imgH
    // const prog = minmax(0, (rect.top + imgH) / path, 1)
    const prog = minmax(0, top / path, 1)
    const offset = imgH * (coeff / 100)
    const pos = Math.round((1 - prog) * offset - offset)
    if (pos !== lastRender) {
      lastRender = pos
      img.style.transform = `translate3d(0, ${pos}px, 0)`
    }
  }

  scrollPos.subscribe(handleScroll)
}

photos.forEach((img: HTMLImageElement) => initPhoto(img))
