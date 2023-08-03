window.addEventListener("childScriptReady", function (event) {
    var player2 = event.detail.myVariable;
});

a = document.getElementById("box-0");
b = document.getElementById("box-1");
c = document.getElementById("box-2");
d = document.getElementById("box-3");
e = document.getElementById("box-4");
f = document.getElementById("box-5");
g = document.getElementById("box-6");
h = document.getElementById("box-7");
i = document.getElementById("box-8");

box = [a, b, c, d, e, f, g, h, i];
p1Win = false;
p2Win = false;
cliked = false;
toss = 'X';

for (let x = 0; x < box.length; x++) {
    box[x].addEventListener('click', function () {
        clik(x);
    });
}

function clik(x) {
    if (p1Win == false && p2Win == false && cliked == false) {
        if (box[x].innerText == "") {
            box[x].innerText = toss;
            cliked = true;
            winCheck();
            const message = x;
            socket.emit('send_message', { senderID: senderName, recipientID: player2, content1: message, content2: toss });
        }
    }
}

// Receive messages from the server
socket.on('new_message', (data) => {
    const { senderID, content1, content2 } = data;
    if (box[content1].innerText == "") {
        box[content1].innerText = content2;
        cliked = false;
        winCheck();
    }
    if (content2 == 'X') {
        toss = 'O'
    } else {
        toss = 'X'
    }
});

function checkWin(x, y, z) {
    if (box[x].innerText == "X" && box[y].innerText == "X" && box[z].innerText == "X") {
        //checks left to right diag line for player
        pWin = true;
        if (toss == 'X') {
            document.getElementById("container").innerHTML = `<div class="result"><h2>You WIN</h2>
                        <button id="retry" onclick="resetValues()">Try Again?</button>
                        <button id="goBack" onclick="cancel()">Go Back</button></div>`
        } else {
            document.getElementById("container").innerHTML = `<div class="result"><h2>You Lose</h2>
                        <button id="retry" onclick="resetValues()">Try Again?</button>
                        <button id="goBack" onclick="cancel()">Go Back</button></div></div>`
        }


    } else if (box[x].innerText == "O" && box[y].innerText == "O" && box[z].innerText == "O") {
        //checks left to right diag line for bot
        bWin = true;
        if (toss == 'O') {
            document.getElementById("container").innerHTML = `<div class="result"><h2>You WIN</h2>
                        <button id="retry" onclick="resetValues()">Try Again?</button>
                        <button id="goBack" onclick="cancel()">Go Back</button></div>`
        } else {
            document.getElementById("container").innerHTML = `<div class="result"><h2>You Lose</h2>
                        <button id="retry" onclick="resetValues()">Try Again?</button>
                        <button id="goBack" onclick="cancel()">Go Back</button></div></div>`
        }
    }
}

function winCheck() {
    if (
        box[0].innerText != "" &&
        box[1].innerText != "" &&
        box[2].innerText != "" &&
        box[3].innerText != "" &&
        box[4].innerText != "" &&
        box[5].innerText != "" &&
        box[6].innerText != "" &&
        box[7].innerText != "" &&
        box[8].innerText != ""
    ) {
        pWin = true;
        bWin = true;
        document.getElementById("container").innerHTML = `<div class="result">
        <button id="retry" onclick="resetValues()">Try Again?</button>
        <button id="goBack" onclick="cancel()">Go Back</button></div></div>`
    } else {
        checkWin(0, 4, 8);
        checkWin(1, 4, 7);
        checkWin(0, 1, 2);
        checkWin(2, 4, 6);
        checkWin(2, 5, 8);
        checkWin(3, 4, 5);
        checkWin(0, 3, 6);
        checkWin(6, 7, 8);
    }
}