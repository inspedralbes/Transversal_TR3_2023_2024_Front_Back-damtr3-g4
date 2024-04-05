const express = require("express");
const session = require("express-session");

const http = require("http");
const fs = require("fs");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const port = 3789;

app.use(express.json());
app.use(cors());

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './images_skins');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });


app.post("/registerSkin", upload.single('imagen'), async (req, res) => {
    const { nombre, precio, descripcion, imagen } = req.body;
    try {
        const skindId = await insertSkin(nombre, precio, descripcion, imagen);
        const newSkin = {
            id: skindId.insertId,
            nombre: nombre,
            precio: precio,
            descripcion: descripcion,
            imagen: imagen
        };
        io.emit('registerSkin', { response: 'Skin dada de alta', skin: newSkin });
        res.send({ response: 'Skin dada de alta', skin: newSkin });
    } catch (error) {
        res.status(500).send({ error: "Error al dar de alta la Skin" });
    }
});

const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

const {
    selectUserByMailPass,
    insertUser,
    selectUsers,
    insertGame,
    insertSkin,
    selectPlayersInGame,
    getIdGame,
    updateUserGameId
} = require("./dbFunctions");

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
    user.password = doCryptMD5Hash(req.body.password);
    await insertUser(user.name, user.password, user.mail);
    res.send({ response: "User inserted correctly", userData: user });
});

app.post("/joinGame", async (req, res) => {
    const dataGameJoin = req.body;
    console.log(dataGameJoin);
    const idGame = await updateUserGameId(dataGameJoin.passwordGame, dataGameJoin.idUser);
    console.log(idGame);
    res.send({ idGame: idGame[0].id })
});

app.post("/initGame", async (req, res) => {
    const dataGame = req.body;
    const idGame = await insertGame(dataGame.numPlayers, dataGame.state, dataGame.password);
    console.log(idGame);
    res.send({ idGame: idGame[0].id, passwordGame: dataGame.password })
});



// -------------------------------------------------------- SOCKETS ----------------------------------------

var usersConnected = [];

io.on('connection', function (socket) {
    console.log("SOCKET::::: ");
    socket.on("login", async (user) => {
        let userParseado = JSON.parse(user);
        usersConnected.push({ socketId: socket, userId: userParseado.id, userName: userParseado.name })
        console.log("User connected id: " + userParseado.id);
        console.log("Users: " + usersConnected.length);
    });


    socket.on("getUsersInGame", async (dataGame) => {
        const dataParseado = JSON.parse(dataGame);
        console.log("GET USER IN GAME ID: ", dataParseado.idGame);
        const usersInGame = await selectPlayersInGame(dataParseado.idGame, dataParseado.state);
        var usuariosEmit = [];
        usersConnected.forEach(u => {
            usersInGame.forEach(uBD => {
                if (uBD.id == u.userId) {
                    usuariosEmit.push(u);
                }
            });
        });
        usuariosEmit.forEach(u => {
            u.socketId.emit('usersInGame', usersInGame);
        });
    });

    socket.on("sendMovementUser", async (users) => {
        console.log("SEND MOVEMENT USER IN GAME");
        const userParseado = JSON.parse(users);
        const userDataToSend = userParseado[userParseado.length-1];
        console.log(userDataToSend);
        var usuariosEmit = [];
        usersConnected.forEach(u => {
            userParseado.forEach(uBD => {
                if (uBD.id == u.userId) {
                    usuariosEmit.push(u);
                }
            });
        });
        console.log("---------------------------USERS PARA ENVIAR EMIT-----------------------");
        usuariosEmit.forEach(element => {
            console.log(element.userName);
            console.log(element.userId);
        });
        usuariosEmit.forEach(u => {
            u.socketId.emit('getMovementUser', userDataToSend);
        });

    });

    socket.on("sendStartGame", async(verifyUsers)=>{
        console.log("------------------ SEND START GAME ------------------");
        console.log(verifyUsers);
        var usuariosEmit = [];
        usersConnected.forEach(u => {
            verifyUsers.forEach(uBD => {
                if (uBD.id == u.userId) {
                    usuariosEmit.push(u);
                }
            });
        });

        usuariosEmit.forEach(u => {
            u.socketId.emit('getStartGame', verifyUsers);
        });
        
    });

    socket.on("disconnect", () => {
        usersConnected.forEach(u => {
            if (u.socketId == socket) {
                console.log("User disconnected id: " + u.userId);
                usersConnected.pop(u)
            }
        });

        console.log("Users: " + usersConnected.length);
    });

});


server.listen(port, () => {
    console.log(`Server running on http//:localhost:${port}`);
});

function doCryptMD5Hash(password) {
    var hash = CryptoJS.MD5(password);
    return hash.toString();
}