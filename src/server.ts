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

const roomsMessage: { [key: string]: MessageUser[] } = {};
const roomsKeys: { [key: string]: UserKey[] } = {};

// Test de la route GET '/'
app.get('/', (req, res) => {
  res.send('Le serveur est en marche');
});

io.on('connection', (socket) => {
  socket.on('join', ({ username, room, publicKey }) => {
        socket.join(room);
        
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
  });

  //receive message from client and send it to the room
  socket.on('newMessageSend', ({ room, usernameSender, encryptedMessagesRoom }) => {
    io.to(room).emit('newMessage', { usernameSender, encryptedMessagesRoom });
  });
});


// start the server
server.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});