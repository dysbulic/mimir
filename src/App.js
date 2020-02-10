import React, { useEffect } from 'react'
import './App.css'
import * as Z from './Unzip'
import * as ZExt from './Unzip/Ext'
const zip = {...Z.zip, ...ZExt.zip}

export default (props) => {
  useEffect(() => {
    fetch('pg34488-images.epub')
      .then(async (res) => {
        console.log(res, zip)
        const reader = res.body.getReader()
        zip.createReader(reader, function(zipReader) {
					zipReader.getEntries(console.info);
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
    </body>
  </React.Fragment>
}