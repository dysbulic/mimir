import React, { Component } from 'react'
import FileReaderInput from 'react-file-reader-input'
import {
  chakra, Box, Heading, Link, Stack, Text, Flex, Button,
  Spacer, Icon, Spinner,
} from '@chakra-ui/react'
import { BiExpand, BiUpload } from 'react-icons/bi'
import { ReactReader } from './modules'
import logo from './logo.svg'
import mïmir from './mïmir.svg'

const storage = global.localStorage || null

const DEMO_URL = '/mimis-reader/RLT/opf.opf'
const DEMO_NAME = 'M. Scott Peck – The Road Less Traveled'

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      fullscreen: false,
      location: storage?.getItem('epub-location') ?? 2,
      localFile: null,
      localName: null,
      largeText: false,
    }
    this.rendition = null
  }

  toggleFullscreen = () => (
    this.setState(
      { fullscreen: !this.state.fullscreen },
      () => {
        setTimeout(() => {
          const evt = document.createEvent('UIEvents')
          evt.initUIEvent('resize', true, false, global, 0)
        }, 1000)
      }
    )
  )

  onLocationChanged = (location) => {
    this.setState(
      { location },
      () => {
        storage?.setItem?.('epub-location', location)
      }
    )
  }

  onToggleFontSize = () => {
    const nextState = !this.state.largeText
    this.setState(
      { largeText: nextState },
      () => {
        this.rendition.themes.fontSize(
          nextState ? '140%' : '100%'
        )
      }
    )
  }

  getRendition = (rendition) => {
    console.log('getRendition callback', rendition)
    // Set inital font-size, and add a pointer to rendition for later updates
    //const { largeText } = this.state
    this.rendition = rendition
    //rendition.themes.fontSize(largeText ? '140%' : '100%')
  }

  handleChangeFile = (event, results) => {
    if(results.length > 0) {
      const [e, file] = results[0]
      if(file.type !== 'application/epub+zip') {
        throw new Error(`Unsupported Type: ${file.type}`)
      }
      this.setState({
        localFile: e.target.result,
        localName: file.name,
        location: null,
      })
    }
  }

  render() {
    const {
      fullscreen, location, localFile, localName
    } = this.state
    return (
      <Stack id="app">
        <Heading id="header" hidden={fullscreen}>
          <Flex>
            <Link href="https://github.com/gerhardsletten/react-reader">
              <chakra.img w="8rem" h="8rem" src={logo}/>
            </Link>
            <Stack mt={4}>
              <Link href="https://github.com/gerhardsletten/react-reader">
                <Text fontSize={40}>React Reader</Text>
              </Link>
              <Link href="https://github.com/futurepress/epub.js">
                <Text fontSize={25} fontWeight="normal">
                  Powered by ePubJS
                </Text>
              </Link>
            </Stack>
            <Flex>
              <Text fontSize={40}>w/</Text>
              <Link href="https://github.com/dysbulic/mimis-reader">
                <Flex>
                  <Text mt={4}> Mïmis</Text>
                  <chakra.img w="10rem" h="8rem" src={mïmir}/>
                </Flex>
              </Link>
            </Flex>
            <Spacer/>
            <Stack mt={30} mr={40}>
              <FileReaderInput as="buffer" onChange={this.handleChangeFile}>
                <Button fontSize={20}>
                  Upload Epub
                  <Icon as={BiUpload} ml={2.5}/>
                </Button>
              </FileReaderInput>
              <Button fontSize={20} onClick={this.toggleFullscreen}>
                Hide Title
                <Icon as={BiExpand} ml={2.5}/>
              </Button>
            </Stack>
          </Flex>
        </Heading>
        <Box id="reader" h={`calc(95vh - ${fullscreen ? 0 : 5}rem)`}>
          <ReactReader
            url={localFile || DEMO_URL}
            title={localName || DEMO_NAME}
            location={location}
            locationChanged={this.onLocationChanged}
            getRendition={this.getRendition}
            loadingView={<Spinner/>}
          />
          <Button
            opacity={0.5}
            onClick={this.onToggleFontSize}
            position="absolute"
            right={25} bottom={0}
            zIndex={20}
          >
            Toggle Font-Size
          </Button>
        </Box>
      </Stack>
    )
  }
}