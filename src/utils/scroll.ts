const getScroll = () =>
  window.pageYOffset ||
  document.documentElement.scrollTop ||
  document.body.scrollTop ||
  0

const scrollState = {
  pos: getScroll(),
}

window.addEventListener('scroll', () => {
  scrollState.pos = getScroll()
})

export default scrollState
