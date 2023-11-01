messageInput = document.getElementById("message-input");
messageInput.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
        sendMessage()
    }
});

messageInput.addEventListener("keypress", function (event) {
    data = {
        userId: userId,
        recipientID: recipientID,
    }
    socket.emit('typing', data);
});

socket.on('istyping', (data) => {
    const chat_header = document.getElementById('chat-header');

    const existingTypingElement = document.querySelector('.friend-typing');
    if (existingTypingElement) {
        chat_header.removeChild(existingTypingElement);
    }

    const profileTyping = document.createElement("div");
    profileTyping.className = "friend-typing";
    profileTyping.innerText = "Typing...";
    profileTyping.style.color = "black";
    profileTyping.style.marginLeft = "20px";
    chat_header.appendChild(profileTyping);

    setTimeout(() => {
        const elementToRemove = document.querySelector('.friend-typing');
        if (elementToRemove) {
            chat_header.removeChild(elementToRemove);
        }
    }, 2000);
});
