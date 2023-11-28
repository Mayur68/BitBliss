socket.on("UserRooms", (data) => {
    const { userRooms } = data;
    updateRoomsList(userRooms);
});


function loadRooms() {
    const friendsListDiv = document.getElementById("friends-list");
    friendsListDiv.innerHTML = "";
    socket.emit("loadRooms", userId);
}





function updateRoomsList(rooms) {
    const friendsListDiv = document.getElementById("friends-list");
    if (!rooms) {
        friendsListDiv.innerHTML = `<label style="margin: auto;">Add people to chat</label>`;
    } else {
        friendsListDiv.innerHTML = " ";
        rooms.forEach((room) => {
            const roomElement = document.createElement("div");
            roomElement.className = "friend-item";
            roomElement.innerText = room.name;
            roomElement.onclick = () => roomClickHandler(room);
            friendsListDiv.appendChild(roomElement);
        });
    }
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
            console.log(data);
            if (data.status === "success") {
                alert("Room created");
            } else {
                alert("Failed to create room: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error creating room:", error);
            alert("An error occurred while creating the room. Please try again later.");
        });

    loadRooms()
}


function roomClickHandler(room) {
    roomName = room;

    const dataToSend = {
        roomName: room,
        userId: userId,
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
                const chatHistory = data.chatHistory;
                displayChatHistory(chatHistory);
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