const express = require('express');
const path = require('path');
const http = require('http');
const socket = require('socket.io');

const formatMessage = require('./utils/message');
const {
    userJoin,
    getCurrentUser,
    userLeave,
    getRoomUsers
} = require('./utils/user');

const app = express();
const server = http.createServer(app);
const io = socket(server);

const botName = 'ChatBot';

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

// run when client connects
io.on('connection', (socket) => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        // welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to Chat Application!'));

        // broadcast when a user connects to specific room
        socket.broadcast.to(user.room)
            .emit('message', formatMessage(botName, `${user.username} has joined the chat.`));

        // send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });

    });

    // listen chat message and send the message to specific room
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });

    // client disconnects
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit(
                'message',
                formatMessage(botName, `${user.username} has left the chat.`)
            );

            // send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }
    });

});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
    console.log(`Server is listening is on port http://localhost:${PORT}`);
});