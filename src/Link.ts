const link = document.querySelectorAll('.nav-item');

for(let i = 0; i < link.length; i++) {
  link[i].addEventListener('click', e => {
    if (!e.currentTarget) return
    console.log(e.currentTarget)
    
    // if (location.pathname === this.href.pathname) {
    //   if (location.href === this.pathname) return

    //   const el = document.querySelector(this.href.hash)
    //   // if (el) scrollTo(el.getBoundingClientRect().top + scrollPos.value)
    //   if (el) el.scrollIntoView(true)
    // }
  })
}