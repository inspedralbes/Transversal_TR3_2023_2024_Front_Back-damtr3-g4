const express = require("express");
const session = require("express-session");
const http = require("http");
const fs = require("fs");
const path = require('path');
const { ObjectId } = require('mongodb');
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { Server } = require('socket.io');
const app = express();
const server = http.createServer(app);
const bodyParser = require('body-parser');
const port = 3789;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
// Servir archivos estáticos desde la carpeta 'assets'
app.use('/assets', express.static(path.join(__dirname, 'assets')));
const routeImg = path.join(__dirname, 'assetsForAndroid');
// Ruta donde se encuentran los archivos de audio
const audioFolder = path.join(__dirname, 'music');
app.use('/audio', express.static(audioFolder));
const corsOptions = {
    origin: 'http://localhost:3000', // URL del cliente
    methods: 'GET,POST', // Métodos permitidos
    optionsSuccessStatus: 200 // Algunos navegadores pueden regresar un código de estado 204
};
app.use(cors(corsOptions));
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
} = require("./dbFunctions");

const {
    insertData,
    getData,
    insertBroadcast,
    getBroadcast,
    editMessage,
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
            mail: infoUser[0].correo,
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
    const { user, idGame } = req.body;

    const newGame = {
        user,
        idGame,
    };

});
// MONGO 
app.post("/insertCharacter", async (req, res) => {
    const data = req.body;
    const result = await insertData(data.name_character, data.description, data.picture)
    res.send({ response: "User inserted correctly" });
});

app.get("/getData", async (req, res) => {
    try {
        const data = await getData();
        res.send(data);
    } catch (err) {
        console.log(err.menssage);
    }

});

app.post("/selectCharacter/:id", async (req, res) => {
    const id = req.params.id;
    const isActive = req.body.isActive;
    console.log("ID::::" + id);
    const nameFile = id + ".png";
    const routeFile = path.join(routeImg, nameFile);
    fs.readFile(routeFile, (error, datos) => {
        if (error) {
            console.error('Error al leer el archivo:', error);
            res.status(404).send('El archivo no existe');
            return;
        }

        console.log('El archivo existe:', nameFile, isActive);
    });

})

app.post("/insertMessage", async (req, res) => {
    const data = req.body;
    const result = await insertBroadcast(data.message, data.idCharacter)
    console.log(data);
    res.send({ response: "User inserted correctly" });

});

app.get("/getBroadcast", async (req, res) => {
    try {
        const data = await getBroadcast();
        res.send(data);
    } catch (err) {
        console.log(err.menssage);
    }

});

app.put("/updateMessage/:id", async (req, res) => {
    const id = req.params.id;
    const objectId = new ObjectId(id);
    const { message } = req.body;

    try {
        if (!message) {
            throw new Error("Se requiere un nuevo mensaje.");
        }

        const result = await editMessage(objectId, message);
        res.send({ message: "Mensaje actualizado correctamente." });
    } catch (error) {
        console.log(error.message);
        res.status(500).send({ error: error.message });
    }
});

app.get('/audios', (req, res) => {
    // Leer todos los archivos de la carpeta de audios
    fs.readdir(audioFolder, (err, files) => {
        if (err) {
            // Si hay un error, devolver un error 500
            res.status(500).send('Error al leer la carpeta de audios');
            return;
        }

        // Filtrar solo los archivos con extensión .mp3
        const mp3Files = files.filter(file => path.extname(file) === '.mp3');

        // Construir la lista de URLs completas para cada archivo
        const audioUrls = mp3Files.map(fileName => `http://localhost:3789/audio/${fileName}`);

        // Devolver la lista de URLs de archivos de audio
        res.json(audioUrls);
    });
});

app.post('/returnAudio', (req,res) => {
    const audioSelected = req.body;
    console.log(audioSelected);
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