function getRGBAvgAndStdDev(canvasElement) {
    const ctx = canvasElement.getContext('2d')
    var imgData = ctx.getImageData(0, 0, canvasElement.width, canvasElement.height)
    let imgR = 0
    let imgG = 0
    let imgB = 0
    let imgA = 0
    for (let i = 0; i < imgData.data.length; i += 4) {
        imgR += imgData.data[i];
        imgG += imgData.data[i + 1];
        imgB += imgData.data[i + 2];
        imgA += imgData.data[i + 3];
    }
    const pixelN = imgData.height * imgData.width
    avgR = imgR / pixelN
    avgG = imgG / pixelN
    avgB = imgB / pixelN
    let varianceR = 0
    let varianceG = 0
    let varianceB = 0

    for (let i = 0; i < imgData.data.length; i += 4) {
        varianceR += (imgData.data[i] - avgR) ** 2
        varianceG += (imgData.data[i + 1] - avgG) ** 2
        varianceB += (imgData.data[i + 2] - avgB) ** 2
    }

    stdDevR = Math.sqrt(varianceR / pixelN)
    stdDevG = Math.sqrt(varianceG / pixelN)
    stdDevB = Math.sqrt(varianceB / pixelN)

    return  [[avgR, stdDevR], [avgG, stdDevG], [avgB, stdDevB]]
}

function generateGaussian(mean, stdDev) {
    let spare
    let hasSpare = false
    if (hasSpare) {
        hasSpare = false;
        return spare * stdDev + mean;
    } else {
        let u, v, s;
        do {
            u = Math.random() * 2 - 1;
            v = Math.random() * 2 - 1;
            s = u * u + v * v;
        } while (s >= 1 || s == 0);
        s = Math.sqrt(-2.0 * Math.log(s) / s);
        spare = v * s;
        hasSpare = true;
        return mean + stdDev * u * s;
    }
}

function add2colors(color1,color2){    //[R,G,B,A]
    for(let i = 0; i < 3; i++){  // Converto i numeri da 0-255 a 0-1 RGB
        color1[i] = color1[i] / 255
        color2[i] = color2[i] / 255
    }
    result = []
    A = 1 -(1 - color1[3]) * (1 - color2[3]) //Calcolo opacità
    R = color2[0] * color2[3] / A + color1[0] * color1[3] * (1 - color2[3]) / A;  //result RED
    G = color2[1] * color2[3] / A + color1[1] * color1[3] * (1 - color2[3]) / A;  //result GREEN
    B = color2[2] * color2[3] / A + color1[2] * color1[3] * (1 - color2[3]) / A;  //result BLUE
    return [R *  255, G * 255 , B *  255, A]  
}