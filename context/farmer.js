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
          requestAnimationFrame(animate);
        }
      };
      frameImages.push(img);
    }

    const displayWidth = 64;
    const displayHeight = 64;
    const y = canvas.height - displayHeight;
    let x = -displayWidth;
    let speed = 1;
    let currentFrame = 0;
    let frameTimer = 0;
    const frameInterval = 20;
    let state = 'entering';
    let pauseCounter = 0;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      frameTimer++;
      if (frameTimer >= frameInterval) {
        currentFrame = (currentFrame + 1) % totalFrames;
        frameTimer = 0;
      }

      ctx.drawImage(frameImages[currentFrame], x, y, displayWidth, displayHeight);

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