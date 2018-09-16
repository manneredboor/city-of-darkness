import { fonts } from 'utils/fontObserver'
import { introLoading } from './Intro'
import { unlockScroll, scrollPos, scrollTo } from 'utils/scroll'
import { WatchedValue } from 'utils/WatchedValue'
require('./css/spinner.css')

const pageLoad = new Promise(resolve => {
  if (document.readyState == 'loading') {
    document.addEventListener('DOMContentLoaded', resolve)
  } else {
    resolve()
  }
})

const waiters = [fonts, introLoading, pageLoad]

// const images = document.querySelectorAll('img')
// images.forEach(img => {
//   waiters.push(
//     new Promise(resolve => {
//       if (img.complete) {
//         resolve()
//       } else {
//         img.addEventListener('load', resolve)
//       }
//     }),
//   )
// })

const removeSpinner = () => {
  const spinner = document.querySelector('.kwc-spinner-wrap')
  if (spinner && spinner.parentNode) {
    spinner.classList.add('i-hidding')
    unlockScroll()

    setTimeout(() => {
      if (location.hash !== '') {
        const el = document.querySelector(location.hash)
        if (el) scrollTo(el.getBoundingClientRect().top + scrollPos.value)
      }
    }, 0)

    spinner.addEventListener('transitionend', e => {
      if (e.propertyName === 'opacity' && spinner && spinner.parentNode) {
        spinner.parentNode.removeChild(spinner)
      }
    })
  }
}

setTimeout(() => {
  const spinnerProg = document.querySelector('.kwc-spinner-prog') as HTMLElement

  if (!spinnerProg) return

  const prog = new WatchedValue(0)

  waiters.forEach(w => {
    w.then(() => prog.set(prog.value + 1))
  })

  prog.subscribe(p => {
    if (!spinnerProg) return
    spinnerProg.style.width = (p / waiters.length) * 100 + '%'
  })
}, 500)

Promise.all(waiters)
  .then(removeSpinner)
  .catch(removeSpinner)
