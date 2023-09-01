spacecraft = document.querySelector('.spacecraft');
spacecraftX = 700;
spacecraftY = 400;
rotation = 0;
asteroids = [];

function updateSpacecraftPosition() {
    spacecraft.style.left = spacecraftX + 'px';
    spacecraft.style.top = spacecraftY + 'px';
    spacecraft.style.transform = `rotate(${rotation}deg)`;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'a' && spacecraftX > 0) {
        spacecraftX -= 10;
        rotation = -90;
    } else if (event.key === 'd' && spacecraftX < window.innerWidth - 50) {
        spacecraftX += 10;
        rotation = 90;
    } else if (event.key === 'w' && spacecraftY > 0) {
        spacecraftY -= 10;
        rotation = 0;
    } else if (event.key === 's' && spacecraftY < window.innerHeight - 50) {
        spacecraftY += 10;
        rotation = 180;
    }
    updateSpacecraftPosition();
});

updateSpacecraftPosition();
scores = 0;
function createAsteroid() {
    const asteroid = document.createElement('div');

    asteroid.className = 'asteroid';

    const asteroidImage = document.createElement('img');
    asteroidImage.src = '../assets/asteroid1.png';
    asteroidImage.alt = 'Asteroid Image';

    asteroid.appendChild(asteroidImage);
    document.body.appendChild(asteroid);

    const randomX = Math.random() * window.innerWidth;
    const randomY = Math.random() * window.innerHeight;
    asteroid.style.left = randomX + 'px';
    asteroid.style.top = randomY + 'px';
    const speed = Math.random() * 4 + 2;
    const angle = Math.random() * 360;
    const radians = angle * (Math.PI / 180);
    const xVelocity = Math.cos(radians) * speed;
    const yVelocity = Math.sin(radians) * speed;

    function updateAsteroidPosition() {
        const currentX = parseFloat(asteroid.style.left);
        const currentY = parseFloat(asteroid.style.top);

        asteroid.style.left = (currentX + xVelocity) + 'px';
        asteroid.style.top = (currentY + yVelocity) + 'px';

        function isColliding(element1, element2) {
            const rect1 = element1.getBoundingClientRect();
            const rect2 = element2.getBoundingClientRect();
            const isColliding = (
                rect1.left < rect2.right &&
                rect1.right > rect2.left &&
                rect1.top < rect2.bottom &&
                rect1.bottom > rect2.top
            );
            return isColliding;
        }

        function checkCollisions() {
            for (let i = 0; i < asteroids.length; i++) {
                if (isColliding(spacecraft, asteroids[i])) {
                    endGame();
                    return;
                }
            }
        }
        checkCollisions();
        function endGame() {
            const gameContainer = document.getElementById("game-container");
            gameContainer.innerHTML = `<div class="score-board"><h1>Game Over</h1><h1>${scores}</h1><button onclick="start()">Restart</button><button onclick="back()">Exit</button></div>`;
            console.log(scores)
        }
    }

    const asteroidInterval = setInterval(updateAsteroidPosition, 50);

    setTimeout(() => {
        clearInterval(asteroidInterval);
        asteroid.remove();
    }, 10000);
    asteroids.push(asteroid);
}

setInterval(createAsteroid, 2000);

function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();

    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}

bullets = [];
function createBullet() {
    const bullet = document.createElement('div');
    bullet.className = 'bullet';
    document.body.appendChild(bullet);

    const spacecraftRect = spacecraft.getBoundingClientRect();
    const spacecraftWidth = spacecraftRect.width;
    const spacecraftHeight = spacecraftRect.height;
    const bulletX = spacecraftX + spacecraftWidth / 2;
    const bulletY = spacecraftY + spacecraftHeight / 2;
    bullet.style.left = bulletX + 'px';
    bullet.style.top = bulletY + 'px';
    const directionInRadians = (rotation - 90) * (Math.PI / 180);
    const bulletSpeed = 5;
    const xVelocity = Math.cos(directionInRadians) * bulletSpeed;
    const yVelocity = Math.sin(directionInRadians) * bulletSpeed;
    const bulletData = {
        element: bullet,
        x: bulletX,
        y: bulletY,
        xVelocity: xVelocity,
        yVelocity: yVelocity
    };
    bullets.push(bulletData);

    const bulletInterval = setInterval(() => {
        bulletData.x += bulletData.xVelocity;
        bulletData.y += bulletData.yVelocity;

        bulletData.element.style.left = bulletData.x + 'px';
        bulletData.element.style.top = bulletData.y + 'px';

        for (let i = 0; i < asteroids.length; i++) {
            if (isColliding(bulletData.element, asteroids[i])) {
                asteroids[i].remove();
                bulletData.element.remove();
                bullets.splice(bullets.indexOf(bulletData), 1);
                i--;
                scores += 10;
            }
        }
        if (
            bulletData.x < 0 ||
            bulletData.x > window.innerWidth ||
            bulletData.y < 0 ||
            bulletData.y > window.innerHeight
        ) {
            clearInterval(bulletInterval);
            bulletData.element.remove();
            bullets.splice(bullets.indexOf(bulletData), 1);
        }
    }, 20);
}

document.addEventListener('keydown', (event) => {
    if (event.key === ' ' || event.key === 'Spacebar') {
        createBullet();
    }
});