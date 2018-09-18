const link = document.querySelectorAll('.nav-item');

for(let i = 0; i < link.length; i++) {
  link[i].addEventListener('click', e => {
    if (!e.currentTarget) return
    console.log(e.currentTarget.href)
    
    // if (location.pathname === link[i].pathname) {
    //   if (location.href === link[i].href) return

    //   const el = document.querySelector(link[i].hash)
    //   if (el) el.scrollIntoView(true)
    // }
  })
}