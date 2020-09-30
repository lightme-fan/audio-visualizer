import { hslToRgb } from "./utils.js";
const WIDTH = 1000;
const HEIGHT = 1000;

const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');
canvas.width = WIDTH;
canvas.height = HEIGHT;

let analyzer;

let bufferLength;

function handleErr(err) {
    console.log('You must givr access to your mic in order to proceed');
}

const getAudio = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const audioCtx = new AudioContext();
    analyzer = audioCtx.createAnalyser();
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyzer);

    // Collection if data we need
    analyzer.fftSize = 2 ** 10;

    // how many pieces of data are there?!?
    bufferLength = analyzer.frequencyBinCount;
    
    // Pull the data off the audio
    const timeData = new Uint8Array(analyzer.frequencyBinCount);

    const frequencyData = new Uint8Array(analyzer.frequencyBinCount);
    drawTimeData(timeData)
	drawFrequency(frequencyData);
    
}

function drawTimeData(timeData) {
    analyzer.getByteTimeDomainData(timeData);
    
	ctx.clearRect(0, 0, WIDTH, HEIGHT);

    ctx.lineWidth = 10;
	ctx.strokeStyle = '#ffc600';
    ctx.beginPath();
    const sliceWidth = WIDTH / bufferLength;
    let x = 0;

    timeData.forEach((data, i) => {
		const v = data / 128;
        const y = (v * HEIGHT) / 2;
        // draw our line
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y)
        }
        x += sliceWidth;
    })

    ctx.stroke();
    requestAnimationFrame(() => drawTimeData(timeData))
}

function drawFrequency(frequencyData) {
	// get the frequency data into our frequencyData array
    analyzer.getByteFrequencyData(frequencyData);
    
	// figure out the bar width
    const barWidth = (WIDTH / bufferLength) * 2.5;
    let x = 0;

    frequencyData.forEach(amount => {
		// 0 to 255
        const percent = amount / 255;        
		const [h, s, l] = [360 / (percent * 360) - 0.5, 0.8, 0.5];
		const barHeight = HEIGHT * percent * 0.5;
		// // TODO: Convert the colour to HSL TODO
		const [r, g, b] = hslToRgb(h, s, l);
		ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
		ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);
		x += barWidth + 3;
	});

    
	requestAnimationFrame(() => drawFrequency(frequencyData));
}

getAudio();

