const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const { Socket } = require('socket.io');
const globalUsers = new Set();
const cambio = [];
const socketsP = new Map();

app.use(express.static(__dirname));

app.get('/', function (req, res) {
  res.sendFile(__dirname + './index.html');
});

io.on('connection', function (socket) {
  console.log('Usuario conectado');

  socket.on('disconnect', function () {
    console.log('Usuario desconectado');
  });

  socket.on('set username', function (username) {
    console.log('Usuario: ' + username);
    socket.nicknames = username;
    socketsP.set(socket.nicknames,socket.id);
  });

  socket.on('chat message', function (msg) {
    console.log('Mensaje: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('chat image', function (data) {
    console.log('Imagen recibida');
    io.emit('chat image', data);
  });

  socket.on('chat imagePrivate', function (data) {
    console.log('Imagen recibida de froma privada xd');
    //io.emit('chat image', data);
     let receptor = data.receptor;
      let emisor = socket.nicknames;
      let img = data.img;
      console.log(receptor)
      console.log(emisor)
      io.to(socketsP.get(receptor)).emit('chat imagePrivate',{emisor:emisor, img:img})
      io.to(socketsP.get(emisor)).emit('chat imagePrivate',{emisor:emisor, img:img})
  });
});

  

var users = []; // lista de usuarios registrados

io.on('connection', function (socket) {
  // función para comprobar si un nombre de usuario ya existe en la lista de usuarios
  function usernameExists(username) {
    return users.indexOf(username) >= 0;

  }

  socket.on('messagePrivate',(data)=>{
    let receptor = data.receptor;
    let emisor = socket.nicknames;
    let message = data.message;
    console.log("entro");
    console.log(receptor);
    console.log(emisor);
    console.log(message);
    io.to(socketsP.get(receptor)).emit('newMessagePrivate',{emisor:emisor,message:message})
    io.to(socketsP.get(emisor)).emit('newMessagePrivate',{emisor:emisor,message:message})
  });

  socket.on('check username', function (username, callback) {
    callback(usernameExists(username));
  });

  socket.on('add user', function (username, callback) {
    if (usernameExists(username)) {
      callback(false); // indicar que no se pudo agregar el usuario
      return;
    }
    users.push(username); // agregar el nuevo usuario a la lista
    io.sockets.emit('users',users);
    callback(true,users); // indicar que se agregó el usuario correctamente
  });

  socket.on('disconnect' , function (data){
    console.log('se desconecto un we')
    console.log(data)
    console.log (socket.nicknames)
    users.splice(users.indexOf(data), 1);
    io.sockets.emit('users',users);
  })
  // otras funciones del socket.io...
});




http.listen(3000, function () {
  console.log('Servidor escuchando en el puerto 3000');
});