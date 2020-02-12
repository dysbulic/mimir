import React, { useEffect, useState } from 'react'
import './index.css'
import * as Mimir from '../mimir'
import * as Z from '../Unzip'
const { zip } = Z

export default (props) => {
  const [docs, setDocs] = useState([])
  const [styles, setStyles] = useState([])
  const [url, setURL] = useState(
    //'//cloudfare-ipfs.com/ipfs/QmQbKnEybE89wrQeK2TAaGjwstWimyRJt7cDWCN1ptzzkX'
    'http://localhost/.../guten-cache/cache/epub/34488/pg34488-images.epub'
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

  return <React.Fragment>
    <head>
      <link rel="icon" href="favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <link rel="apple-touch-icon" href="logo192.png" />
      <link rel="manifest" href="manifest.json" />
      {styles.map((s, i) => <link key={i} rel='stylesheet' href={s}/>)}
      <link rel='stylesheet' href='mimir.css'/>
      <title>Μïmir</title>
    </head>
    <body>
      <div className='content'>
        {docs.map((d, i) => (
          <div key={i} dangerouslySetInnerHTML={{__html: d.outerHTML}}/>
        ))}
      </div>
    </body>
  </React.Fragment>
}