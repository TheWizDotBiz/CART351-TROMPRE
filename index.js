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
const { measureMemory } = require('vm');
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

app.get('/death', function(req, res){
    res.sendFile(__dirname + '/final_public/death.html');
})

//import wizard from './final_public/obj/wizard';
let playerList = []; //store playerInfo
//let colorList = ["red", "blue", "green", "yellow", "white", "purple", "orange"]; //store color names;
let colorCount = 6;
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
            let rand = Math.floor(Math.random() * colorCount); //generates a random colorID;
            playerList.push(new playerInfo(0,0,0,rand, data, 0));
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

    socket.on('sendMessage', function(thisID, message, colorID){
        if(checkIfSpell(message, colorID, thisID)){
            io.emit('receiveMessageFromServer', thisID, message, true);
        }else{
            io.emit('receiveMessageFromServer', thisID, message, false);
        }
           
    })

    socket.on('removeMessage', function(thisID){
        console.log("removing message from player " + thisID);
        io.emit('deleteMessageFromServer', thisID);
    })

    socket.on('killPlayer', function(playerID){
        io.emit('Suicide', playerID);
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

//COLOR NAMES ["red", "blue", "green", "yellow", "white", "purple", "orange"]; //store color names;
// ISHU, MORA, TIMYAER, YELLER, SUUTNOLK, NULN, RAGGAH
let colorNames = ['ishu', 'mora', 'timyaer', 'yeller', 'suutnolk', 'nuln', 'raggah'];
//TELEPORT TO RANDOM ROOM, CHANGE TO RANDOM COLOR, LEVITATE, SUICIDE, KILL ALL AROUND, SUPER SPEED
let spellNames = ['tsur-nayek', 'nihilith kha', 'oesurnavigg', 'rush hour 3', 'addarasarmarvartuliik', 'sigivael-faroth', 'htoraf-leavigis', "gnorolgur'mok", 'nath-shu'];
function checkIfSpell(message, colorID, playerID){
    var returnIfSpell = false;
    var msgTracker = "";
    var prefix = colorNames[colorID];
    var prefixCorrect = false;
    for(var i  = 0; i < message.length; i++){
        msgTracker = msgTracker + message[i];
        if(!prefixCorrect){
            var msgtemp = msgTracker.toUpperCase();
            console.log("prefix is " + prefix);
            var prefixtemp = prefix.toUpperCase();
            if(msgtemp == prefixtemp + " "){ //toUpperCase() is to prevent case sensitive comparision, this checks for correct color prefix
                console.log("prefix  is correct");
                msgTracker = "";
                prefixCorrect = true;
            }
        }else{ //check for suffix
            //console.log("msgtracks is " + msgTracker.toUpperCase() + " spell one is " + spellNames[0].toUpperCase());
            switch(msgTracker.toUpperCase()){
                case spellNames[0].toUpperCase()://teleport to random room
                    returnIfSpell = true;
                    i = message.length;
                    //we need actual geometry to be able to code this lol
                break;
                case spellNames[1].toUpperCase()://Change to random color
                    returnIfSpell = true;
                    i = message.length;
                  //  io.emit('ChangeColors', playerID); //this spell is deprecated
                break;
                case spellNames[2].toUpperCase()://Levitate
                    returnIfSpell = true;
                    i = message.length;
                    io.emit('Levitate', playerID);
                break;
                case spellNames[3].toUpperCase():
                    returnIfSpell = true;
                    i = message.length;
                    io.emit('Suicide', playerID);
                break;
                case spellNames[4].toUpperCase():
                    returnIfSpell = true;
                    i = message.length;
                    io.emit('DeathSpell', playerID);
                break;
                //selective death spells begin
                    case spellNames[8].toUpperCase() + " " + colorNames[0].toUpperCase():
                        returnIfSpell = true;
                        i = message.length;
                        io.emit('SelectiveDeathSpell', playerID, 0);
                    break;
                    case spellNames[8].toUpperCase() + " " + colorNames[1].toUpperCase():
                        returnIfSpell = true;
                        i = message.length;
                        io.emit('SelectiveDeathSpell', playerID, 1);
                    break;
                    case spellNames[8].toUpperCase() + " " + colorNames[2].toUpperCase():
                        returnIfSpell = true;
                        i = message.length;
                        io.emit('SelectiveDeathSpell', playerID, 2);
                    break;
                    case spellNames[8].toUpperCase() + " " + colorNames[3].toUpperCase():
                        returnIfSpell = true;
                        i = message.length;
                        io.emit('SelectiveDeathSpell', playerID, 3);
                    break;
                    case spellNames[8].toUpperCase() + " " + colorNames[4].toUpperCase():
                        returnIfSpell = true;
                        i = message.length;
                        io.emit('SelectiveDeathSpell', playerID, 4);
                    break;
                    case spellNames[8].toUpperCase() + " " + colorNames[5].toUpperCase():
                        returnIfSpell = true;
                        i = message.length;
                        io.emit('SelectiveDeathSpell', playerID, 5);
                    break;
                    case spellNames[8].toUpperCase() + " " + colorNames[6].toUpperCase():
                        returnIfSpell = true;
                        i = message.length;
                        io.emit('SelectiveDeathSpell', playerID, 6);
                    break;
                //selective death spells end
                case spellNames[5].toUpperCase():
                    returnIfSpell = true;
                    i = message.length;
                    io.emit('Haste', playerID);
                break;
                case spellNames[6].toUpperCase():
                    returnIfSpell = true;
                    i = message.length;
                    io.emit('Slow', playerID);
                break;
                case spellNames[7].toUpperCase():
                    returnIfSpell = true;
                    i = message.length;
                    io.emit('Phasing', playerID);
                break;
            }
        }
        
    }
    console.log(message + " spell status is " + returnIfSpell);
    return returnIfSpell;
}

class playerInfo{
    constructor(x, y, z, color, id, r){
        this.x = x;
        this.y = y;
        this.z = z;
        this.color = color;
        this.id = id;
        this.r = r;
        this.message = "";
    }
}