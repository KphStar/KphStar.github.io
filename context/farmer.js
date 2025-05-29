const canvas = document.getElementById('farmerCanvas');
const ctx = canvas.getContext('2d');

const totalFrames = 4;
const frameImages = [];
let imagesLoaded = 0;

for (let i = 1; i <= totalFrames; i++) {
  const img = new Image();
  img.src = `./Assets/images/farmer${i}.png`;
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalFrames) {
      resizeCanvas(); // ensure canvas fits before animation starts
      requestAnimationFrame(animate);
    }
  };
  frameImages.push(img);
}

const displayWidth = 64;
const displayHeight = 64;
let x = -displayWidth;
let speed = 2;
let currentFrame = 0;
let state = 'entering';
let pauseCounter = 0;

let lastFrameChangeTime = 0;
const frameDuration = 400; // ms per frame

function animate(timestamp) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Change frame every 400ms
  if (!lastFrameChangeTime) lastFrameChangeTime = timestamp;
  const elapsed = timestamp - lastFrameChangeTime;
  if (elapsed >= frameDuration) {
    currentFrame = (currentFrame + 1) % totalFrames;
    lastFrameChangeTime = timestamp;
  }

  const y = canvas.height - displayHeight;
  ctx.drawImage(frameImages[currentFrame], x, y, displayWidth, displayHeight);

  // Handle movement logic
  if (state === 'entering') {
    x += speed;
    if (x >= canvas.width / 2 - displayWidth / 2) {
      state = 'pause';
    }
  } else if (state === 'pause') {
    pauseCounter++;
    if (pauseCounter > 60) {
      state = 'exiting';
    }
  } else if (state === 'exiting') {
    x += speed;
    if (x > canvas.width) {
      x = -displayWidth;
      state = 'entering';
      pauseCounter = 0;
    }
  }

  requestAnimationFrame(animate);
}

// Make canvas responsive
function resizeCanvas() {
  canvas.width = canvas.clientWidth;
  canvas.height = canvas.clientHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();
