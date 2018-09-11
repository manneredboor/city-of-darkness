require('vendor/parlin-noise')
import { Intro } from '../Intro'
import { Map } from '../Map'
import { NavBg } from '../Nav'
import '../Letters'
import '../Spinner'

new Map()
new NavBg()
;(window as any).kwcIntro = new Intro()
