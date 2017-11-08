var http = require("http").createServer(handler); // on req - hand
var io = require("socket.io").listen(http); // socket library
var fs = require("fs"); // variable for file system for providing html
var firmata = require("firmata");

console.log("Starting the code");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Connecting to Arduino");
    console.log("Activation of Pin 13");
    board.pinMode(13, board.MODES.OUTPUT); // pin13 as out
    console.log("Enabling pin 2 for button");
    board.pinMode(2, board.MODES.INPUT);
});

function handler(req, res) {
    fs.readFile(__dirname + "/example07.html",
    function (err, data) {
        if (err) {
            res.writeHead(500, {"Content-Type": "text/plain"});
            return res.end("Error loading html page.");
        }
    res.writeHead(200);
    res.end(data);
    })
}

http.listen(8080); // server will listen on port 8080

var sendValueViaSocket = function(){};

board.on("ready", function() {
    io.sockets.on("connection", function(socket) {
    console.log("Socket id: " + socket.id);
    socket.emit("messageToClient", "Srv connected, board OK");
    
    sendValueViaSocket = function(value) {
        io.sockets.emit("messageToClient", value);
    }
    
    }); // end of sockets.on connection

    board.digitalRead(2, function(value) {
        if (value == 0) {
            console.log("LED off");
            board.digitalWrite(13, board.LOW);
            sendValueViaSocket(0);
        }
        if (value == 1) {
            console.log("LED on");
            board.digitalWrite(13, board.HIGH);
            sendValueViaSocket(1);
        }
    
            
    }); // end of board digital read
    
}); // end of board.on ready