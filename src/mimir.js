const setPage = (p) => {
  if(isNaN(p)) return
  const ww = window.innerWidth
  //const ww = window.outerWidth
  const dw = document.documentElement.scrollWidth
  //window.scroll(dw / Math.round(dw / ww) * p, 0)
  window.scroll(ww * p, 0)
  console.log(p, window.scrollX, ww * p, dw, dw / ww)
  if(window.parent !== window) {
    window.parent.postMessage({ type: 'pageSet', page: p }, '*')
  }
}

const deltaPage = (d) => {
  const ww = window.innerWidth
  const dw = document.documentElement.scrollWidth
  const curr = Math.round(window.scrollX / (dw / Math.round(dw / ww)))
  setPage(curr + d)
}

window.addEventListener(
  'wheel',
  (evt) => {
    const delta = evt.deltaX + evt.deltaY
    const pages = Math.abs(delta) / delta
    deltaPage(pages)
  }
)

document.addEventListener(
  'scroll',
  () => {
    // Make sure the window is on an even multiple of
    // the page width
    const ww = window.innerWidth
    const dw = document.documentElement.scrollWidth
    const s = window.scrollX
    const page = s / ww
    if(Math.abs(page - Math.round(page)) > 0.05) {
      setPage(Math.floor(page))
    }
  }
)

window.addEventListener(
  'keyup',
  (evt) => {
    if(evt.key === 'ArrowDown' || evt.key === 'ArrowRight') {
      deltaPage(1)
    } else if(evt.key === 'ArrowUp' || evt.key === 'ArrowLeft') {
      deltaPage(-1)
    } else if(evt.key === 'PageUp') {
      deltaPage(-5)
    } else if(evt.key === 'PageDown') {
      deltaPage(5)
    }
  }
)

let lastTouch = null

window.addEventListener(
  'touchstart',
  (evt) => (
    lastTouch = { x: evt.touches[0].pageX, y: evt.touches[0].pageY }
  )
)

window.addEventListener(
  'touchmove',
  (evt) => {
    const pos = { x: evt.touches[0].pageX, y: evt.touches[0].pageY }
    const delta = {
      x: pos.x - lastTouch.x, y: pos.y - lastTouch.y
    }
    const radius = Math.sqrt(Math.pow(delta.x, 2) + Math.pow(delta.y, 2))
    if(radius > window.innerWidth / 10) {
      lastTouch = pos
      const offset = delta.x + delta.y
      deltaPage(Math.abs(offset) / offset)
    }
  }
)

window.addEventListener(
  'message',
  (evt) => {
    const { type, page } = evt.data
    if(type === 'setPage') setPage(page)
    if(type === 'deltaPage') deltaPage(page)
  }
)