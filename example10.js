var http = require("http").createServer(handler); // on req - hand
var io = require("socket.io").listen(http); // socket library
var fs = require("fs"); // variable for file system for providing html
var firmata = require("firmata");

console.log("Starting the code");

var board = new firmata.Board("/dev/ttyACM0", function(){
    console.log("Connecting to Arduino");
    console.log("Enabling analog pin 0");
    board.pinMode(0, board.MODES.ANALOG); // declare analog pin 0
});

function handler(req, res) {
    fs.readFile(__dirname + "/example10.html",
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

var desiredValue = 0;

board.on("ready", function() {
    
    board.analogRead(0, function(value){
        desiredValue = value; // continuous read of pin A0
    });

    
    io.sockets.on("connection", function(socket) {
        console.log("Socket id: " + socket.id);
        socket.emit("messageToClient", "Srv connected, board OK");
        setInterval(sendValues, 40, socket); // each 40ms send val
    }); // end of sockets.on connection

}); // end of board.on ready

function sendValues (socket) {
    socket.emit("clientReadValues",
    {
    "desiredValue": desiredValue
    });
};