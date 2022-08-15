import { useCallback, useRef, useState } from "react";
import Webcam from "react-webcam";


function Camera({imgRes, onCapture}) {
    const [loading, setLoading] = useState(true)
    const webcamRef = useRef(null);

    return (
        <>
            <Webcam
                style={{ visibility: loading ? "collapse" : "visible" }}
                onUserMedia={() => setLoading(false)}
                forceScreenshotSourceSize
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
            >

            </Webcam>
            {
                loading ?
                    <p>Loading</p> :
                    <>
                        <br />
                        <button
                            sx={{
                                maxWidth: "max-content"
                            }}
                            variant="contained"
                            onClick={() => {
                                const imageSrc = webcamRef.current.getScreenshot(imgRes)
                                setLoading(true)
                                onCapture(imageSrc)
                            }}
                        >
                            Capture photo
                        </button>
                        <br />
                    </>
            }
        </>
    );
}

export default Camera;