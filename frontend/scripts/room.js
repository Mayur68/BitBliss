socket.on("UserRooms", (data) => {
    const { userRooms } = data;
    updateRoomsList(userRooms);
});


function loadRooms() {
    const friendsListDiv = document.getElementById("friends-list");
    friendsListDiv.innerHTML = "";
    socket.emit("loadRooms", userId);
    updateRoomsList();
}

function updateRoomsList(rooms) {
    const friendsListDiv = document.getElementById("friends-list");
    friendsListDiv.innerHTML = "";

    const createRoomButton = document.createElement("button");
    createRoomButton.className = "createRoomButton";
    createRoomButton.innerText = "Create New Room";
    createRoomButton.onclick = () => createNewRoom();
    friendsListDiv.appendChild(createRoomButton);

    if (Array.isArray(rooms) && rooms.length > 0) {
        rooms.forEach((room) => {
            const roomElement = document.createElement("div");
            roomElement.className = "friend-item";
            roomElement.innerText = room.name;
            roomElement.onclick = () => roomClickHandler(room);
            friendsListDiv.appendChild(roomElement);
        });
    } else {
        const noRoomsLabel = document.createElement("label");
        noRoomsLabel.style.margin = "auto";
        noRoomsLabel.textContent = "No rooms available. Create room to Discuss";
        friendsListDiv.appendChild(noRoomsLabel);
    }
}


function createNewRoom() {
    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop');
    backdrop.addEventListener('click', function (event) {
        if (event.target === backdrop) {
            backdrop.remove();
            notificationsDiv.remove();
        }
    });

    const notificationsDiv = document.createElement('div');
    notificationsDiv.classList.add('createRoom');

    const mainTitle = document.createElement('h2');
    mainTitle.setAttribute('id', 'mainTitle');
    mainTitle.textContent = `Create ROOM`;
    notificationsDiv.appendChild(mainTitle);

    const roomname = document.createElement('input');
    roomname.setAttribute('id', 'room-input');
    roomname.type = "text";
    roomname.placeholder = "Enter room name..";
    notificationsDiv.appendChild(roomname);

    const roommembers = document.createElement('input');
    roommembers.setAttribute('id', 'members');
    roommembers.type = "text";
    roommembers.placeholder = "Add members (comma-separated)";
    notificationsDiv.appendChild(roommembers);

    const createbutton = document.createElement('button');
    createbutton.setAttribute('id', 'createbutton');
    createbutton.textContent = `Create ROOM`;
    createbutton.addEventListener('click', function (event) {
        if (event.target === createbutton) {
            createRoom();
            backdrop.remove();
            notificationsDiv.remove();
        }
    });
    notificationsDiv.appendChild(createbutton);

    document.body.appendChild(backdrop);
    document.body.appendChild(notificationsDiv);

}

function createRoom() {
    const roomName = document.getElementById("room-input").value;
    const members = document.getElementById("members").value;

    if (roomName.trim() === "") {
        alert("Room name cannot be empty.");
        return;
    }

    const data = {
        owner: userId,
        roomName: roomName,
        members: members.split(",").map(member => member.trim()),
    };

    fetch("/createRoom", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                console.log("Room created");
                loadRooms()
            } else {
                alert("Failed to create room: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error creating room:", error);
            alert("An error occurred while creating the room. Please try again later.");
        });
}

let roomName;

function roomClickHandler(room) {
    roomName = room.name;


    const chatWindow = document.querySelector(".chat-window");

    chatWindow.innerHTML = `<div id="chat-header"></div>
                <div class="messages" id="messages"></div>
                <div id="input">
                    <input type="text" id="message-Room-input" placeholder="Type a message...">
                    <button onclick="sendRoomMessage()" >Send</button>
                    <button onclick="clearRoomChat()">Clear chat</button>
                    <button onclick="tictactoe()">Challenge</button>
                </div>`;


    const dataToSend = {
        roomName: roomName,
        user: userId,
    };

    const messages = document.getElementById("messages");
    messages.innerHTML = "";

    fetch("/loadRoomHistory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dataToSend)
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                const roomHistory = data.result;
                displayChatHistory(roomHistory);
            }
        })
        .catch((error) => {
            console.error("Error loading History:", error);
            alert("An error occurred while loading history. Please try again later.");
        });


    function displayChatHistory(chatHistory) {
        chatHistory.forEach((chat) => {
            if (chat.message && chat.message.trim() !== '') {
                const messageDiv = document.createElement('div');
                if (chat.sender.userID === userId) {
                    messageDiv.className = "message self";
                    messageDiv.textContent = chat.message, chat.timestamp;
                    messages.appendChild(messageDiv);
                } else if (chat.sender.userID === recipientID) {
                    messageDiv.className = "message notself";
                    messageDiv.textContent = chat.message;
                    messages.appendChild(messageDiv);
                }
            }
        });
        scrollToBottom();
    }
}

function sendRoomMessage() {
    const messageInput = document.getElementById("message-Room-input");
    const message = messageInput.value;

    if (message.trim() === "") return;
    if (!roomName) {
        console.log("Select a recipient.");
        return;
    }

    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = "message self";

    const messageText = document.createElement("span");
    messageText.innerText = message;

    const sentTime = document.createElement("span");
    sentTime.className = "message-time";

    const currentTime = new Date();
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedTime = `${hours % 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    sentTime.innerText = " " + formattedTime;

    messageElement.appendChild(messageText);
    messageElement.appendChild(sentTime);
    messagesDiv.appendChild(messageElement);


    const dataToSend = {
        roomName: roomName,
        sender: userId,
        message: message,
        time: formattedTime,
    };

    fetch("/saveRoomHistory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                console.log();
            } else {
                console.log("Failed to save History: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error saving History:", error);
            alert("An error occurred while saving history. Please try again later.");
        });


    socket.emit('send_room_message', {
        sender: userId,
        roomName: roomName,
        message: message,
        time: formattedTime
    });

    messageInput.value = "";
    scrollToBottom();
}

socket.on("receiveRoomMsg", (data) => {
    const { sender, message, time } = data;
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = "message notself";
    const memberElement = document.createElement("div");
    memberElement.className = "message notself";
    memberElement.innerText = sender;
    messageElement.appendChild(memberElement)
    const memberMessage = document.createElement("div");
    memberMessage.className = "message notself";
    memberMessage.innerText = `${message}  ${time}`;
    messageElement.appendChild(memberMessage);
    messagesDiv.appendChild(messageElement)
    scrollToBottom();
});