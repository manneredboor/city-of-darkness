require('modules/vendor/parlin-noise')
import { Intro } from '../modules/Intro'
import { Map } from '../modules/Map'
import { NavBg } from '../modules/Nav'
import '../modules/Letters'
import '../modules/Spinner'
import '../modules/Plans'
import '../modules/WideScroll'
import '../modules/Stories'
import '../modules/ParallaxPhotos'
import '../modules/Link'

new Map()
new NavBg()
;(window as any).kwcIntro = new Intro()
