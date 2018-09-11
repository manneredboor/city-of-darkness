import { fonts } from 'utils/fontObserver'
import { introLoading } from './Intro'
import { unlockScroll } from 'utils/scroll'
require('./css/spinner.css')

const pageLoad = new Promise(resolve => {
  if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', resolve)
  } else {
    resolve()
  }
})

const removeSpinner = () => {
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
}

Promise.all([fonts, pageLoad, introLoading]).then(removeSpinner)
// .catch(removeSpinner)
