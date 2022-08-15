import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Opencv from "../Opencv"
import Modal from '../Modal'
import { useRef, useState } from 'react'
import Camera from '../Camera'

function dataURItoImageData(dataURI, width) {
  var buffer =  Buffer.from(dataURI.split(',')[1], 'base64')
  var imgData = new ImageData(new Uint8ClampedArray(buffer), width)
  return imgData;
}


function convertDataURLToImage(dataURL, callback) {
  if (dataURL !== undefined && dataURL !== null) {
      let image = new Image();

      image.addEventListener('load', function(){
          callback(image)
      }, false);
      image.src = dataURL;
   }
}

export default function Home() {
  const [open, setOpen] = useState(false)
  const [img, setImg] = useState(null)
  return (
    <div className={styles.container}>
      <Head>
        <title>Opencv with Next App</title>
        <meta name="description" content="Run Opencv.ja with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {open && <Modal open={open} onClose={() => setOpen(false)}>
        <Camera onCapture={(imgUrl) => {
          let img = convertDataURLToImage(imgUrl, (i) => setImg(i))
          
          setOpen(false)

        }} imgRes={{ width: 1920, height: 1080 }} />
      </Modal>}
      <button onClick={() => setOpen(true)}>Open Camera</button>
      { img && 
        <Opencv img={img} width={1920} height={1080}/>
      }
    </div>
  )
}
