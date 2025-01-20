import { lockScroll } from 'modules/utils/scroll'
lockScroll()

// Show loader after 300 ms of loading
setTimeout(() => {
  const spinnerBar = document.querySelector('.kwc-spinner-bar') as HTMLElement
  if (spinnerBar) spinnerBar.classList.add('i-visible')
}, 500)
