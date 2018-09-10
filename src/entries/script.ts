require('vendor/parlin-noise')
import { Intro } from '../Intro'
import { NavBg } from '../Nav'
// import '../Titles' // Deprecated
import '../Letters'

new NavBg()
const intro = document.querySelector('.kwc-intro')
if (intro) {
  ;(window as any).kwcIntro = new Intro(intro as HTMLElement)
}
