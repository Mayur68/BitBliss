socket.on('challengereturn', () => {
    player2 = recipientID;
    console.log("adgfags")
    loadBoard();
})
function loadBoard() {
    let senderName;
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = "message notself";
    messageElement.innerHTML = `
            <div class="gameBoard">
                <h1>Tic Tac Toe</h1>
                <div class="row">
                    <button id="box-0" class="boardBox"></button>
                    <button id="box-1" class="boardBox"></button>
                    <button id="box-2" class="boardBox"></button>
                </div>
                <div class="row">
                    <button id="box-3" class="boardBox"></button>
                    <button id="box-4" class="boardBox"></button>
                    <button id="box-5" class="boardBox"></button>
                </div>
                <div class="row">
                    <button id="box-6" class="boardBox"></button>
                    <button id="box-7" class="boardBox"></button>
                    <button id="box-8" class="boardBox"></button>
                </div>
            </div>
            <div id="container"></div>
            <button id="goBack" onclick="goBack()">Surrender?</button>
        `;
    messagesDiv.appendChild(messageElement);

    scrollToBottom();
    const script = document.createElement("script");
    script.src = "../games/scripts/tictactoeonline.js";
    script.id = "tictactoebot-script";
    document.body.appendChild(script);
}
function tictactoe() {
    socket.emit('gameChallenge', userId, recipientID);
}
function goBack() {

}