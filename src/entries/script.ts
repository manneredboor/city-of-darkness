import { Intro } from '../Intro'
import '../Titles'
import '../Letters'

const intro = document.querySelector('.kwc-intro')
if (intro) {
  ;(window as any).kwcIntro = new Intro(intro as HTMLElement)
}
