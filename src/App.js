import React, { useEffect, useState } from 'react'
import './App.css'
import * as Z from './Unzip'
const { zip } = Z

export default (props) => {
  const [entries, setEntries] = useState([])
  const [url, setURL] = useState(null)

  const view = (entry) => {
    const ext = entry.filename.split('.').pop()
    let type = 'text/html'
    switch(ext) {
      case 'jpg':
      case 'jpeg':
        type = 'image/jpeg'
        break
      case 'png':
        type = 'image/png'
        break
      case 'css':
        type = 'text/css'
        break
      case 'html':
      case 'htm':
        type = 'text/html'
        break
      default:
        type = 'text/plain'
    }
    const writer = new zip.BlobWriter(type)
    entry.getData(writer, (blob) => {
      setURL(URL.createObjectURL(blob))
    })
  }

  useEffect(() => {
    fetch('pg34488-images.epub')
    .then(async (res) => {
      const reader = new zip.HttpReader('pg34488-images.epub')
      zip.createReader(reader, function(zipReader) {
        zipReader.getEntries(setEntries)
      }, console.error)
    })
  }, [])

  return <React.Fragment>
    <head>
      <link rel="icon" href="favicon.ico" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#000000" />
      <link rel="apple-touch-icon" href="logo192.png" />
      <link rel="manifest" href="manifest.json" />
      <title>Μïmir</title>
    </head>
    <body>
      <ul>
        {entries.map((e, i) => (
          <li key={i} onClick={() => view(e)}>{e.filename}</li>
        ))}
      </ul>
      {url && <iframe style={{width: '100%', height: '50vh'}} src={url}/>}
    </body>
  </React.Fragment>
}