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
    fs.readFile(__dirname + "/example08.html",
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

    var timeout = false;
    var last_sent = null;
    var last_value = null;
    
    
board.digitalRead(2, function(value) { // this happens many times on digital input change of state 0->1 or 1->0
    if (timeout !== false) { // if timeout below has been started (on unstable input 0 1 0 1) clear it
	   clearTimeout(timeout); // clears timeout until digital input is not stable i.e. timeout = false
    }
    timeout = setTimeout(function() { // this part of code will be run after 50 ms; if in-between input changes above code clears it
        console.log("Timeout set to false");
        timeout = false;
        if (last_value != last_sent) { // to send only on value change
        	if (value == 0) {
                console.log("LED OFF");
                board.digitalWrite(13, board.LOW);
                console.log("value = 0, LED OFF");
                sendValueViaSocket(0);
            }
            else if (value == 1) {
                console.log("LED ON");
                board.digitalWrite(13, board.HIGH);
                console.log("value = 1, LED lit");
                sendValueViaSocket(1);
            }

        }

        last_sent = last_value;
    }, 50); // execute after 50ms
                
    last_value = value; // this is read from pin 2 many times per s
                
}); // end board.digitalRead on pin 2
    
}); // end of board.on ready