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
  console.log(`A user has connected ${socket.id}`);
  sendUsersCount();

  socket.on('disconnect', (reason) => {
    console.log(`User Disconnected - Reason: ${reason}`);
    sendUsersCount();
    sendChannelUsersCount();
  });

  socket.on('chat message', (msg) => {
    const payload = JSON.parse(msg);
    if (payload.channel) {
      socket.broadcast.to(payload.channel).emit('chat message', msg);
    }
  });

  socket.on('channel users count', (payload) => {
    const data = JSON.parse(payload);
    if (data.channel) {
      sendChannelUsersCount(data.channel);
    }
  });

  socket.on('all users count', sendUsersCount);

  socket.on('join', (channel) => {
    console.log("Join request: " + channel);
    socket.join(channel);
    sendChannelUsersCount(channel);
    // sendUsersCount();
  });

  socket.on('leave', (channel) => {
    console.log("Leave request: " + channel);
    socket.leave(channel);
    sendChannelUsersCount(channel);
    // sendUsersCount();
  });

  // Helpers
  /**
   * 
   * @param {String} channel
   * sends online userCount to all Users in this channel  
   */
  function sendChannelUsersCount(channel) {
    const userCount = io.sockets.adapter.rooms.get(channel)?.size;
    if (userCount) {
      console.log("Channel User Count sent : " + userCount);
      io.to(channel).emit('channel users count', userCount);
    }
  }

    /**
   * 
   * @param {String} channel
   * sends online userCount to all Users connected  
   */
  function sendUsersCount(payload) {
    const count = io.sockets.adapter.sids.size;
    console.log("all users count : " + count);
    // send count to all users connected
    if (count) {
      io.emit('all users count', count);
    }
  }
})