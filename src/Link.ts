const links = document.querySelectorAll('.nav-item')

links.forEach(l =>
  l.addEventListener('click', e => {
    if (e.currentTarget && e.currentTarget instanceof HTMLAnchorElement) {
      console.log(e.currentTarget.href)

      if (location.pathname === e.currentTarget.pathname) {
        if (location.href === e.currentTarget.href) return
  
        const el = document.querySelector(e.currentTarget.hash)
        if (el) el.scrollIntoView(true)
      }
    }
  }),
)