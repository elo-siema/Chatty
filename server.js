const app = require('express')()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const activeClientsTable = {}
const areTyping = {}


//requests handlers
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})
app.get('/user.js', (req, res) => {
  res.sendFile(__dirname + '/user.js')
})
app.get('/socket.io.js', (req, res) => {
  res.sendFile(__dirname + '/socket.io.js')
})


//chat event handlers
io.on('connection', (socket) => {
  //user creation handler
  socket.on('user creation', (username) => {
    let message
    const tmp = activeClientsTable[socket.id]
    if( tmp == undefined)
      if(username == "")
        return
      else
        message = username + " connected"
    else if(tmp == username)
      return
    else
      message = tmp + " changed username to " + username
    activeClientsTable[socket.id] = username
    console.log(message + "\t\t(" + socket.id + ")")
    socket.broadcast.emit('server message', message)
  })

  //messages handler
  socket.on('client message', (msg) => {
    const user = activeClientsTable[socket.id]
    if(user != undefined) {
      const message = user + ": " + msg
      console.log(message + "\t\t(" + socket.id + ")")
      socket.broadcast.emit('server message', message)
    }
    else
      socket.emit('server message', "You need a username to use the chat!")
  })

  //'user is typing'
  socket.on('is typing', (bool) => {
    const who = activeClientsTable[socket.id]
    if(bool)
      areTyping[socket.id] = who
    else
      delete areTyping[socket.id]
    socket.broadcast.emit('is typing', areTyping)
  })

  //client disconnection handler
  socket.on('disconnect', () => {
    const user = activeClientsTable[socket.id]
    if(user != undefined) {
      io.emit('server message',  + " disconnected")
      console.log(user + ' disconnected')
      delete activeClientsTable[socket.id]
    }
  })
})


//http listener
http.listen(8000, () => {
  console.log('listening on port 8000')
})
