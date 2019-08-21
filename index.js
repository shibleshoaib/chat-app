const express = require('express');
const socket = require('socket.io');
const bodyParser = require('body-parser');
const db = require("./db"); 
const path = require('path');
const cookieParser = require('cookie-parser'); 
const router = express.Router();
const port = process.env.PORT || 3000;
const app = express();
const server = app.listen(port, () => {
    console.log('listening for requests on port ' + port);
});
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use('/', router);
app.use(cookieParser()); 
app.use(express.static('public'));

//Route to login page
router.get('/', function(req, res) {
	res.sendFile(path.join(__dirname + '/public/login.html'));
});

 //Route after successful login
 router.get('/home', function(req, res) {
    //res.redirect('/chatData');
     res.send('<!DOCTYPE html><html><head><meta charset="utf-8"><title>Socket App</title><script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.2.0/socket.io.dev.js"></script><link href="/styles.css" rel="stylesheet" /></head><body onload="pageOnloadFunction()"><div id="chat"><h2>Chat Room</h2><div id="chat-window"><div id="output"></div><div id="feedback"></div></div><form action="postChat" method="POST"><input id="name" name="name" type="text" placeholder="Name"  readonly/><input id="message" name="message" type="text" placeholder="Message" /><button id="send" type="submit">Send</button></form></div></body><script src="/chat.js"></script></html>');
	res.end();
});

//GET api for chat history
router.get('/chatData', function (req, res, next) {
    db.executeSql("select * from (select top(30) * from chatHistory order by chatId desc) as tbl order by chatId", function(data, err) {
      if (err) {
        console.log(err);
        res.end();
      } else {
          console.log(data.recordset);
		  res.send(data.recordset);
      }
      res.end();
    });
  }); 

  //POST api for user login
router.post('/login', function (req, res, next) {
    let userdata = {
        username: req.body.username,
        password: req.body.password
    };
    db.executeSql("select * from users", function(data, err) {
      if (err) {
        console.log(err);
        res.end();
      } else {
          let findMatch=1;
          for(let i=0;i<data.recordset.length;i++){
              console.log('I am in the loop');
            if (data.recordset[i].username===userdata.username && data.recordset[i].password===userdata.password) {
                res.cookie("username", userdata.username);
                console.log('Cookies is set');
                res.redirect('/home');
                return;
        
            } else {
                findMatch=0;
            }
          }
          if(findMatch===0){
            res.status(401).json({
                message: 'Login Failed'
            });
          }

      }
      res.end();
    });
  }); 

  //POST api for saving chat info
router.post('/postChat', function (req, res, next) {
    let username=global.mesdata.name;
    let message=global.mesdata.message;
    console.log(global.mesdata);
    let sql="insert into chatHistory (username,message) VALUES ('"+username+"','"+message+"')";
    db.executeSql(sql, function(data, err) {
      if (err) {
        console.log(err);
        res.end();
      } else {
       console.log('posted successfully');
       res.redirect('/home');
      }
      res.end();
    });
  }); 


// Socket setup & pass server
const io = socket(server);
io.on('connection', (socket) => {
    console.log('Made socket connection on id:', socket.id);

    // Handle chat event
    socket.on('chat', (data) => {
        // console.log(data);
         global.mesdata=data;
        io.sockets.emit('chat', data);
    });

    // Handle typing event
    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });

});
module.exports=app;