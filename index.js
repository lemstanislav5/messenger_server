//ТУТОРИАЛ https://socket.io/docs/v3/emit-cheatsheet/
var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', socket => {
  console.log('A user connected');
//   setTimeout(function() {
//     //Sending an object when emmiting an event
//     socket.send('Sent a message 4seconds after connection!');
//  }, 4000);

  socket.on('disconnect', function () {
      console.log('A user disconnected');
  });
  socket.on('message', message => {
    console.log(message)
    console.log(socket.id)
    socket.send(socket.id, 'Sent a message 4seconds after connection!');
    socket.emit(`[${socket.id}]: ${message}`)
    socket.broadcast.emit(`[${socket.id}]: ${message}`)
  })
})

http.listen(3000, function() {
  console.log('listening on *:3000');
});