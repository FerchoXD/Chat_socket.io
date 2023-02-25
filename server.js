const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const fs = require('fs');
const globalUsers = new Set();


app.use(express.static(__dirname));

app.get('/', function(req, res){
  res.sendFile(__dirname + './index.html');
});



io.on('connection', function(socket){
  console.log('Usuario conectado');

  socket.on('disconnect', function(){
    console.log('Usuario desconectado');
  });

  socket.on('set username', function(username){
    console.log('Usuario: ' + username);
  });

  socket.on('chat message', function(msg){
    console.log('Mensaje: ' + msg);
    io.emit('chat message', msg);
  });

  socket.on('chat image', function(data){
    console.log('Imagen recibida');
    io.emit('chat image', data);
  });
});

var users = []; // lista de usuarios registrados

io.on('connection', function(socket) {
  // función para comprobar si un nombre de usuario ya existe en la lista de usuarios
  function usernameExists(username) {
    return users.indexOf(username) >= 0;
  }

  socket.on('check username', function(username, callback) {
    callback(usernameExists(username));
  });

  socket.on('add user', function(username, callback) {
    if (usernameExists(username)) {
      callback(false); // indicar que no se pudo agregar el usuario
      return;
    }
    users.push(username); // agregar el nuevo usuario a la lista
    callback(true); // indicar que se agregó el usuario correctamente
  });

  // otras funciones del socket.io...
});




http.listen(3000, function(){
  console.log('Servidor escuchando en el puerto 3000');
});