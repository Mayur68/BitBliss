socket.on("friendRequest", (data) => {
    const { userId } = data;
});

function loadNotifications() {
    socket.emit("loadNotifications", userId);
}

loadNotifications();

function notifications() {

    fetch("/notifications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: userId }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                createNotificationContainer()
                notify(data.friendRequests);
            }
        })
        .catch((error) => {
            console.error(error);
        });

}

function createNotificationContainer() {
    const backdrop = document.createElement('div');
    backdrop.classList.add('backdrop');
    backdrop.addEventListener('click', function (event) {
        if (event.target === backdrop) {
            backdrop.remove();
            notificationsDiv.remove();
        }
    });

    const notificationsDiv = document.createElement('div');
    notificationsDiv.classList.add('blurred-div');

    const mainTitle = document.createElement('h2');
    mainTitle.setAttribute('id', 'mainTitle');
    mainTitle.textContent = `Your Feed`;
    notificationsDiv.appendChild(mainTitle);

    document.body.appendChild(backdrop);
    document.body.appendChild(notificationsDiv);
}

function notify(userIds) {
    const notificationsDiv = document.querySelector('.blurred-div')
    userIds.forEach((userId) => {
        const notificationContainer = document.createElement('div');
        notificationContainer.setAttribute('id', 'notificationContainer')

        if (userId) {
            const title = document.createElement('h5');
            title.setAttribute('id', 'title');
            title.textContent = `Friend Request: `;
            notificationContainer.appendChild(title);

            const acceptBtn = document.createElement('button');
            acceptBtn.setAttribute('id', 'acceptBtn');
            acceptBtn.textContent = `Accept request from ${userId}`;
            acceptBtn.addEventListener('click', function () {
                acceptRequest(userId);
            });
            notificationContainer.appendChild(acceptBtn);

            const rejectBtn = document.createElement('button');
            rejectBtn.setAttribute('id', 'rejectBtn');
            rejectBtn.textContent = 'Reject';
            rejectBtn.addEventListener('click', function () {
                rejectRequest(userId);
            });
            notificationContainer.appendChild(rejectBtn);
        }

        notificationsDiv.appendChild(notificationContainer);
    });
}


function acceptRequest(friendId) {
    const notificationsDiv = document.querySelector('.blurred-div')
    const backdrop = document.querySelector('.backdrop')
    const friendsListDiv = document.getElementById("notifications");
    const data = {
        userId: userId,
        friendId: friendId,
    };
    console.log(data);

    fetch("/addFriend", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                backdrop.remove();
                notificationsDiv.remove();
                notifications()
                friendsListDiv.innerHTML = ``;
                loadFriends()
            } else {
                alert("Failed to send Request: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error sending Request:", error);
            alert("An error occurred while sending Request. Please try again later.");
        });

}

function rejectRequest(friendId) {
    const notificationsDiv = document.querySelector('.blurred-div')
    const backdrop = document.querySelector('.backdrop')
    const friendsListDiv = document.getElementById("notifications");
    const data = {
        userId: userId,
        friendId: friendId,
    };
    console.log(data);

    fetch("/deleteFriendRequest", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.status === "success") {
                backdrop.remove();
                notificationsDiv.remove();
                notifications()
                friendsListDiv.innerHTML = ``;
                loadFriends()
            } else {
                alert("Failed to send Request: " + data.message);
            }
        })
        .catch((error) => {
            console.error("Error sending Request:", error);
            alert("An error occurred while sending Request. Please try again later.");
        });
}