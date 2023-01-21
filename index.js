<<<<<<< HEAD
// //!Шифрование Диффи-Хеллмана на JavaScript https://roscenzura.com/threads/1173/
// //ТУТОРИАЛ https://socket.io/docs/v3/emit-cheatsheet/
const port = 4000;
=======
//!Шифрование Диффи-Хеллмана на JavaScript https://roscenzura.com/threads/1173/
//ТУТОРИАЛ https://socket.io/docs/v3/emit-cheatsheet/
const PORT = 4000;
>>>>>>> 6c73bdf64cdfbc756b256b4b1dc8dc1d7805aeb3
const express = require('express'),
      app = express(),
      http = require('http').Server(app),
      io = require('socket.io')(http),
      routes = require('./routes/index');

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

<<<<<<< HEAD
app.use('/api', routes);
app.use('/index.html', (req, res) => {
    res.sendFile(__dirname + '/index.html');
})
app.get('/', (req, res) => {    
  res.send('Тест'); 
});

=======
// app.use('/api', routes);
// app.use('/index.html', (req, res) => {
//     res.sendFile(__dirname + '/index.html');
// })
app.get('/', (req, res) => {    
  res.send('Тест'); 
});
>>>>>>> 6c73bdf64cdfbc756b256b4b1dc8dc1d7805aeb3

io.on('connection', socket => {
  console.log('A user connected');
//   setTimeout(function() {
//     //Sending an object when emmiting an event
//     socket.send('Sent a message 4seconds after connection!');
//  }, 4000);

  socket.on('disconnect',  () => {
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

<<<<<<< HEAD
http.listen(port, () => {
  console.log('listening on *:' + port);
=======
http.listen(PORT, function() {
  console.log('listening on *:' + PORT);
>>>>>>> 6c73bdf64cdfbc756b256b4b1dc8dc1d7805aeb3
});

