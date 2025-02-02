import { scrollPos } from 'modules/utils/scroll'
import { onResize, sizeState } from 'modules/utils/resize'
import { narrow } from 'modules/utils/math'
import { easeInOutQuad } from 'modules/utils/easings'
import { getPosition } from 'modules/utils/getPosition'

const init = () => {
  const wrap = document.querySelector('.kwc-stories') as HTMLElement
  if (!wrap) return
  const inner = wrap.querySelector('.kwc-stories__inner') as HTMLElement
  const stories = wrap.querySelectorAll('.kwc-story')
  const fades = wrap.querySelectorAll('.kwc-story__fade')

  let oneLength = 0
  let isLocked = false
  const progs: number[] = []

  const handleResize = () => {
    oneLength = sizeState.h
    wrap.style.height = oneLength * stories.length + 'px'
  }

  handleResize()

  const handleScroll = (pos: number) => {
    // const rect = wrap.getBoundingClientRect()
    // const top = rect.top
    const rect = getPosition(wrap)
    const top = rect.top - scrollPos.value
    const shouldBeLocked = top <= 0 && top >= -(rect.height - sizeState.h)
    if (shouldBeLocked && !isLocked) {
      inner.classList.add('i-fixed')
      isLocked = true
    } else if (!shouldBeLocked && isLocked) {
      inner.classList.remove('i-fixed')
      isLocked = false
    }

    const prog = (top - oneLength) / -rect.height
    const onePath = 1 / stories.length

    stories.forEach((story: HTMLElement, i) => {
      const oneProg = easeInOutQuad(
        narrow(i * onePath, (i + 1) * onePath, prog),
      )
      if (progs[i] !== oneProg) {
        progs[i] = oneProg
        if (i > 0) {
          story.style.transform = `translateX(${100 - oneProg * 100}%)`
          ;(fades[i - 1] as HTMLElement).style.opacity = String(oneProg * 0.5)
        }
      }
    })
  }

  handleScroll(scrollPos.value)
  onResize.subscribe(handleResize)
  scrollPos.subscribe(handleScroll)
}

init()
