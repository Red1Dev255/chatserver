// filepath: /game-server/game-server/src/server.ts
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
const rooms: { [key: string]: any } = {};

// Test de la route GET '/'
app.get('/', (req, res) => {
  res.send('Le serveur est en marche');
});

io.on('connection', (socket) => {
  // Rejoindre une room
  socket.on('join', ({ username, room }) => {
    socket.join(room);

    console.log(username + ' a rejoint la room ' + room);
    // Envoyer l'état actuel des choix dans cette room
    if (!rooms[room]) rooms[room] = {}; 

    socket.emit('joinSuccess', {
      success: true
    });
    
  });

  // Quand un utilisateur envoie un message
  socket.on('message', ({ room, username, message }) => {

    if (!Array.isArray(rooms[room]) || !rooms[room]) {
      rooms[room] = []; // Si ce n'est pas un tableau, initialisez-le en tant que tableau vide
    }
    
    rooms[room].push({ username, message }); // Enregistrer le message de l'utilisateur

    // Émettre le message à tous les utilisateurs de la room
    io.to(room).emit('newMessage', { username, message });
  });
});


// Démarrer le serveur
server.listen(3000, () => {
  console.log('Serveur en écoute sur le port 3000');
});