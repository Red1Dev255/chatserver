import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

import { MessageUser, UserKey, RoomStatut } from './data/UtilsFunction';

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
let  roomsStatusList = Array<RoomStatut>();

// Test de la route GET '/'
app.get('/', (req, res) => {
  res.send('Le serveur est en marche');
});


const addToRoom = (room: string) => {
  const roomValue = roomsStatusList.find((r) => r.room === room);
  if(!roomValue){
    roomsStatusList.push({ room: room, status: true });
    return true;
  } else {
    return !(roomValue.status === false);
  }
}


app.post('/login', (req, res) => {

  const { username, room, publicKey} = req.body;

  if(username && room){
      
    let userKey: UserKey = {
      username: username,
      publicKey: publicKey
    };

    const ajoutRoom = addToRoom(room);

    if(!ajoutRoom){
      res.status(400).send('Room is closed, you can not join until admin open it');
      return;
    }
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

  const { username, room} = req.body;
  if(username && room){
    const userKeys = roomsKeysMap.get(room);    
    if (userKeys) {

      const index = userKeys.findIndex((user) => user.username === username);
      
      if (index !== -1) {
        const roomStatusIndex = roomsStatusList.findIndex((r) => r.room === room);
        if (roomStatusIndex !== -1) {
          roomsStatusList[roomStatusIndex].status = !roomsStatusList[roomStatusIndex].status;
          res.status(200).send({status : roomsStatusList[roomStatusIndex].status});
        } else {
          res.status(400).send("Room not found");
        }
      }
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
        roomsKeysMap.set(room, userKeys);
        io.to(room).emit('newListKey', { usersKeys: userKeys });
      }
    }

    if(roomsKeysMap.get(room)?.length === 0 ){ // if the room is empty, remove it from the map{
      roomsKeysMap.delete(room);  
      roomsStatusList = roomsStatusList.filter((r) => r.room !== room);
      console.log(`Room ${room} is empty, removing it`);
    }
}

// start the server
server.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});