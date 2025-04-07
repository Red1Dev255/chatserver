import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

interface MessageUser {
  username: string;
  encryptedMessage: string;
}

interface UserKey{
  username: string;
  publicKey: string;
}

const roomsMessage: { [roomId: string]: MessageUser[] } = {};
const roomsKeys: { [roomId: string]: UserKey[] } = {};

// Test de la route GET '/'
app.get('/', (req, res) => {
  res.send('Le serveur est en marche');
});

io.on('connection', (socket) => {
  socket.on('join', ({ username, room, publicKey }) => {
        
        
        if (!roomsKeys[room]) {
          roomsKeys[room] = [];
        }
      
        let userKey: UserKey = {
          username: username,
          publicKey: publicKey
        };

         // verify if the user is already in the room
        const userExists = roomsKeys[room].some((user: UserKey) => user.username === username);

          // add the user to the room if it doesn't exist
        if (!userExists) {
          socket.join(room);
          roomsKeys[room].push(userKey);
          socket.emit('joinSuccess', {
            success: true,
            detailsMessage:'Connexion réussie'
          });

          io.to(room).emit('newListKey', { usersKeys: roomsKeys[room] });

        } else {
          // send a message to the client that the username is already taken
          socket.emit('joinSuccess', {
            success: false,
            detailsMessage:'Le nom d\'utilisateur est déjà pris dans cette salle.'
          });
        }
  });

  socket.on('leave', ({ username, room }) => {
    // delete the user from the room
      roomsKeys[room] = roomsKeys[room]?.filter((user: UserKey) => user.username !== username);
      if (roomsKeys[room].length === 0) {
        delete roomsKeys[room];
      }
      console.log(`User ${username} left room ${room}`);
  });


  //Update connected users in the room and indicate that the server is ready to receive messages
  setInterval(() => {
    const roomsPresent = UpdateRoomsPresent();
    for (const room of Object.keys(roomsKeys)) {
      io.to(room).emit('serverIsOk', true);
    }
}, 5000); 



const UpdateRoomsPresent = () => {
  let savedRooms = Object.keys(roomsKeys); // Get the keys of the rooms that are present in roomsKeys
  let connectedNetworkRooms = [...io.sockets.adapter.rooms.entries()].map(([k]) => k); // Get the keys of all connected rooms
  let roomNotConnected = savedRooms.filter(roomKey => !connectedNetworkRooms.includes(roomKey)); // Filter the rooms that are not connected

  for(let roomId of Object.keys(roomsKeys)){
    if (roomNotConnected.includes(roomId)) {
      delete roomsKeys[roomId];
    }      
  }
}

  //receive message from client and send it to the room
  socket.on('newMessageSend', ({ room, usernameSender, encryptedMessagesRoom }) => {
    io.to(room).emit('newMessage', { usernameSender, encryptedMessagesRoom });
  });
});


// start the server
server.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});