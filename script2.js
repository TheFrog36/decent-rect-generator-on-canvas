const width = 600
const height = 800
const canvasInput = document.getElementById('canvas-input')
const canvasOutput = document.getElementById('canvas-output')
const targetCanvas = document.getElementById('target-img')
const differenceCanvas = document.getElementById('difference-canvas')
canvasInput.width = width
canvasInput.height = height
canvasOutput.width = width
canvasOutput.height = height
targetCanvas.height = height
targetCanvas.width = width
differenceCanvas.height = height
differenceCanvas.width = width
const inputCTX = canvasInput.getContext('2d')
const outputCTX = canvasOutput.getContext('2d')
const targetCTX = targetCanvas.getContext('2d')
const differenceCTX = differenceCanvas.getContext('2d')

outputCTX.fillStyle = 'rgba(0, 0, 0, 1)'
outputCTX.fillRect(0,0,width,height)


function calculateDifference(color1,color2){
    dRsqr = ((color1[0] - color2[0]) / 255  ) ** 2
    dGsqr = ((color1[1] - color2[1]) / 255) ** 2
    dBsqr = ((color1[2] - color2[2]) / 255) ** 2
    Rmod = (color1[0] + color2[0]) / (2 * 255)
    Rcomp = (2+Rmod) * dRsqr
    Gcomp = 4*dGsqr
    Bcomp = (3-Rmod) * dBsqr
    deltaC = Math.sqrt(Rcomp + Gcomp + Bcomp)
    return deltaC / 3
}


function createRandomRect(blankCanvasCTX, red, green, blue, opacity){ 
    //funzione che ritorna la rotazione, posizione e dimensioni di un rettangolo
    blankCanvasCTX.restore()
    blankCanvasCTX.clearRect(0,0,width, height)
    blankCanvasCTX.save()
    const colorString = 'rgba(#RED, #GREEN, #BLUE, #OPACITY)'
    blankCanvasCTX.fillStyle = colorString
    .replace('#RED', red)
    .replace('#GREEN',  green)
    .replace('#BLUE',  blue)
    .replace('#OPACITY', 1)
    const maxRectSize = width < height ? width / 1.2 : height /1.2  //la grandezza massima del rettangolo è la metà del lato più piccolo di canvas
    const randomX = Math.random() * width
    const randomY = Math.random() * height
    const rectWidth = Math.random() * maxRectSize
    const rectHeight = Math.random() * maxRectSize
    const randomAngle = Math.random() * 90
    const rad = randomAngle * Math.PI / 180
    blankCanvasCTX.translate(randomX, randomY)
    blankCanvasCTX.rotate(rad)
    blankCanvasCTX.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
    return [randomX, randomY, rectWidth, rectHeight, rad]
}

function findOuterRectFromRandomRect([x,y,rectWidth,rectHeight,rotationRad]){ //posizione x y centrale del rettangolo;
    const newWidth = (rectWidth* Math.cos(rotationRad)) + (rectHeight * Math.sin(rotationRad))  //Dimensioni del rettangolo che contengono il rettangolo precedente ruotato
    const newHeight = (rectWidth* Math.sin(rotationRad)) + (rectHeight * Math.cos(rotationRad))
    const topLeftX = Math.max(x - newWidth / 2, 0)
    const topLeftY = Math.max(y - newHeight / 2, 0)
    const botRightX = Math.min(x + newWidth / 2, width)
    const botRightY = Math.min(y + newHeight / 2, height)
    const adjustedNewWidth = botRightX - topLeftX
    const adjustedNewHeight = botRightY - topLeftY
    return [Math.floor(topLeftX), Math.floor(topLeftY), Math.floor(adjustedNewWidth), Math.floor(adjustedNewHeight)]
}

function makeBase() {
    base_image = new Image();
    base_image.src = './monalisa.png';
    base_image.onload = function () {
        targetCTX.drawImage(base_image, 0, 0);
        colorTargetInfo = getRBGAvgAndStdDev(targetCanvas)
        const targetCTXData =  targetCTX.getImageData(0,0,width,height)               
        outputCTX.drawImage(base_image,0,0)
       setTimeout(() => everythingElse(targetCTXData ),10) 
    }
}

function everythingElse(targetCTXData){
    
    for(let i = 0; i < 10; i++){
        const randomRectInfo = createRandomRect(inputCTX, 123, 123, 299, 0.5)
        const outerRect = findOuterRectFromRandomRect(randomRectInfo) // [0] topLeftX [1] topLeftY [2] rectWidth [3] rectHeight
        //dato che il dato del rettangolo esiste su inputCTX anche se non l'ho disegnato,
        //posso andare a recuperarmelo dopo
        const inputCTXData = inputCTX.getImageData(outerRect[0],outerRect[1],outerRect[2],outerRect[3])
        const outputCTXData = outputCTX.getImageData(outerRect[0],outerRect[1],outerRect[2],outerRect[3])
        let pixelChecked = 0
        let totalRedInput = 0
        let totalGreenInput = 0
        let totalBlueInput = 0
        let totalRedTarget = 0
        let totalGreenTarget = 0
        let totalBlueTarget = 0
        let totalRedOutput = 0
        let totalGreenOutput = 0
        let totalBlueOutput = 0
        pixelChecked = 0

        let inputTargetDifferenceTot = 0
        let outputTargetDifferenceTot = 0
        for (let y = 0; y < outerRect[3]; y++) {
            for (let x = 0; x < outerRect[2]; x++) {

                const pos = (y * outerRect[2] + x) * 4
                if (inputCTXData.data[pos + 3] === 0) continue
                pixelChecked++
                const startingPointForTarget =( width * outerRect[1] + outerRect [0] + width * y + x ) * 4

                totalRedInput += inputCTXData.data[pos]
                totalGreenInput += inputCTXData.data[pos + 1]
                totalBlueInput += inputCTXData.data[pos + 2]

                totalRedOutput += outputCTXData.data[pos]
                totalGreenOutput += outputCTXData.data[pos + 1]
                totalBlueOutput += outputCTXData.data[pos + 2]

                totalRedTarget += targetCTXData.data[startingPointForTarget]
                totalGreenTarget += targetCTXData.data[startingPointForTarget+1]
                totalBlueTarget += targetCTXData.data[startingPointForTarget + 2]
            }
        }
        const c1 = [totalRedTarget / pixelChecked,totalGreenTarget / pixelChecked,totalBlueTarget / pixelChecked]
        const c2 = [totalRedInput / pixelChecked,totalGreenInput / pixelChecked,totalBlueInput / pixelChecked]
        const c3 = [totalRedOutput / pixelChecked, totalGreenOutput / pixelChecked, totalBlueOutput / pixelChecked]
        inputTargetDifferenceTot = calculateDifference(c2,c1)
        outputTargetDifferenceTot = calculateDifference(c3,c1)
        console.log(inputTargetDifferenceTot,outputTargetDifferenceTot);
        console.log('difference',outputTargetDifferenceTot - inputTargetDifferenceTot);
        const differenceOfAllPixels = inputTargetDifferenceTot*pixelChecked
        console.log('allPixels:',differenceOfAllPixels);
    } 
}
// makeBase()