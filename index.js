const dotenv = require('dotenv');
dotenv.config();

const express = require("express");
const app = express();
app.use(express.static('public'));

var server = app.listen(process.env.PORT, () => {
  console.log(`listening on PORT:${process.env.PORT}`);
});

const { Server } = require('socket.io');

const io = new Server(server);

io.on('connection', (socket) => {

  var currentChannel;

  console.log(`A user has connected ${socket.id}`);
  sendUsersCount();

  socket.on('disconnect', (reason) => {
    console.log(`User Disconnected - Reason: ${reason}`);
    sendUsersCount();
    sendChannelUserCount();
  });

  socket.on('chat message', (msg) => {
    socket.broadcast.to(currentChannel).emit('chat message', msg);
  });

  socket.on('channel users count', (payload) => {
    sendChannelUserCount();
  });

  socket.on('all users count', sendUsersCount);

  socket.on('join', (channel) => {
    console.log("Join request: " + channel);
    currentChannel = channel;
    socket.join(currentChannel);
    sendChannelUserCount();
  });

  socket.on('leave', (channel) => {
    console.log("Leave request: " + channel);
    socket.leave(currentChannel);
    sendChannelUserCount();
  });

  function sendChannelUserCount() {
    const userCount = io.sockets.adapter.rooms.get(currentChannel)?.size;
    if (userCount) {
      console.log("Channel User Count sent : " + userCount);
      io.to(currentChannel).emit('channel users count', userCount);
    }
  }

  function sendUsersCount() {
    const count = io.sockets.adapter.sids.size;
    console.log("all users count : " + count);
    if (count) {
      io.emit('all users count', count);
    }
  }
})