export const getPosition = (elm: HTMLElement) => {
  let xPos = 0
  let yPos = 0
  let el: HTMLElement | null = elm

  while (el) {
    xPos += el.offsetLeft - el.scrollLeft + el.clientLeft
    yPos += el.offsetTop - el.scrollTop + el.clientTop
    el = el.offsetParent as HTMLElement
  }

  return { left: xPos, top: yPos, height: elm.offsetHeight }
}
