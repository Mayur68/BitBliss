let a = document.getElementById("box1-0");
let b = document.getElementById("box1-1");
let c = document.getElementById("box1-2");
let d = document.getElementById("box1-3");
let e = document.getElementById("box1-4");
let f = document.getElementById("box1-5");
let g = document.getElementById("box1-6");
let h = document.getElementById("box1-7");
let i = document.getElementById("box1-8");

// Check if any element is null before proceeding
if (a && b && c && d && e && f && g && h && i) {
    let box1 = [a, b, c, d, e, f, g, h, i];

    tr = document.querySelector("#retry");
    let req = true;
    pstat = document.getElementById("pstat");
    bstat = document.getElementById("bstat");
    pWin = false;
    bWin = false;
    pStat = 0;
    bStat = 0;
    let msg = document.querySelector("#displayMessage");

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
            console.log("inside if");
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
        console.log("You WIN");
        pWin = true;
        msg.textContent = "You Win ";
        msg.style.color = "blue";
        pStat++;
        pstat.textContent = pStat;
        retry();
    } else if (
        box1[x].innerText == "O" &&
        box1[y].innerText == "O" &&
        box1[z].innerText == "O"
    ) {
        //checks left to right diag line for bot
        bWin = true;
        bStat++;
        bstat.textContent = bStat;
        msg.textContent = "You lose";
        msg.style.color = "Red";

        retry();
    }
}

function checkWin() {
    mcheckWin(0, 4, 8);
    mcheckWin(1, 4, 7);
    mcheckWin(0, 1, 2);
    mcheckWin(2, 4, 6);
    mcheckWin(2, 5, 8);
    mcheckWin(3, 4, 5);
    mcheckWin(0, 3, 6);
    mcheckWin(6, 7, 8);
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
        retry();
    }
}

function retry() {
    tr.style.color = "black";
    tr.style.backgroundColor = "white"; //for background-color write in camel case without'-'
    tr.style.border = "black 3px solid";
}

function resetValues() {
    bWin = false;
    pWin = false;
    msg.textContent = "";

    for (i = 0; i < box1.length; i++) {
        box1[i].innerText = "";
    }
    tr.style.color = "transparent";
    tr.style.backgroundColor = "transparent";
    tr.style.border = "transparent";
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
            if (box[a].innerText == "") {
                console.log(
                    "inside bot value if condition for random" +
                    "valueof box[" +
                    a +
                    "] is O"
                );
                box[a].innerText = "O";
                checkWin();
            } else botValue();
        }
    }
}

function xValue(i, j, k) {
    if (req == true) {
        if (box[i].innerText == "X" && box[j].innerText == "X") {
            if (box[k].innerText == "") {
                box[k].innerText = "O";
                req = false;
            }
        }
    }
    if (req == true) {
        if (box[j].innerText == "X" && box[k].innerText == "X") {
            if (box[i].innerText == "") {
                box[i].innerText = "O";
                req = false;
            }
        }
    }
    if (req == true) {
        if (box[i].innerText == "X" && box[k].innerText == "X") {
            if (box[j].innerText == "") {
                box[j].innerText = "O";
                req = false;
            }
        }
    }
}
