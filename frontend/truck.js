const truck = document.querySelector('.truck');
const objects = [];
let scores = 0;

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createObjects() {
    const object = document.createElement('div');
    object.className = 'object';
    const objectImage = document.createElement('img');
    objectImage.src = '../assets/car.png';
    objectImage.alt = 'car Image';
    object.appendChild(objectImage);
    document.body.appendChild(object);
    object.style.left = '0px';
    let objectSpeed;
    if (scores < 1000) {
        objectSpeed = getRandomInt(10, 15);
    } else if (scores >= 1000) {
        objectSpeed = getRandomInt(15, 25);
    } else if (scores >= 2000) {
        objectSpeed = getRandomInt(35, 45);
    } else if (scores >= 3000) {
        objectSpeed = getRandomInt(45, 55);
    }


    function updateObjectPosition() {
        scores++;
        const currentPosition = parseInt(object.style.left, 10);
        const newPosition = currentPosition + objectSpeed;
        if (newPosition >= window.innerWidth - object.clientWidth) {
            clearInterval(objectInterval);
            object.remove();
        } else {
            object.style.left = newPosition + 'px';
        }

        if (isColliding(truck, object)) {
            endGame();
        }

        if (newPosition >= window.innerWidth) {
            clearInterval(objectInterval);
            object.remove();
        }
    }

    const objectInterval = setInterval(updateObjectPosition, 50);
    objects.push(object);
}

function spawnObjectsRandomly() {
    setInterval(() => {
        createObjects();
    }, getRandomInt(3000, 6000));
}

spawnObjectsRandomly();

function isColliding(element1, element2) {
    const rect1 = element1.getBoundingClientRect();
    const rect2 = element2.getBoundingClientRect();
    const isColliding = (
        rect2.left < rect1.right &&
        rect2.right > rect1.left &&
        rect2.top < rect1.bottom &&
        rect2.bottom > rect1.top
    );
    return isColliding;
}



function endGame() {
    const currentDisplay = menu.style.display;
    menu.style.display = currentDisplay === 'none' ? 'block' : 'none';
    trucks.style.display = 'none';
    const gameContainer = document.getElementById("menu");
    gameContainer.innerHTML = `<h1>Game Over</h1><h1>${scores}</h1><button onclick="start()">Restart</button><button onclick="back()">Exit</button>`;
    console.log(`Game Over. Score: ${scores}`);
}
