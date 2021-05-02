import React from 'react'
import { ReactReader } from 'mimis-reader'

const TocItem = ({ setLocation, href, label, styles }) => (
  <button onClick={() => setLocation(href)} style={styles}>
    {label}
  </button>
)

// eslint-disable-next-line import/no-anonymous-default-export
export default () => (
  <div style={{ position: 'relative', height: '100vh' }}>
    <ReactReader
      url={"https://s3.amazonaws.com/moby-dick/OPS/package.opf"}
      // url={"/RLT/content.opf"}
      title={"The Road Less Traveled"}
      //location={"epubcfi(/6/2[cover]!/6)"}
      locationChanged={epubcifi => console.log(epubcifi)}
    />
  </div>
)