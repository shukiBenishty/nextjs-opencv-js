import Head from 'next/head'
import styles from '../styles/Home.module.css'
import Opencv from "../Opencv"



export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Opencv with Next App</title>
        <meta name="description" content="Run Opencv.ja with Next.js" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Opencv/>
      </div>
  )
}
