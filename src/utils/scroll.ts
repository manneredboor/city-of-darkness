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
