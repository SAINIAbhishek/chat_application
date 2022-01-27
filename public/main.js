// client side
const socket = io();
const chatForm = document.getElementById('chat-form');
const formInput = document.getElementById('msg-input');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// message from server
socket.on('message', (message) => {
    outputMessage(message);
    // scroll down
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

// message to dom
function outputMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    const p = document.createElement('p');
    p.classList.add('meta');
    p.innerText = message.username;
    p.innerHTML += `<span>${message.time}</span>`;
    div.appendChild(p);
    const para = document.createElement('p');
    para.classList.add('text');
    para.innerText = message.text;
    div.appendChild(para);
    chatMessages.appendChild(div);
}

// message submit
chatForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // get message text
    let message = formInput.value;
    message = message.trim();

    if (!message) {
        return false;
    }

    // emit message to server
    socket.emit('chatMessage', message);

    // clear input
    formInput.value = '';
    formInput.focus();
});

// get username and room from URL
const { username, room } = Qs.parse(location.search, {
    ignoreQueryPrefix: true,
});

// join chatroom
socket.emit('joinRoom', { username, room });

// get room and users
socket.on('roomUsers', ({ room, users }) => {
    outputRoomName(room);
    outputUsers(users);
});

// add room name to DOM
function outputRoomName(room) {
    roomName.innerText = room;
}

// add users to DOM
function outputUsers(users) {
    userList.innerHTML = '';
    users.forEach((user) => {
        const li = document.createElement('li');
        li.innerText = user.username;
        userList.appendChild(li);
    });
}