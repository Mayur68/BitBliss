a = document.getElementById("box-0");
b = document.getElementById("box-1");
c = document.getElementById("box-2");
d = document.getElementById("box-3");
e = document.getElementById("box-4");
f = document.getElementById("box-5");
g = document.getElementById("box-6");
h = document.getElementById("box-7");
i = document.getElementById("box-8");

let box = [a, b, c, d, e, f, g, h, i];
p1Win = false;
p2Win = false;
cliked = false;
toss = 'X';
attempt = 0;
scoreP1 = 0;
scoreP2 = 0;
let players;

// Attach event listeners to buttons here
for (let x = 0; x < box.length; x++) {
    box[x].addEventListener('click', function () {
        clik(x);
    });
}

function clik(x) {
    if (p1Win == false && p2Win == false && cliked == false) {
        console.log("inside clik()");
        if (box[x].innerText == "") {
            box[x].innerText = toss;
            cliked = true;
            winCheck();
            const message = x;
            console.log("p2:v"+player2)
            socket.emit('send_message', { senderID: senderName, recipientID: player2, content1: message, content2: toss });
        }
    }
}

// Receive messages from the server
socket.on('new_message', (data) => {
    const { senderID, content1, content2 } = data;
    console.log(`New message from ${senderID}: ${content1} :${content2}`);
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
        console.log("You WIN");
        pWin = true;
        result.innerText = "X Wins";
        // score_1.innerText = ++scoreP1;
        attempt++;
        attempts.innerText = attempt;

    } else if (box[x].innerText == "O" && box[y].innerText == "O" && box[z].innerText == "O") {
        //checks left to right diag line for bot
        bWin = true;
        result.innerText = "O Wins";
        attempt++;
        attempts.innerText = attempt;
    }
}

function winCheck() {
    checkWin(0, 4, 8);
    checkWin(1, 4, 7);
    checkWin(0, 1, 2);
    checkWin(2, 4, 6);
    checkWin(2, 5, 8);
    checkWin(3, 4, 5);
    checkWin(0, 3, 6);
    checkWin(6, 7, 8);
}