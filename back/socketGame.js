var session = require("express-session");
const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
var spawn = require("child_process").spawn;
const app = express();
const server = createServer(app);
const fs = require("fs");
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});


//Definim la sessió i encenem el servidor
const PORT = 3788;
server.listen(PORT, () => {
    console.log('server running at http://localhost:', PORT);
});

var sess = {
    //app.use és el intermediari, middleware
    secret: "paraula secreta",
    resave: false, //Obsolet
    saveUninitialized: true,
    data: {
        motor_ences: false,
    },
};



//Permetem que el servidor pugui rebre peticions de qualsevol origen
app.use(cors());

app.use(express.json());

// Manejar el evento 'login'
io.on('connection', function(socket) {
    console.log("connected with socket.");
    
    socket.on("login", function(userData) {
        console.log("User logged in:", userData);
        // Aquí puedes realizar cualquier lógica que necesites con los datos del usuario
    });

    socket.on("disconnect", function() {
        console.log("Socket disconnected.");
    });
});