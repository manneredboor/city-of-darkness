const links = document.querySelectorAll('.nav-item')

links.forEach(l =>
  l.addEventListener('click', e => {
    if (e.currentTarget && e.currentTarget instanceof HTMLAnchorElement) {
      console.log(e.currentTarget.href)
    }

    // if (location.pathname === link[i].pathname) {
    //   if (location.href === link[i].href) return

    //   const el = document.querySelector(link[i].hash)
    //   if (el) el.scrollIntoView(true)
    // }
  }),
)