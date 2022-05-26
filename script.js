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
let contatore = 0
let bestDifferenceSoFar = 100
let rectArray = []
let bestRectSoFar = [0,0,0,0,0,0,0,0,100]
let colorTargetInfo  = []
const inputCTX = canvasInput.getContext('2d')
const outputCTX = canvasOutput.getContext('2d')
const targetCTX = targetCanvas.getContext('2d')
const differenceCTX = differenceCanvas.getContext('2d')
outputCTX.fillStyle = 'rgba(0, 0, 0, 1)'
outputCTX.fillRect(0,0,width,height)


function makeBase() {
    base_image = new Image();
    base_image.src = './monalisa.png';
    base_image.onload = function () {
        targetCTX.drawImage(base_image, 0, 0);
        colorTargetInfo = getRBGAvgAndStdDev(targetCanvas)
    
        // setInterval(everythingElse,50)
        for(let i = 0; i < 1; i++) findOuterRect()
       
    }
}

makeBase()

inputCTX.fillStyle = 'rgba(100, 100, 255, 1)'

function createRandomRect2(){
    inputCTX.save()
    differenceCTX.drawImage(canvasOutput,0,0)
    const colorString = 'rgba(#RED, #GREEN, #BLUE, #OPACITY)'
    const red = generateGaussian(colorTargetInfo[0][0],colorTargetInfo[0][1])
    const green = generateGaussian(colorTargetInfo[1][0],colorTargetInfo[1][1])
    const blue = generateGaussian(colorTargetInfo[2][0],colorTargetInfo[2][1])
    const opacity  = Math.random() * (1 - 0.1) + 0.1;
    inputCTX.fillStyle = colorString
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
    inputCTX.translate(randomX, randomY)
    inputCTX.rotate(rad)
    inputCTX.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
    differenceCTX.drawImage(canvasInput,0,0)
    inputCTX.restore()
    const difference = differenceBetween2Images()
    inputCTX.clearRect(0,0,width, height)
    rectArray.push([difference, red, green, blue, opacity, rad, randomX, randomY, rectWidth, rectHeight])
    return [difference, red, green, blue, opacity, rad, randomX, randomY, rectWidth, rectHeight]
}

function everythingElse() {
    rectArray = []
    for (let i = 0; i < 100; i++) {
        createRandomRect2()
        rectArray.sort((e1,e2) => e1[0] - e2[0])
    }
    if(bestDifferenceSoFar > rectArray[0][0]){
        contatore++
        drawRect(rectArray[0])
        bestDifferenceSoFar = rectArray[0][0]
        console.log('difference from target:',bestDifferenceSoFar+'%')
        console.log('added:',contatore);
    } else {
        console.log('lippa');
    }

}

function drawRect([useless,red, green, blue, opacity, rad, randomX, randomY, rectWidth, rectHeight]){
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


function differenceBetween2Images() {
    let targetImageData = targetCTX.getImageData(0, 0, width, height)
    let myCanvasData = differenceCTX.getImageData(0, 0, width, height)
    let totalDifference = 0
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const pos = (y * width + x) * 4
            const c1 = [targetImageData.data[pos],targetImageData.data[pos+1],targetImageData.data[pos+2]]
            const c2 = [myCanvasData.data[pos],myCanvasData.data[pos+1],myCanvasData.data[pos+2]]
            const difference = calculateDifference(c1,c2)
            totalDifference+=difference
        }
    }
    totalDifference = totalDifference / (width * height) * 100
    const totalDifferenceRounded = Math.round(totalDifference * 100) / 100
    // console.log('difference = ' + totalDifferenceRounded + '%')  //Stampo la differenza tra target e my
    return totalDifferenceRounded
}

function stop(){
    contatore = 2000
}

function createRandomRect3(){
    inputCTX.save()
    differenceCTX.drawImage(canvasOutput,0,0)
    const colorString = 'rgba(#RED, #GREEN, #BLUE, #OPACITY)'
    const red = generateGaussian(colorTargetInfo[0][0],colorTargetInfo[0][1])
    const green = generateGaussian(colorTargetInfo[1][0],colorTargetInfo[1][1])
    const blue = generateGaussian(colorTargetInfo[2][0],colorTargetInfo[2][1])
    const opacity  = Math.random() * (1 - 0.3) + 0.3;
    inputCTX.fillStyle = colorString
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
    inputCTX.translate(randomX, randomY)
    inputCTX.rotate(rad)
    inputCTX.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
    const tempArray = inputCTX.getImageData(0,0,width,height).data;
    let sum = 0
    for(let i = 0; i < tempArray.length; i++){
        sum += tempArray[i]
    }
    console.log(sum);
    const difference = differenceBetween2Images()
    inputCTX.clearRect(0,0,width, height)
    rectArray.push([difference, red, green, blue, opacity, rad, randomX, randomY, rectWidth, rectHeight])
    return [difference, red, green, blue, opacity, rad, randomX, randomY, rectWidth, rectHeight]
}

function findOuterRect(){
    inputCTX.save()
    differenceCTX.drawImage(canvasOutput,0,0)
    const colorString = 'rgba(#RED, #GREEN, #BLUE, #OPACITY)'
    const red = 255
    const green = 255
    const blue = 255
    const opacity  = 0.5
    inputCTX.fillStyle = colorString
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
    inputCTX.translate(randomX, randomY)
    inputCTX.rotate(rad)
    inputCTX.fillRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
    inputCTX.restore()
    inputCTX.fillStyle = 'rgba(255, 0, 0, 0.5)'
    const newWidth = (rectWidth* Math.cos(rad)) + (rectHeight * Math.sin(rad))  //Dimensioni del rettangolo che contengono il rettangolo precedente ruotato
    const newHeight = (rectWidth* Math.sin(rad)) + (rectHeight * Math.cos(rad))
    const newRectX = randomX - newWidth / 2
    const newRectY = randomY - newHeight / 2
    const correctedWidth = (randomX - (newWidth / 2) - randomX) + 
    inputCTX.fillRect(Math.max(0,newRectX), Math.max(0,newRectY), newWidth / 2 +  , newHeight)  //fix
    // inputCTX.clearRect(0,0,width, height)
}