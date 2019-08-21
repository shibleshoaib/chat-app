// Make connection
const socket = io.connect('http://192.168.0.30:3000');
let timeout;

// Query DOM
const message = document.getElementById('message'),
    name = document.getElementById('name'),
    btn = document.getElementById('send'),
    output = document.getElementById('output'),
    feedback = document.getElementById('feedback');
    

function pageOnloadFunction(){
        // output = document.getElementById('output');
		document.getElementById("message").focus();
let url='http://192.168.0.30:3000/chatData';
fetch(url)
.then(response => response.json())
.then(data => {
    for(let i=0;i<data.length;i++){
        output.innerHTML += '<p><strong>' + data[i].username + ': </strong>' + data[i].message + '</p>';
    }
    chatting = document.getElementById('chat-window');
    chatting.scrollTop = chatting.scrollHeight;
  console.log(data) // Prints result from `response.json()` in getRequest
})
.catch(error => console.error(error))
    }
    
    
    let x = document.cookie;
    let y=x.split("=")[1];
    y===undefined? name.value='': name.value=y;
    if(y===undefined){
        window.location.replace("http://192.168.0.30:3000");
    }

function newDoc() {
    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
    window.location.replace("http://192.168.0.30:3000");
  }

// Emit events
btn.addEventListener('click', () => {
    socket.emit('chat', {
        message: message.value,
        name: name.value
    });
    message.value = "";
});


function timeoutFunction() {
    socket.emit("typing", false);
  }

message.addEventListener('keypress', () => {
    if (event.keyCode === 13) {
        
        console.log('Enter pressed');
       event.preventDefault();
       document.getElementById("send").click();
       return;
      }
    socket.emit('typing', name.value);
    clearTimeout(timeout);
    timeout = setTimeout(timeoutFunction, 2000);
})

// Listen for events
socket.on('chat', (data) => {
	    chatting = document.getElementById('chat-window');
    chatting.scrollTop = chatting.scrollHeight;
    feedback.innerHTML = '';
    output.innerHTML += '<p><strong>' + data.name + ': </strong>' + data.message + '</p>';
});

socket.on('typing', (data) => {
	chatting = document.getElementById('chat-window');
    chatting.scrollTop = chatting.scrollHeight;
    data ? feedback.innerHTML = '<p><em>' + data + ' is typing a message...</em></p>': feedback.innerHTML = '';
});