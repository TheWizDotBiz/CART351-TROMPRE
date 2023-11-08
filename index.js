//import the Express library
let express = require('express');
const portNumber =4200;
let app = express(); //make an instance of express
let httpServer = require('http').createServer(app);  // create a server (using the Express framework object)
// declare io which mounts to our httpServer object (runs on top ... )
let io = require('socket.io')(httpServer);
let clientIncrementing =0;

// serving static files
let static = require('node-static'); // for serving static files (i.e. css,js,html...)
// serve anything from this dir ...
app.use(express.static(__dirname + '/final_public'));
// for the client...
app.use(express.static(__dirname + '/node_modules'));

//default route
app.get('/', function(req, res){
    res.send('<h1>Hello world</h1>');
  });
  
  app.get('/client', function(req, res) {
    res.sendFile(__dirname + '/final_public/index.html');
});

//import wizard from './final_public/obj/wizard';
let playerList = []; //store playerInfo

httpServer.listen(portNumber, function(){
    console.log('listening on port:: '+portNumber);
  })

io.on('connect', function(socket){
    console.log("original id: " + socket.id);

    socket.on('join', function(data){
        socket.emit('joinedClientId', {id: socket.id});
    })

    socket.on('playerMoved', function(data){
        socket.emit('updatePlayerFromServer', data);
    })

    socket.on('updateWizardList', function(data){
        console.log("received updateWizardList with data " + data);
        
        for(var i = 0; i < playerList.length; i++){
            console.log(playerList[i].id + " vs " + data);
            if(playerList[i].id == data){
                playerList.splice(i, 1);
                console.log("splice!");
            }
        }
        
            playerList.push(new playerInfo(0,0,0,"#F28C28", data, 0));
            console.log("player count " + playerList.length + " user count " + io.engine.clientsCount);
            io.emit('updateWizardCount', playerList);
            io.emit('updatePlayerFromServer', playerList);
        
        
    })

    socket.on('updatePlayerPosServer', function(x, y, z, id, r){
        console.log("received updatePlayerPosServer");
        for(var i = 0; i < playerList.length; i++){
            if(id == playerList[i].id){
                console.log("updating " + playerList[i].id + " x:" + x + " y:" + y + " z:" + z);
                playerList[i].x = x;
                playerList[i].y = y;
                playerList[i].z = z;
                playerList[i].r = r;
            }
        }
        console.log("playerList contains " + playerList);
        io.emit('updatePlayerFromServer', playerList);
    })

    socket.on('disconnect', function(data){
        console.log("user " + socket.id + " disconnected");
        for(var i = 0; i < playerList.length; i++){
            if(socket.id == playerList[i].id){
                playerList.splice(i, 1);
            };
        }
        console.log("user count is now " + io.engine.clientsCount);
        io.emit("updateWizardCount", playerList);
    })
})



class playerInfo{
    constructor(x, y, z, color, id, r){
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.id = id;
        this.r = r;
    }
}