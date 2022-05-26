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

let rectArray = []

const inputCTX = canvasInput.getContext('2d')
const outputCTX = canvasOutput.getContext('2d')
const targetCTX = targetCanvas.getContext('2d')
const differenceCTX = differenceCanvas.getContext('2d')
outputCTX.fillStyle = 'rgba(0, 0, 0, 1)'
outputCTX.fillRect(0,0,width,height)

function make_base() {
    base_image = new Image();
    base_image.src = './monalisa.png';
    base_image.onload = function () {
        targetCTX.drawImage(base_image, 0, 0);
        everythingElse()
    }
}

make_base()

inputCTX.fillStyle = 'rgba(100, 100, 255, 1)'

function createRandomRect2(){
    inputCTX.save()
    differenceCTX.drawImage(canvasOutput,0,0)
    const colorString = 'rgba(#RED, #GREEN, #BLUE, #OPACITY)'
    const red = Math.random() * 255
    const green = Math.random() * 255
    const blue = Math.random() * 255
    const opacity  = Math.random() * (1 - 0.1) + 0.1;
    inputCTX.fillStyle = colorString
        .replace('#RED', red)
        .replace('#GREEN',  green)
        .replace('#BLUE',  blue)
        .replace('#OPACITY', opacity)
    const maxRectSize = width < height ? width / 2 : height / 2  //la grandezza massima del rettangolo è la metà del lato più piccolo di canvas
    const randomX = Math.random() * width
    const randomY = Math.random() * height
    const rectWidth = Math.random() * maxRectSize
    const rectHeight = Math.random() * maxRectSize
    const rad = Math.random() * Math.PI * 2
    inputCTX.translate(randomX, randomY)
    inputCTX.rotate(rad)
    inputCTX.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
    differenceCTX.drawImage(canvasInput,0,0)
    inputCTX.restore()
    inputCTX.clearRect(0,0,width, height)
    rectArray.push([red, green, blue, opacity, rad, randomX, randomY, rectWidth, rectHeight])
}

function everythingElse() {
    for (let i = 0; i < 100; i++) {
        createRandomRect2()
    }
    console.log(rectArray);
    drawRect(rectArray[12])
}

function drawRect([red, green, blue, opacity, rad, randomX, randomY, rectWidth, rectHeight]){
    const colorString = 'rgba(#RED, #GREEN, #BLUE, #OPACITY)'
    outputCTX.save()
    outputCTX.fillStyle = colorString
        .replace('#RED', red)
        .replace('#GREEN',  green)
        .replace('#BLUE',  blue)
        .replace('#OPACITY', opacity)
    outputCTX.translate(randomX, randomY)
    outputCTX.rotate(rad)
    outputCTX.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
    outputCTX.restore()
}