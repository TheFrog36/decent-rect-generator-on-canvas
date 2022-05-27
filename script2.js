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
    .replace('#OPACITY', opacity)
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
    return [topLeftX, topLeftY, adjustedNewWidth, adjustedNewHeight]
}

function makeBase() {
    base_image = new Image();
    base_image.src = './monalisa.png';
    base_image.onload = function () {
        targetCTX.drawImage(base_image, 0, 0);
        colorTargetInfo = getRBGAvgAndStdDev(targetCanvas)
        const targetImageData = targetCTX.getImageData(0, 0, width, height)
        for(let i = 0; i < 5; i++){
            const randomRectInfo = createRandomRect(inputCTX, 100, 100, 100, 0.5)
            const outerRect = findOuterRectFromRandomRect(randomRectInfo)
            //dato che il dato del rettangolo esiste su inputCTX anche se non l'ho disegnato,
            //posso andare a recuperarmelo dopo
            const randomRectData = inputCTX.getImageData(outerRect[0],outerRect[1],outerRect[2],outerRect[3])
        }    
        

    }
}

makeBase()