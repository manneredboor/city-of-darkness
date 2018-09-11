import { dewi, china } from 'utils/fontObserver'
import { introLoading } from './Intro'
import { unlockScroll } from 'utils/scroll'
require('./css/spinner.css')

const introImgLoad = new Promise(resolve => {
  const img = new Image()
  img.src = 'http://ucraft.neekeesh.com/img/bg.jpg'
  if (img.complete) {
    resolve()
  } else {
    img.onload = resolve
  }
})

const pageLoad = new Promise(resolve => {
  if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', resolve)
  } else {
    resolve()
  }
})

Promise.all([
  dewi.load(),
  china.load(),
  pageLoad,
  introLoading,
  introImgLoad,
]).then(() => {
  const spinner = document.querySelector('.spinner-wrap')
  if (spinner && spinner.parentNode) {
    spinner.classList.add('i-hidding')
    spinner.addEventListener('transitionend', e => {
      if (e.propertyName === 'opacity' && spinner && spinner.parentNode) {
        spinner.parentNode.removeChild(spinner)
        unlockScroll()
      }
    })
  }
})
