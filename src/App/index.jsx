import React, { useEffect, useState } from 'react'
import Mimir from '../Mimir'
import { BrowserRouter as Router } from 'react-router-dom'
import 'antd/dist/antd.css'
import './index.scss'
import Reader from '../Reader'

export default (props) => (
  <Router>
    <Reader/>
  </Router>
)