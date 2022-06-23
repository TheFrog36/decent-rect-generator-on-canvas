const imgUrl = './images/cat.png'
let width 
let height 
const canvasInput = document.getElementById('canvas-input')
const canvasOutput = document.getElementById('canvas-output')
const targetCanvas = document.getElementById('target-img')
const differenceCanvas = document.getElementById('difference-canvas')

const inputCTX = canvasInput.getContext('2d')
const outputCTX = canvasOutput.getContext('2d')
const targetCTX = targetCanvas.getContext('2d')
const differenceCTX = differenceCanvas.getContext('2d')

let targetAllColorsInfo
let bestDifferencecSoFar = 0
let bestRectSoFar
//#TEST
let outerRect
let randomRectInfo
let contatore = 0
let emprovement = 0
let differenceOfAllPixels = 0
let inputAlpha

let totCounter = 0

function setCanvasSizes(){
    canvasInput.width = width
    canvasInput.height = height
    canvasOutput.width = width
    canvasOutput.height = height
    targetCanvas.height = height
    targetCanvas.width = width
    differenceCanvas.height = height
    differenceCanvas.width = width
    outputCTX.fillStyle = 'rgba(255, 255, 255, 1)'
    outputCTX.fillRect(0, 0, width, height)
}
//#Fine

function calculateDifference(color1, color2) {
    dRsqr = ((color1[0] - color2[0]) / 255) ** 2
    dGsqr = ((color1[1] - color2[1]) / 255) ** 2
    dBsqr = ((color1[2] - color2[2]) / 255) ** 2
    Rmod = (color1[0] + color2[0]) / (2 * 255)
    Rcomp = (2 + Rmod) * dRsqr
    Gcomp = 4 * dGsqr
    Bcomp = (3 - Rmod) * dBsqr
    deltaC = Math.sqrt(Rcomp + Gcomp + Bcomp)
    return deltaC / 3
}


function createRandomRect(blankCanvasCTX, red, green, blue, opacity) {
    //funzione che ritorna la rotazione, posizione e dimensioni di un rettangolo
    blankCanvasCTX.restore()
    blankCanvasCTX.clearRect(0, 0, width, height)
    blankCanvasCTX.save()
    const colorString = 'rgba(#RED, #GREEN, #BLUE, #OPACITY)'
    blankCanvasCTX.fillStyle = colorString
        .replace('#RED', red)
        .replace('#GREEN', green)
        .replace('#BLUE', blue)
        .replace('#OPACITY', opacity)
    const maxRectSize = width < height ? width / 1.2 : height / 1.2  //la grandezza massima del rettangolo è la metà del lato più piccolo di canvas
    const randomX = Math.random() * width
    const randomY = Math.random() * height
    // const rectWidth = Math.random() * (maxRectSize - 2) + 2
    // const rectHeight = Math.random() * (maxRectSize - 2) + 2
    const rectHeight = Math.random() * 100 + 2
    const rectWidth = Math.random() * 100 + 2
    const randomAngle = Math.random() * 90
    const rad = randomAngle * Math.PI / 180
    blankCanvasCTX.translate(randomX, randomY)
    blankCanvasCTX.rotate(rad)
    blankCanvasCTX.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
    return [Math.round(randomX), Math.round(randomY), Math.round(rectWidth), Math.round(rectHeight), rad]
}

function findOuterRectFromRandomRect([x, y, rectWidth, rectHeight, rotationRad]) { //posizione x y centrale del rettangolo;
    const newWidth = (rectWidth * Math.cos(rotationRad)) + (rectHeight * Math.sin(rotationRad))  //Dimensioni del rettangolo che contengono il rettangolo precedente ruotato
    const newHeight = (rectWidth * Math.sin(rotationRad)) + (rectHeight * Math.cos(rotationRad))
    const topLeftX = Math.max(x - newWidth / 2, 0)
    const topLeftY = Math.max(y - newHeight / 2, 0)
    const botRightX = Math.min(x + newWidth / 2, width)
    const botRightY = Math.min(y + newHeight / 2, height)
    const adjustedNewWidth = botRightX - topLeftX
    const adjustedNewHeight = botRightY - topLeftY
    return [Math.floor(topLeftX), Math.floor(topLeftY),Math.floor(adjustedNewWidth),Math.floor(adjustedNewHeight)]
}

function drawRect([red, green, blue, opacity, randomX, randomY, rectWidth, rectHeight, rad]) {
    const colorString = 'rgba(#RED, #GREEN, #BLUE, #OPACITY)'
    outputCTX.save()
    outputCTX.fillStyle = colorString
        .replace('#RED', red)
        .replace('#GREEN', green)
        .replace('#BLUE', blue)
        .replace('#OPACITY', opacity)
    outputCTX.translate(randomX, randomY)
    outputCTX.rotate(rad)
    outputCTX.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
    outputCTX.restore()
}

function makeBase() {
    document.getElementById('start-button').style.display = 'none'
    base_image = new Image();
    base_image.src = imgUrl;
    base_image.onload = function () {
        height = base_image.height
        width = base_image.width
        setCanvasSizes()
        targetCTX.drawImage(base_image, 0, 0);
        colorTargetInfo = getRGBAvgAndStdDev(targetCanvas)
        const targetCTXData = targetCTX.getImageData(0, 0, width, height)
        // outputCTX.drawImage(base_image,0,0)
        targetAllColorsInfo = getRGBAvgAndStdDev(targetCanvas)
        for(let i = 0; i < 10000; i++) setTimeout(() => everythingElse(targetCTXData), 1)
        console.log('done');
    }
}

function updateInfoDiv(){
    const template = `
        Cycle: #CYCLE
        Added: #ADDED
        Failed: #FAILED`
    const infoDiv = document.getElementById('info')
    infoDiv.innerHTML = template.replace('#CYCLE', totCounter)
        .replace('#ADDED', contatore)
        .replace('#FAILED', totCounter - contatore)
}

function everythingElse(targetCTXData) {
    try {
        bestDifferencecSoFar = 0
        
        const outputCTXData = outputCTX.getImageData(0, 0, width, height)
        for (let i = 0; i < 100; i++) {
            const inputRed = Math.max(generateGaussian(targetAllColorsInfo[0][0], targetAllColorsInfo[0][1]), 0)
            const inputGreen = Math.max(generateGaussian(targetAllColorsInfo[1][0], targetAllColorsInfo[1][1]), 0)
            const inputBlue = Math.max(generateGaussian(targetAllColorsInfo[2][0], targetAllColorsInfo[2][1]), 0)
            // inputAlpha = Math.random() * (1 - 0.1) + 0.1  // #TEST 
            inputAlpha = 0.2
            randomRectInfo = createRandomRect(inputCTX, inputRed, inputGreen, inputBlue, inputAlpha)   //#TEST rimettere const
            outerRect = findOuterRectFromRandomRect(randomRectInfo) // [0] topLeftX [1] topLeftY [2] rectWidth [3] rectHeight // #TEST rimettere const
            //dato che il dato del rettangolo esiste su inputCTX anche se non l'ho disegnato,
            //posso andare a recuperarmelo dopo
            const inputCTXData = inputCTX.getImageData(outerRect[0], outerRect[1], outerRect[2], outerRect[3])
            

            let inputTargetDifferenceTot = 0
            let outputTargetDifferenceTot = 0
            for (let y = 0; y < outerRect[3]; y++) {
                for (let x = 0; x < outerRect[2] ; x++) {

                    const pos = (y * outerRect[2] + x) * 4
                    if (inputCTXData.data[pos + 3] === 0) continue
                    const startingPointForTarget = (width * outerRect[1] + outerRect[0] + width * y + x) * 4
                    const outputPixel = [outputCTXData.data[startingPointForTarget],outputCTXData.data[startingPointForTarget+1],outputCTXData.data[startingPointForTarget+2]]
                    const targetPixel = [targetCTXData.data[startingPointForTarget],targetCTXData.data[startingPointForTarget+1],targetCTXData.data[startingPointForTarget+2]]
                    const outputPixelBetter = [outputCTXData.data[startingPointForTarget],outputCTXData.data[startingPointForTarget+1],outputCTXData.data[startingPointForTarget+2],outputCTXData.data[pos+3]/255]
                    const sumInputOutput = add2colors(outputPixelBetter,[inputRed,inputGreen,inputBlue,inputAlpha])
                    outputTargetDifferenceTot += calculateDifference(targetPixel,outputPixel)
                    inputTargetDifferenceTot += calculateDifference(targetPixel,sumInputOutput)
                }
            }
            emprovement =  outputTargetDifferenceTot - inputTargetDifferenceTot
            if (bestDifferencecSoFar < emprovement) {
                bestDifferencecSoFar = emprovement
                bestRectSoFar = [inputRed, inputGreen, inputBlue, inputAlpha, randomRectInfo[0],
                randomRectInfo[1], randomRectInfo[2], randomRectInfo[3], randomRectInfo[4]]
                
            }
        }
    } catch (error) {
        console.log(error);
        console.log(outerRect);
        console.log(randomRectInfo);
    }
    
    if (bestDifferencecSoFar > 0) {
        console.log('Improvement:',Math.round(bestDifferencecSoFar * 1000) / 1000);
        drawRect(bestRectSoFar)
        contatore++
        console.log('rettangoli aggiunti:', contatore);
    } else {
        console.log('lippa');
    }
    totCounter++
    updateInfoDiv()
    console.log('tot', totCounter)
    console.log('generazioni fallite:', totCounter - contatore)
    //save current highest score differenceOfAllPixels
    //and its sizes
}
// makeBase()

function stopP(){
    window.stop()
}