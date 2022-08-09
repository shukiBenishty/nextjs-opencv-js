import Script from 'next/script'
import { useEffect, useRef, useState } from 'react';


const FPS = 10;

// function drawRect(img, points, thickness = 4, Offset = 50) {
//     let p1 = new cv.Point(points[0][0] - Offset, points[0][1] - Offset)
//     let p2 = new cv.Point(points[1][0] + Offset, points[1][1] - Offset)
//     let p3 = new cv.Point(points[2][0] + Offset, points[2][1] + Offset)
//     let p4 = new cv.Point(points[3][0] - Offset, points[3][1] + Offset)

//     let color = new cv.Scalar(255, 0, 0)

//     cv.line(img, p1, p2, color, thickness)
//     cv.line(img, p2, p3, color, thickness)
//     cv.line(img, p3, p4, color, thickness)
//     cv.line(img, p4, p1, color, thickness)
// }

// function grabCut(img) {
//     cv.cvtColor(img, img, cv.COLOR_RGBA2RGB, 0);
//     let mask = cv.Mat.zeros(img.cols, img.rows, cv.CV_8U);
//     let bgdModel = cv.Mat.zeros(1, 65, cv.CV_64F);
//     let fgdModel = cv.Mat.zeros(1, 65, cv.CV_64F);
//     let rect = new cv.Rect(25, 25, img.cols - 25, img.rows - 25);
//     cv.grabCut(img, mask, rect, bgdModel, fgdModel, 1, cv.GC_INIT_WITH_RECT);
//     for (let i = 0; i < img.rows; i++) {
//         for (let j = 0; j < img.cols; j++) {
//             if (mask.ucharPtr(i, j)[0] == 0 || mask.ucharPtr(i, j)[0] == 2) {
//                 img.ucharPtr(i, j)[0] = 0;
//                 img.ucharPtr(i, j)[1] = 0;
//                 img.ucharPtr(i, j)[2] = 0;
//             }
//         }
//     }
// }

// function bilateralFilter(src, dst) {
//     //highly effective in noise removal while keeping edges sharp.
//     let tmp = new cv.Mat();
//     cv.cvtColor(src, tmp, cv.COLOR_RGBA2RGB, 0);
//     // You can try more different parameters
//     cv.bilateralFilter(tmp, dst, 5, 75, 75, cv.BORDER_DEFAULT);
//     tmp.delete();
// }

// function countourToMinAreaRect(cnt) {
//     let rect = cv.minAreaRect(cnt)
//     let vertices = cv.RotatedRect.points(rect);
//     let m = cv.matFromArray(4, 2, cv.CV_32SC1, [
//         vertices[0].x, vertices[0].y,
//         vertices[1].x, vertices[1].y,
//         vertices[2].x, vertices[2].y,
//         vertices[3].x, vertices[3].y
//     ])
//     // Initialise a MatVector
//     let matVec = new cv.MatVector();
//     // Push a Mat back into MatVector
//     matVec.push_back(m);
//     return matVec;
// }

// function drawCanvas(title, img) {
//     var canvas = document.getElementById(`canvas-${title}`);
//     if (!canvas) {
//         var parent = document.createElement("div");
//         var div = document.createElement("div");
//         var text = document.createTextNode(title);
//         var canvas = document.createElement("canvas", {});
//         canvas.setAttribute("id", `canvas-${title}`)
//         div.appendChild(text)
//         parent.appendChild(canvas)
//         parent.appendChild(div)

//         var outputDiv = document.getElementById("output");
//         outputDiv.appendChild(parent);
//     }

//     cv.imshow(`canvas-${title}`, img);
// }

// function morphologyClose(src, dst = new cv.Mat()) {
//     let kernel = cv.Mat.ones(2, 2, cv.CV_8U)
//     let anchor = new cv.Point(-1, -1);
//     cv.morphologyEx(src, dst, cv.MORPH_CLOSE, kernel, anchor, 3,
//         cv.BORDER_CONSTANT, cv.morphologyDefaultBorderValue());
//     return dst;
// }


// function gaussianBlur(src, dst = new cv.Mat()) {
//     let _ksize = new cv.Size(5, 5);
//     cv.GaussianBlur(src, dst, _ksize, 1.4)
//     return dst;
// }

// function findContoursBySize(contours, minArea, maxArea, epsilonFactor = 0.02) {
//     let poly = new cv.MatVector();
//     for (let i = 0; i < contours.size(); i++) {
//         let cnt = contours.get(i);
//         let area = cv.contourArea(cnt)
//         if (area < minArea || area > maxArea)
//             continue;
//         poly.push_back(cnt)
//     }
//     return poly

// }

function resize(src, dst, MAX_DIM = 320) {
    let scale = 1.0 * MAX_DIM / Math.max(src.matSize[0], src.matSize[1])
    let dsize = new cv.Size(src.matSize[1] * scale, src.matSize[0] * scale);
    cv.resize(src, dst, dsize, 0, 0, cv.INTER_AREA);
}

function equalizeHistogram(src, dst) {
    cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY, 0);
    cv.equalizeHist(dst, dst);
}



function filter2DSharp(src, dst = new cv.Mat()) {
    let _anchor = new cv.Point(-1, -1);
    let _karnal = cv.matFromArray(3, 3, cv.CV_32FC1, [0, -1, 0, -1, 5, -1, 0, -1, 0]);
    cv.filter2D(src, dst, cv.CV_8U, _karnal, _anchor, 0, cv.BORDER_DEFAULT);
    return dst;
}

function findContours(contours, minArea, maxArea, epsilonFactor = 0.02) {
    let poly = new cv.MatVector();
    for (let i = 0; i < contours.size(); i++) {
        let cnt = contours.get(i);
        let area = cv.contourArea(cnt)
        if (area < minArea || area > maxArea)
            continue;
        let tmp = new cv.Mat();
        let peri = cv.arcLength(cnt, true)
        cv.approxPolyDP(cnt, tmp, epsilonFactor * peri, true)
        if (tmp.total() !== 4) {
            continue;
        }
        poly.push_back(tmp)
    }
    return poly

}


function Opencv() {

    const [cameraOpen, setCameraOpen] = useState(false)
    const [init, setInit] = useState(false)
    const [resolution, setResolution] = useState(null)

    const videoRef = useRef()

    useEffect(() => {
        if (cameraOpen && init && resolution) {
            const MAX_DIM = 640;
            const src = new cv.Mat(resolution.h, resolution.w, cv.CV_8UC4);
            const cap = new cv.VideoCapture("cam_input")



            let timer;

            function processVideo() {
                let begin = Date.now();
                let dst = new cv.Mat();
                let sharp = new cv.Mat()
                let gray = new cv.Mat()
                let canny = new cv.Mat()
                let dilate = new cv.Mat()
                let histo = new cv.Mat()
                let mBlur = new cv.Mat()
                let bw = new cv.Mat()
                let contours = new cv.MatVector();
                let hierarchy = new cv.Mat();
                let anchor = new cv.Point(-1, -1);
                let kernel = cv.Mat.ones(3, 3, cv.CV_8U);
                let color = new cv.Scalar(0, 255, 0)
                try {

        
                    cap.read(src);

                    // 1
                    resize(src, dst, MAX_DIM);
                    let maxArea = dst.matSize[0] * dst.matSize[1] * 0.95
                    let minArea = dst.matSize[0] * dst.matSize[1] * 0.1

                    // 2
                    sharp = filter2DSharp(dst)
                    // drawCanvas("sharp", sharp);

                    // 3
                    cv.cvtColor(sharp, gray, cv.COLOR_RGBA2GRAY, 0);
                    cv.Canny(gray, canny, 60, 180, 3, false);
                    // drawCanvas("canny", canny)

                    //find rect for sharp close edge
                    cv.findContours(canny, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
                    let c = findContours(contours, minArea, maxArea);

                    if (c.size() < 1) {
                        cv.dilate(canny, dilate, kernel, anchor, 2)
                        // drawCanvas("dilate", dilate)
                        cv.findContours(dilate, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);

                        c = findContours(contours, minArea, maxArea);
                        if (c.size() < 1) {
                            equalizeHistogram(sharp, histo);
                            // drawCanvas("histo", histo);
                            cv.medianBlur(histo, mBlur, 5)
                            // drawCanvas("mBlur", mBlur)
                            cv.threshold(mBlur, bw, 230, 255, cv.THRESH_BINARY)

                            cv.findContours(dilate, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);
                            c = findContours(contours, minArea, maxArea);
                        }
                    }


                    cv.cvtColor(dst, dst, cv.COLOR_BGR2RGB);
                    cv.drawContours(dst, c, -1, color, 2);
                    cv.cvtColor(dst, dst, cv.COLOR_RGB2BGR);
                    cv.imshow('canvas_output', dst);

                } catch (error) {
                    console.log(error);
                }finally{
                    dst.delete();
                    sharp.delete();
                    gray.delete();
                    canny.delete();
                    dilate.delete();
                    histo.delete();
                    mBlur.delete();
                    bw.delete();
                    contours.delete();
                    hierarchy.delete();
                    // anchor.delete();
                    kernel.delete();
                    // color.delete();
                }
                // schedule next one.
                let delay = 1000 / FPS - (Date.now() - begin);
                timer = setTimeout(processVideo, delay);
            }
            // schedule first one.
            timer = setTimeout(processVideo, 0);

            return () => clearTimeout(timer);
        }
    }, [cameraOpen, init, resolution])

    const onLoad = () => {
        // initOpenCv
        console.log("opencv loaded");
        cv['onRuntimeInitialized'] = () => {
            console.log("opencv initialized");
            setInit(true);
        };

        //openCamera
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                width: { min: 1024, ideal: 1280, max: 1920 },
                height: { min: 576, ideal: 720, max: 1080 },
                frameRate: { ideal: 10, max: FPS },
                facingMode: "environment",
            }
        }).then(function (stream) {
            //set video h, w
            let setting = stream.getVideoTracks()[0].getSettings()
            setResolution({ w: setting.width, h: setting.height })
            videoRef.current.setAttribute('width', setting.width)
            videoRef.current.setAttribute('height', setting.height)
            videoRef.current.srcObject = stream;
            videoRef.current.play();

            setCameraOpen(true);
        }).catch(function (err) {
            console.log("An error occurred! " + err);
        });
    }

    return (
        <>
            <Script async onLoad={onLoad} src="/opencv.js" />
            <canvas id="canvas_output"></canvas>

            <video ref={videoRef} id="cam_input" hidden></video>
        </>
    )
}

export default Opencv