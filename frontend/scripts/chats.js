let recipientID;
let receivedMessage;

socket.on("loadFriendsResponse", (data) => {
    const { friends } = data;
    updateFriendsList(friends);
});

function loadFriends() {
    socket.emit("loadFriends", userId);
}

loadFriends()

function updateFriendsList(friends) {
    const friendsListDiv = document.getElementById("friends-list");

    if (friends.length === 0) {
        friendsListDiv.innerHTML = `<label style="margin: auto; color:black;">Add people to chat</label>`;
    } else {
        friendsListDiv.innerHTML = "";
        friends.forEach((friend) => {
            loadData(friend);
        });
    }
}


async function loadData(friend) {
    try {
        const username = friend;
        const response = await fetch('/loadData', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username }),
        });

        if (!response.ok) {
            throw new Error('Failed to fetch');
        }

        const data = await response.json();

        if (data.status === 'success') {
            const friendElement = createFriendElement(data.user);
            const friendsListDiv = document.getElementById('friends-list');
            friendsListDiv.appendChild(friendElement);
        } else {
            throw new Error('Failed to load profile data for ' + friend);
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to load profile data for ' + friend);
    }
}



function createFriendElement(user) {
    const friendElement = document.createElement("div");
    friendElement.className = "friend-item";
    const profileImage = document.createElement("div");
    profileImage.className = "friend-profilePhoto";
    const profileImage1 = document.createElement("img");

    if (user.profilePhoto) {
        console.log("srfdgtfgdanhz")
        profileImage1.src = user.profilePhoto;
        profileImage1.alt = "Profile Photo";
        profileImage.appendChild(profileImage1);
    } else {
        profileImage1.src = "../assets/default-profile.jpg";
        profileImage1.alt = "Profile Photo";
        profileImage.appendChild(profileImage1);
    }
    friendElement.appendChild(profileImage);
    const friendName = document.createElement("div");
    friendName.className = "friend-name";
    friendName.style.paddingTop = "10px"
    friendName.style.marginLeft = "0"
    friendName.innerText = user.username;

    friendElement.appendChild(friendName);

    friendElement.onclick = () => friendClickHandler(user.username, user);

    return friendElement;
}

function scrollToBottom() {
    const chatContainer = document.querySelector(".chat-window .messages");
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function friendClickHandler(x, user) {
    recipientID = x;
    const chatWindow = document.querySelector(".chat-window");

    chatWindow.innerHTML = `<div id="chat-header"></div>
                <div class="messages" id="messages"></div>
                <div id="input">
                    <input type="text" id="message-input" placeholder="Type a message...">
                    <button onclick="sendMessage()">Send</button>
                    <button onclick="clearChat()">Clear chat</button>
                    <button onclick="tictactoe()">Challenge</button>
                </div>`;

    loadHeader(recipientID, user)

    const script = document.createElement("script");
    script.src = "../frontend/scripts/user.js";
    script.id = "user-script";
    document.body.appendChild(script);

    const dataToSend = {
        recipientID: x,
        userId: userId
    };

    fetch("/loadHistory", {
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

}

function loadHeader(x, user) {
    const chat_header = document.getElementById('chat-header');
    const profileImage = document.createElement("div");
    profileImage.className = "friend-profilePhoto";
    profileImage.style.marginLeft = "5px";
    const profileImage1 = document.createElement("img");
    if (user.profilePhoto) {
        console.log("srfdgtfgdanhz");
        profileImage1.src = user.profilePhoto;
        profileImage1.alt = "Profile Photo";
        profileImage.appendChild(profileImage1);
    } else {
        profileImage1.src = "../assets/default-profile.jpg";
        profileImage1.alt = "Profile Photo";
        profileImage.appendChild(profileImage1);
    }
    chat_header.appendChild(profileImage);
    const profileName = document.createElement("div");
    profileName.className = "friend-Name";
    profileName.innerText = x;
    profileName.style.color = "black";
    profileName.style.marginLeft = "10px";
    chat_header.appendChild(profileName);
}

function displayChatHistory(chatHistory) {

    const messages = document.getElementById("messages");
    chatHistory.forEach((chat) => {
        if (chat.message && chat.message.trim() !== '') {
            const messageDiv = document.createElement('div');
            if (chat.sender === userId) {
                messageDiv.className = "message self";
            } else if (chat.sender === recipientID) {
                messageDiv.className = "message notself";
            }

            messageDiv.textContent = chat.message + ' ' + chat.timestamp;
            messages.appendChild(messageDiv);
        }
    });
    scrollToBottom();
}

function sendMessage() {

    const messageInput = document.getElementById("message-input");
    const message = messageInput.value;

    if (message.trim() === "") return;
    if (!recipientID) {
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
        recipientID: recipientID,
        userId: userId,
        message: message,
        time: formattedTime,
    };

    fetch("/saveHistory", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log(data);
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


    socket.emit('send_message', {
        senderID: "<%= username %>",
        recipientID: recipientID,
        message: message,
        time: formattedTime
    });

    messageInput.value = "";
    scrollToBottom();
}


socket.on("receiveMsg", (data) => {
    const { senderID, message, time } = data;
    receivedMessage = message;
    const messagesDiv = document.getElementById("messages");
    const messageElement = document.createElement("div");
    messageElement.className = "message notself";
    messageElement.innerText = `${message}  ${time}`;
    messagesDiv.appendChild(messageElement);
    scrollToBottom();
});


function clearChat() {
    document.getElementById("messages").innerHTML = "";
    data = {
        userId: userId,
    }
    fetch("/clearChat", {
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
                const chat_window = document.getElementById("messages");
                chat_window.innerHTML = "";
            } else {
                console.log("Failed to clear chat: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error clearing chat:", error);
            alert("An error occurred while clearing chat. Please try again later.");
        });
}
