import React, { useEffect, useState, useRef } from 'react'
import './index.scss'
//import * as Mimir from '../mimir'
import * as Z from '../Unzip'
const { zip } = Z

export default (props) => {
  const [docs, setDocs] = useState([])
  const [styles, setStyles] = useState([])
  const [url, setURL] = useState(
    //'//cloudfare-ipfs.com/ipfs/QmQbKnEybE89wrQeK2TAaGjwstWimyRJt7cDWCN1ptzzkX'
    'http://localhost/.../guten-cache/cache/epub/34488/pg34488-images.epub'
  )
  const frame = useRef()

  const setPage = (p) => {
    if(isNaN(p)) return
    const f = frame.current
    f.scrollTo(p * f.clientWidth, 0)
  }
  
  const deltaPage = (d) => {
    const f = frame.current
    const curr = Math.round(f.scrollLeft / f.offsetWidth)
    setPage(curr + d)
  }

  const listeners = {
    wheel: (evt) => {
      const delta = evt.deltaX + evt.deltaY
      const pages = Math.abs(delta) / delta
      deltaPage(pages)
    },
    keyup: (evt) => {
      if(evt.key === 'ArrowDown' || evt.key === 'ArrowRight') {
        deltaPage(1)
      } else if(evt.key === 'ArrowUp' || evt.key === 'ArrowLeft') {
        deltaPage(-1)
      } else if(evt.key === 'PageUp') {
        deltaPage(-5)
      } else if(evt.key === 'PageDown') {
        deltaPage(5)
      }
    },
  }

  useEffect(() => {
    Object.keys(listeners).forEach((t) => {
      window.addEventListener(t, listeners[t])
    })
    return () => {
      Object.keys(listeners).forEach((t) => {
        window.removeEventListener(t, listeners[t])
      })
    }
  }, [])

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
  
  const process = (entries) => {
    const content = entries.find(
      e => e.filename === 'OEBPS/content.opf'
    )
    const writer = new zip.BlobWriter('text/xml')
    content.getData(writer, (blob) => {
      const reader = new FileReader()
      reader.onload = async () => {
        const doc = (new DOMParser()).parseFromString(reader.result, 'text/xml')
        const spine = doc.querySelectorAll('spine itemref')
        let manifest = [], images = {}, styles = []
        for(const val of spine.values()) {
          const ref = val.attributes['idref'].value
          const item = doc.querySelector(`manifest #${ref}`)
          const file = item.attributes['href'].value
          manifest.push(entries.find(
            e => e.filename === `OEBPS/${file}`
          ))
        }
        let promises = []
        doc.querySelectorAll('item').forEach((item) => {
          const type = item.attributes['media-type'].value
          const href = item.attributes['href'].value
          if(/^(image\/|text\/css)/.test(type)) {
            promises.push(new Promise((resolve, reject) => {
              const writer = new zip.BlobWriter(type)
              const entry = entries.find(
                e => e.filename === `OEBPS/${href}`
              )
              entry.getData(writer, (blob) => {
                if(/^image\//.test(type)) {
                  images[href] = URL.createObjectURL(blob)
                } else if(type === 'text/css') {
                  styles.push(URL.createObjectURL(blob))
                }
                resolve()
              })
            }))
          }
        })
        await Promise.allSettled(promises)
        setStyles(styles)
        promises = manifest.map((m) => 
          new Promise((resolve, reject) => {
            const writer = new zip.BlobWriter('text/html')
            m.getData(writer, (blob) => {
              const reader = new FileReader()
              reader.onload = () => {
                const doc = (new DOMParser()).parseFromString(reader.result, 'text/html')
                doc.querySelectorAll('img').forEach((img) => {
                  const href = img.attributes['src'].value
                  img.setAttribute('src', images[href])
                })
                doc.querySelectorAll('a').forEach((link) => {
                  if(link.attributes['href']) {
                    const href = link.attributes['href'].value
                    if(/#/.test(href)) {
                      link.setAttribute('href', href.replace(/^.*#/, '#'))
                    }
                  }
                })
                resolve(doc)
              }
              reader.readAsText(blob)
            })
          })
        )
        Promise.allSettled(promises).then((res) => {
          let elems = res.map(r => r.value.querySelectorAll('body > *'))
          elems = elems.map(e => Array.from(e)).flat()
          setDocs(elems)
        })
      }
      reader.readAsText(blob)
    })
  }

  useEffect(() => {
    const reader = new zip.HttpReader(url)
    zip.createReader(reader, function(zipReader) {
      zipReader.getEntries(process)
    }, console.error)
  }, [url])

  return <div className='mimir'>
    {styles.map((s, i) => <link key={i} rel='stylesheet' href={s}/>)}
    <div className='frame' ref={frame}><div className='content'>
      {docs.map((d, i) => (
        <div key={i} dangerouslySetInnerHTML={{__html: d.outerHTML}}/>
      ))}
    </div></div>
  </div>
}