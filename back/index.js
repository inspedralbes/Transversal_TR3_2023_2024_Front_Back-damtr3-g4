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
    destination: function (req, file, cb){
        cb(null, './images_skins');
    },
    filename: function (req, file, cb){
        cb(null, file.originalname);
    },
});

const upload = multer({storage: storage});


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
        res.send({response: 'Skin dada de alta', skin: newSkin });
    } catch (error){
        res.status(500).send({ error: "Error al dar de alta la Skin"});
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
} = require("./dbFunctions");

app.get("/allUsers", async(req,res)=>{
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

app.post("/initGame", async (req, res) => {
    const {user, opponentId} = req.body;
    try {
        let gameId;
        if (opponentId) {
            gameId = await insertGame(user.id, opponentId, "En curso");
            const newGame = {
                userId: user.id,
                userName: user.usuario, //Para saber el nombre del jugador que crea la partida
                idGame: gameId.insertId,
                opponentId,
            };
            io.emit('initGame', { response: 'Partida multijugador iniciada', game: newGame });
            res.send({ response: 'Partida multijugador iniciada', game: newGame });
        } else {
            gameId = await insertGame(user.id, null, "En curso");
            const newGame = {
                userId: user.id,
                userName: user.usuario,
                idGame: gameId.insertId,
            };
            io.emit('initGame', { response: 'Partida para un solo jugador iniciada', game: newGame });
            res.send({ response: 'Partida para un solo jugador iniciada', game: newGame });
        }
    } catch (error) {
        console.error("Error al iniciar la partida:", error);
        res.status(500).send({ error: "Error al iniciar la partida" });
    }
});



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

    socket.on("actualizarObjeto", ()=>{
        
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