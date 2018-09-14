import { WatchedValue } from './WatchedValue'
require('../css/scroll-lock.css')

declare global {
  interface Window {
    kwcLockerStack: number
  }
}

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
  pos: 0,
}

export const scrollPos = new WatchedValue(0)

if (window.kwcLockerStack === undefined) window.kwcLockerStack = 0
let savedScroll = 0

const handleScroll = () => {
  scrollState.pos = window.kwcLockerStack > 0 ? savedScroll : getScroll()
  scrollPos.set(scrollState.pos)
}

export const scrollTo = (y: number) => {
  if (window.kwcLockerStack) {
    if (body) body.style.top = `-${y}px`
    scrollPos.set(y)
  } else {
    window.scrollTo(0, y)
  }
}

handleScroll()
window.addEventListener('scroll', handleScroll)

// Scroll Locker
export const lockScroll = () => {
  if (++window.kwcLockerStack > 1) return
  const scroll = scrollPos.value
  savedScroll = scroll
  body.classList.add(bodyLockClass)
  html.classList.add(htmlLockClass)
  body.style.top = `-${scroll}px`
}

// Scroll Unlocker
export const unlockScroll = () => {
  if (--window.kwcLockerStack > 0) return
  body.classList.remove(bodyLockClass)
  html.classList.remove(htmlLockClass)
  body.style.top = ''
  window.scrollTo(0, savedScroll)
}
