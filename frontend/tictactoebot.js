a = document.getElementById("box1-0");
b = document.getElementById("box1-1");
c = document.getElementById("box1-2");
d = document.getElementById("box1-3");
e = document.getElementById("box1-4");
f = document.getElementById("box1-5");
g = document.getElementById("box1-6");
h = document.getElementById("box1-7");
i = document.getElementById("box1-8");

// Check if any element is null before proceeding
if (a && b && c && d && e && f && g && h && i) {
    box1 = [a, b, c, d, e, f, g, h, i];
    let req = false;
    pWin = false;
    bWin = false;

    // Attach event listeners to buttons here
    for (let x = 0; x < box1.length; x++) {
        box1[x].addEventListener('click', function () {
            clik1(x);
        });
    }
} else {
    console.error("One or more elements with IDs 'box1-0' to 'box1-8' were not found.");
}

function clik1(x) {
    if (pWin == false && bWin == false) {
        if (box1[x].innerText == "") {
            box1[x].innerText = "X";
            checkWin();
            if (pWin == false && bWin == false) {
                setTimeout(function () {
                    botValue();
                }, 150);
            }
        }
    }
}

function botValue() {
    console.log("inside botValue()");
    req = true;
    mainValue();
    checkWin();
}

function mcheckWin(x, y, z) {
    if (box1[x].innerText == "X" && box1[y].innerText == "X" && box1[z].innerText == "X") {
        //checks left to right diag line for player
        pWin = true;
        document.getElementById("container").innerHTML = `<div class="result"><h2>You WIN</h2>
        <button id="retry" onclick="resetValues()">Try Again?</button>
        <button id="goBack" onclick="cancel()">Go Back</button></div>`
    } else if (
        box1[x].innerText == "O" &&
        box1[y].innerText == "O" &&
        box1[z].innerText == "O"
    ) {
        //checks left to right diag line for bot
        bWin = true;
        document.getElementById("container").innerHTML = `<div class="result"><h2>You Lose</h2>
        <button id="retry" onclick="resetValues()">Try Again?</button>
        <button id="goBack" onclick="cancel()">Go Back</button></div></div>`
    }
}

function checkWin() {
    if (
        box1[0].innerText != "" &&
        box1[1].innerText != "" &&
        box1[2].innerText != "" &&
        box1[3].innerText != "" &&
        box1[4].innerText != "" &&
        box1[5].innerText != "" &&
        box1[6].innerText != "" &&
        box1[7].innerText != "" &&
        box1[8].innerText != ""
    ) {
        pWin = true;
        bWin = true;
        document.getElementById("container").innerHTML = `<div class="result">
        <button id="retry" onclick="resetValues()">Try Again?</button>
        <button id="goBack" onclick="cancel()">Go Back</button></div></div>`
    } else {
        mcheckWin(0, 4, 8);
        mcheckWin(1, 4, 7);
        mcheckWin(0, 1, 2);
        mcheckWin(2, 4, 6);
        mcheckWin(2, 5, 8);
        mcheckWin(3, 4, 5);
        mcheckWin(0, 3, 6);
        mcheckWin(6, 7, 8);
    }

}

function resetValues() {
    bWin = false;
    pWin = false;
    playWithBot()
}

function subValue(i, j, k) {
    if (req == true) {
        if (box1[4].innerText == "") {
            box1[4].innerText = "O";
            req = false;
        }
    }

    if (req == true) {
        if (box1[i].innerText == "O" && box1[j].innerText == "O") {
            if (box1[k].innerText == "") {
                box1[k].innerText = "O";
                req = false;
            }
        }
    }

    if (req == true) {
        if (box1[j].innerText == "O" && box1[k].innerText == "O") {
            if (box1[i].innerText == "") {
                box1[i].innerText = "O";
                req = false;
            }
        }
    }

    if (req == true) {
        if (box1[i].innerText == "O" && box1[k].innerText == "O") {
            if (box1[j].innerText == "") {
                box1[j].innerText = "O";
                req = false;
            }
        }
    }
}

function mainValue() {
    subValue(0, 4, 8);
    subValue(1, 4, 7);
    subValue(0, 1, 2);
    subValue(2, 4, 6);
    subValue(3, 4, 5);
    subValue(0, 3, 6);
    subValue(6, 7, 8);
    subValue(2, 5, 8);
    xValue(0, 4, 8);
    xValue(1, 4, 7);
    xValue(0, 1, 2);
    xValue(2, 4, 6);
    xValue(3, 4, 5);
    xValue(0, 3, 6);
    xValue(6, 7, 8);
    xValue(2, 5, 8);

    subValue(2, 5, 8);
    if (req === true) {
        a = Math.floor(Math.random() * 9);
        {
            if (box1[a].innerText == "") {
                box1[a].innerText = "O";
                checkWin();
            } else botValue();
        }
    }
}

function xValue(i, j, k) {
    if (req == true) {
        if (box1[i].innerText == "X" && box1[j].innerText == "X") {
            if (box1[k].innerText == "") {
                box1[k].innerText = "O";
                req = false;
            }
        }
    }
    if (req == true) {
        if (box1[j].innerText == "X" && box1[k].innerText == "X") {
            if (box1[i].innerText == "") {
                box1[i].innerText = "O";
                req = false;
            }
        }
    }
    if (req == true) {
        if (box1[i].innerText == "X" && box1[k].innerText == "X") {
            if (box1[j].innerText == "") {
                box1[j].innerText = "O";
                req = false;
            }
        }
    }
}
