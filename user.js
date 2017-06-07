$(function() {
  let username = ""
  const socket = io()
  const areTyping = new (function() {
    this.data = ""
    this.index = 0
    const self = this
    this.updateData = function(who) {
      const keysTable = Object.keys(who)
                        .filter(e => who[e]!=username)
      console.log(keysTable)
      if (keysTable.length == 0)
        self.data = ""
      else if (keysTable.length == 1){
        self.data = who[keysTable[0]] + " is typing..."
      }
      else {
        self.data = " are typing..."
        for (user in keysTable)
          self.data = who[user] + self.data
      }
    }
  })()
  $('#messages').append($('<li>').text(areTyping.data))

  //username submiter
  $('#usr').submit(() => {
    username = $('#username').val()
    socket.emit('user creation', username)
    $('#messages')[0].childNodes[areTyping.index].remove()
    $('#messages').append($('<li>').text("Connected!"))
    $('#messages').append($('<li>').text(areTyping.data))
    areTyping.index += 1
    return false
  })

  //message sender
  $('#msg').submit(() => {
    const msg = $('#m').val()
    $('#m').val('')
    $('#m').trigger('blur')
    socket.emit('client message', msg)
    $('#messages')[0].childNodes[areTyping.index].remove()
    $('#messages').append($('<li>').text("Me: " + msg))
    $('#messages').append($('<li>').text(areTyping.data))
    areTyping.index += 1
    return false
  })

  //am I typing?
  $('#m').on('focusin', () => {
    socket.emit('is typing', true)
    return false
  })
  $('#m').on('focusout', () => {
    socket.emit('is typing', false)
    return false
  })

  //message listener
  socket.on('server message', msg => {
    $('#messages')[0].childNodes[areTyping.index].remove()
    $('#messages').append($('<li>').text(msg))
    $('#messages').append($('<li>').text(areTyping.data))
    areTyping.index += 1
  })

  //'{user} is typing'
  socket.on('is typing', (typers) => {
    areTyping.updateData(typers)
    $('#messages')[0].childNodes[areTyping.index].remove()
    $('#messages').append($('<li>').text(areTyping.data))
  })
})
