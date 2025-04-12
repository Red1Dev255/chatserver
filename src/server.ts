import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import { MessageUser, UserKey } from './data/UtilsFunction';

const app = express();
const server = http.createServer(app);
import cors from 'cors';

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true,
  }
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

let  roomsMessagesMap = new Map<string, Array<MessageUser>>(); 
let  roomsKeysMap = new Map<string, Array<UserKey>>();

// Test de la route GET '/'
app.get('/', (req, res) => {
  res.send('Le serveur est en marche');
});


app.post('/login', (req, res) => {

  const { username, room, publicKey} = req.body;

  if(username && room){
      
    let userKey: UserKey = {
      username: username,
      publicKey: publicKey
    };

     // verify if the user is already in the room
    const userExists = (roomsKeysMap.get(room) ?? []).some((user: UserKey) => user.username === username);

    if (!userExists) {
      if (!roomsKeysMap.has(room)) {
        roomsKeysMap.set(room, []);
      }
      roomsKeysMap.get(room)!.push(userKey);
      console.log(`User ${username} added to room ${room}`);
      res.status(200).send('User added to the room');
    } else {
      console.log(`User ${username} already exists in room ${room}`);
      res.status(400).send('User already exists in the room');
    }
  } else {
    res.status(500).send('Error occurred while connecting to the room');
  }

})


app.post('/opencloseroom', (req, res) => {

  const { username, room, status} = req.body;

  if(username && room && status){
    const userKeys = roomsKeysMap.get(room);
    if (userKeys) {
      res.status(200).send(status ? "Room closed" : "Room opened");
    } else {
      res.status(400).send("Room not found");
    }
  } else {
    res.status(500).send('Error occurred while opening the room');
  }
  
})



//Disconnect with button 
app.post('/disconnect', (req, res) => {
  
  const { username, room} = req.body;
  if(username && room){
    disconnectFunction(username, room);
    res.status(200).send('User disconnected from the room');
  } else {
    res.status(500).send('Error occurred while disconnecting from the room'); 
  }
})



io.on('connection', (socket) => {

  socket.on('join', ({ username, room }) => {
    socket.data.username = username;
    socket.data.room = room;
    socket.join(room);
    socket.emit('joinSuccess', { username, room });
    io.to(room).emit('newListKey', { usersKeys: roomsKeysMap.get(room)});
  })

  //receive message from client and send it to the room
  socket.on('newMessageSend', ({ room, username, encryptedMessagesRoom }) => {
    socket.join(room);
    io.to(room).emit('newMessage', { username, encryptedMessagesRoom });
  });

  //disconnect event
  socket.on('disconnect', () => {
    const username = socket.data.username;
    const room = socket.data.room;
    if (username && room) {
    disconnectFunction(username, room);
    }
  });

});


const disconnectFunction= (username:string, room:string) => {
    const userKeys = roomsKeysMap.get(room);
    if (userKeys) {
      const index = userKeys.findIndex((user) => user.username === username);
      if (index !== -1) {
        userKeys.splice(index, 1);
        console.log(`User ${username} disconnected from room ${room} (socket disconnect)`);
        io.to(room).emit('newListKey', { usersKeys: userKeys });
      }
    }
}


// start the server
server.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});