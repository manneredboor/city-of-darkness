import { sizeState } from 'utils/resize'
import { minmax } from 'utils/math'
require('./css/plans.css')

const plans = document.querySelectorAll('.kwc-plans-wrap')

plans.forEach(el => {
  const img = el.querySelector('img')
  let lastProg = 0
  const handleScroll = () => {
    if (!img) return
    const { bottom, height, width } = img.getBoundingClientRect()
    const { h, w } = sizeState
    const prog = minmax(0, -(bottom - h + 60) / (h - height - 60), 1)

    if (lastProg !== prog) {
      const wrapW = w > 1030 ? 1200 : Math.min(w, 1000)
      img.style.transform = `translateX(-${prog * (width - wrapW)}px)`
      lastProg = prog
    }
  }
  window.addEventListener('scroll', handleScroll)
  handleScroll()
})
