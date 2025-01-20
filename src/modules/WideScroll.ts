const Sine = (window as any).Sine
const ScrollMagic = (window as any).ScrollMagic
const TweenMax = (window as any).TweenMax

const init = () => {
  const scrollBox = document.querySelector('.kwc-scroll-wrapper') as HTMLElement
  const scImg = document.querySelector('.kwc-scroll-img') as HTMLElement

  if (!scImg || !scrollBox) return

  let move = -(scImg.offsetWidth - scrollBox.offsetWidth)
  let yPos = 0
  let scene

  const countPos = (el: HTMLElement) => {
    const scroll =
      window.pageYOffset ||
      document.documentElement.scrollTop ||
      document.body.scrollTop ||
      0
    yPos = el.getBoundingClientRect().top + scroll
    return yPos
  }

  countPos(scrollBox)

  // ScrollImage
  let controller = new ScrollMagic.Controller()

  function initScroll() {
    if (!controller) controller = new ScrollMagic.Controller()

    const tween = TweenMax.to('.kwc-scroll-img', 5, {
      x: move,
      ease: Sine.easeInOut,
    })

    scene = new ScrollMagic.Scene({
      triggetElement: '.kwc-scroll-wrapper',
      duration: 5000,
      offset: yPos,
    })
      .setTween(tween)
      .setPin('.kwc-scroll-wrapper', { pushFollowers: true })
      .addTo(controller)

    return scene
  }

  initScroll()

  window.addEventListener('resize', function () {
    controller = controller.destroy(true)
    countPos(scrollBox)
    move = -(scImg.offsetWidth - scrollBox.offsetWidth)
    initScroll()
  })
}

window.addEventListener('load', init)
