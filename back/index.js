const express = require("express");
const session = require("express-session");
const http = require("http");
const fs = require("fs");
const path = require('path');
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const port = 3789;

app.use(express.json());
app.use(cors());
// Servir archivos estáticos desde la carpeta 'assets'
app.use('/assets', express.static(path.join(__dirname, 'assets')));

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const {
    selectUserByMailPass,
    insertUser,
    selectUsers
} = require("./dbFunctions");

const { 
    insertData,
    getData,
 } = require("./mongoFuntions");

app.get("/allUsers", async (req, res) => {
    res.send(await selectUsers());
});

app.post("/authoritzationLogin", async (req, res) => {
    console.log("POST :::: authoritzationLogin");
    var autho = true;
    try {
        const user = req.body;
        user.password = doCryptMD5Hash(req.body.password);
        const infoUser = await selectUserByMailPass(user.mail, user.password);
        res.send({
            authorization: autho,
            name: infoUser[0].usuario,
            id: infoUser[0].id,
        });
    } catch {
        autho = false;
        res.send({ authorization: autho });
    }

});

app.post("/insertUser", async (req, res) => {
    const user = req.body;
    console.log(req.body);
    const infoUser = await selectUsers();
    console.log(infoUser);
    const isUser = infoUser.find((u) => u.correo === user.mail || u.usuario === user.name);
    if (isUser) {
        res.send({ response: "Existing user" });
    } else {
        user.password = doCryptMD5Hash(req.body.password);
        await insertUser(user.name, user.password, user.mail);
        res.send({ response: "User inserted correctly", userData: user });
    }

});

app.post("/initGame", async (req, res) => {
    const { user, idGame } = req.body;

    const newGame = {
        user,
        idGame,
    };

});
// MONGO 
app.post("/insertCharacter", async (req, res) => {
    const data = req.body;
    const result = await insertData(data.name, data.description, data.picture)
    res.send({ response: "User inserted correctly" });
});

app.get("/getData", async (req, res) =>{
    try{
        const data = await getData();
        res.send(data);
    } catch(err){
        console.log(err.menssage);
    } 

});

app.post("/selectCharacter:id", async (res, req) =>{
    const id = req.params.id;
    

})


// SOCKETS

var usersConnected = [];

io.on("connection", async (socket) => {
    socket.on("login", async () => {
        console.log("DENTRO DE LOGIN PAGE::    ");
        usersConnected.push({ socketId: socket, userId: id })
        usersConnected.forEach(u => {
            console.log("USER ID:: ", u.userId);
            console.log("USER SOCKET:: ", u.socketId.id);
        });
    });

    socket.on("actualizarObjeto", () => {

    });

    socket.on("disconnect", () => {
        usersConnected.forEach(u => {
            if (u.socketId == socket) {
                usersConnected.pop(u)
            }
            console.log("USER ID:: ", u.userId);
            console.log("USER SOCKET:: ", u.socketId.id);
        });
    });

    socket.on("initGame", (msg) => {
        io.emit('initGame', msg);
    });
});


server.listen(port, () => {
    console.log(`Server running on http//:localhost:${port}`);
});

function doCryptMD5Hash(password) {
    var hash = CryptoJS.MD5(password);
    return hash.toString();
}