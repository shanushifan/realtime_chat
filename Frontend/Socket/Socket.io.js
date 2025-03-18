import { io } from 'socket.io-client'; 
import { Baseurl } from '../services api/baseurl'; // Adjust the path

let socket = null;
let messageQueue = []; // Store messages when offline

export const initSocket = (userId) => {
  if (!socket) {
    socket = io(Baseurl, { autoConnect: true });

    // Emit userId to the server
    if (userId) {
      socket.emit('AddUserSocket', userId);
    }

    // Handle reconnection - Send offline messages
    socket.on('connect', () => {
      console.log('Reconnected! Sending queued messages...');
      const offlineMessages = JSON.parse(localStorage.getItem('offlineMessages')) || [];
      while (offlineMessages.length > 0) {
        const message = offlineMessages.shift();
        socket.emit('sendMessage', message);
      }
      localStorage.setItem('offlineMessages', JSON.stringify(offlineMessages));
    });
    

    // Handle socket disconnection
    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });
  }
  return socket;
};

export const sendMessage = (messageData) => {
  if (socket && socket.connected) {
    socket.emit('sendMessage', messageData);
  } else {
    console.log('User offline, storing message in queue');
    messageQueue.push(messageData);
    localStorage.setItem('offlineMessages', JSON.stringify(messageQueue));
  }
};

export const getSocket = () => {
  if (!socket) {
    console.error('Socket not initialized. Call initSocket() first.');
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log('Socket connection closed.');
  }
};
