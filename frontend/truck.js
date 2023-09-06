
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

    function checkCollisions() {
        trucks.forEach((truck) => {
            if (isColliding(truck, object1) || isColliding(truck, object2)) {
                endGame();
                return;
            }
        });
    }

    checkCollisions();
    function endGame() {
        console.log("game over")
    }