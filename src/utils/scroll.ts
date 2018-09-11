require('../css/scroll-lock.css')

const body = document.body
const html = document.documentElement

const bodyLockClass = 'body-scroll-lock'
const htmlLockClass = 'html-scroll-lock'

const getScroll = () =>
  window.pageYOffset ||
  document.documentElement.scrollTop ||
  document.body.scrollTop ||
  0

export const scrollState = {
  pos: getScroll(),
}

window.addEventListener('scroll', () => {
  scrollState.pos = getScroll()
})

declare global {
  interface Window {
    kwcLockerStack: number
  }
}

if (window.kwcLockerStack === undefined) window.kwcLockerStack = 0

// Scroll Locker
export const lockScroll = () => {
  if (++window.kwcLockerStack > 1) return
  const scroll = scrollState.pos
  if (body) body.classList.add(bodyLockClass)
  if (html) html.classList.add(htmlLockClass)
  if (body) body.style.top = `-${scroll}px`
}

// Scroll Unlocker
export const unlockScroll = () => {
  if (--window.kwcLockerStack > 0) return
  if (body) body.classList.remove(bodyLockClass)
  if (html) html.classList.remove(htmlLockClass)
  if (body) body.style.top = ''
  const scroll = scrollState.pos
  window.scrollTo(0, scroll)
}
