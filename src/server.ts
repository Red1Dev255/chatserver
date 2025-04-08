import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

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


interface MessageUser {
  username: string;
  encryptedMessage: string;
}

interface UserKey{
  username: string;
  publicKey: string;
}


let  roomsMessagesMap = new Map<string, Array<MessageUser>>(); 
let  roomsKeysMap = new Map<string, Array<UserKey>>();

app.use(cors());
app.use(express.json());

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


app.post('/disconnect', (req, res) => {
  
  const { username, room} = req.body;

  if(username && room){
    if(roomsKeysMap.has(room)){
      // remove the user from the room
      const usersKeys = roomsKeysMap.get(room);

      if(usersKeys){
        const userIndex = usersKeys.findIndex((user: UserKey) => user.username === username);
        if(userIndex !== -1){
          usersKeys.splice(userIndex, 1);
          res.status(200).send('User removed from the room');
        } else {
          console.log(`User ${username} not found in room ${room}`);
          res.status(400).send('User not found in the room');
        }
      }
    } else {
      res.status(400).send('Room not found');
    }
  } else {
    res.status(500).send('Error occurred while disconnecting from the room'); 
  }
})


io.on('connection', (socket) => {


  // socket.on('leave', ({ username, room }) => {
  //     console.log(`User ${username} left room ${room}`);
  // });


  //Update connected users in the room and indicate that the server is ready to receive messages
  // setInterval(() => {
    // const roomsPresent = UpdateRoomsPresent();
    // for (const room of Object.keys(roomsKeysMap)) {
    //   io.to(room).emit('serverIsOk', true);
    // }
// }, 5000); 



// const UpdateRoomsPresent = () => {
  // let savedRooms = Object.keys(roomsKeys); // Get the keys of the rooms that are present in roomsKeys
  // let connectedNetworkRooms = [...io.sockets.adapter.rooms.entries()].map(([k]) => k); // Get the keys of all connected rooms
  // let roomNotConnected = savedRooms.filter(roomKey => !connectedNetworkRooms.includes(roomKey)); // Filter the rooms that are not connected

  // for(let roomId of Object.keys(roomsKeys)){
  //   if (roomNotConnected.includes(roomId)) {
  //     delete roomsKeys[roomId];
  //   }      
  // }
// }

  socket.on('join', ({ username, room }) => {
    console.log(`User ${username} joined room ${room}`);
    socket.join(room);
    io.to(room).emit('newListKey', { usersKeys: roomsKeysMap.get(room)});
  })

  //receive message from client and send it to the room
  socket.on('newMessageSend', ({ room, username, encryptedMessagesRoom }) => {
    socket.join(room);
    io.to(room).emit('newMessage', { username, encryptedMessagesRoom });
  });
});


// start the server
server.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});