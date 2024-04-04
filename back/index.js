const express = require("express");
const session = require("express-session");
const http = require("http");
const fs = require("fs");
const path = require("path");
const { ObjectId } = require("mongodb");
const cors = require("cors");
const CryptoJS = require("crypto-js");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const bodyParser = require("body-parser");
const { Client } = require('ssh2');
const port = 3789;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
// Servir archivos estáticos desde la carpeta 'assets'
app.use("/assets", express.static(path.join(__dirname, "assets")));
const routeImg = path.join(__dirname, "assetsForAndroid");
// Ruta donde se encuentran los archivos de audio
const audioFolder = path.join(__dirname, "music");
app.use("/audio", express.static(audioFolder));

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

app.options('*', (req, res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type');
    res.sendStatus(200);
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
  const result = await insertData(
    data.name_character,
    data.description,
    data.picture
  );
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
      console.error("Error al leer el archivo:", error);
      res.status(404).send("El archivo no existe");
      return;
    }

    console.log("El archivo existe:", nameFile, isActive);
  });
});

app.post("/insertMessage", async (req, res) => {
  const data = req.body;
  const result = await insertBroadcast(data.message, data.idCharacter);
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

// Define la ruta para actualizar un mensaje
app.put('/updateMessage/:id', async (req, res) => {
  const id = req.params.id;
  const message = req.body;

  try {
    if (!message) {
      throw new Error('Se requiere un nuevo mensaje.');
    }

    const result = await editMessage(id, message.message); // Editar el mensaje
    io.emit('messageUpdated', { id, message: message.message }); // Emitir un evento a todos los clientes conectados
    res.send({ message: 'Mensaje actualizado correctamente.' });
  } catch (error) {
    console.log(error.message);
    res.status(500).send({ error: error.message });
  }
});

app.get("/audios", (req, res) => {
  // Leer todos los archivos de la carpeta de audios
  fs.readdir(audioFolder, (err, files) => {
    if (err) {
      // Si hay un error, devolver un error 500
      res.status(500).send("Error al leer la carpeta de audios");
      return;
    }

    // Filtrar solo los archivos con extensión .mp3
    const mp3Files = files.filter((file) => path.extname(file) === ".mp3");

    // Construir la lista de URLs completas para cada archivo
    const audioUrls = mp3Files.map(
      (fileName) => `http://localhost:3789/audio/${fileName}`
    );

    // Devolver la lista de URLs de archivos de audio
    res.json(audioUrls);
  });
});

app.post("/returnAudio", (req, res) => {
  const { audioUrl } = req.body;
  console.log(audioUrl);
});

// ------------------------------ Odoo ----------------------------------------------------------------
async function DetenerOdoo() {
  const con = new Client();
  const sshConfig = {
    host: "141.147.16.21",
    port: 22,
    username: "ubuntu",
    privateKey: require("fs").readFileSync("ssh-key-2024-03-18.key"),
  };

  con
    .on("ready", function () {
      console.log("Conexión establecida. Ejecutando comando...");
      // Detener primero el contenedor de la base de datos
      con.exec("sudo docker stop db", function (err, stream) {
        if (err) throw err;
        stream
          .on("close", function (code, signal) {
            console.log("Comando sudo docker stop db ejecutado.");
            // Luego detener el contenedor de Odoo
            con.exec("sudo docker stop odoo", function (err, stream) {
              if (err) throw err;
              stream
                .on("close", function (code, signal) {
                  console.log("Comando sudo docker stop odoo ejecutado.");
                  con.end();
                })
                .on("data", function (data) {
                  console.log("STDOUT: " + data);
                })
                .stderr.on("data", function (data) {
                  console.log("STDERR: " + data);
                });
            });
          })
          .on("data", function (data) {
            console.log("STDOUT: " + data);
          })
          .stderr.on("data", function (data) {
            console.log("STDERR: " + data);
          });
      });
    })
    .connect(sshConfig);

  con.on("error", function (err) {
    console.error("Error de conexión:", err);
  });
}

async function ArrancarOdoo() {
  const con = new Client();
  const sshConfig = {
    host: "141.147.16.21",
    port: 22,
    username: "ubuntu",
    privateKey: require("fs").readFileSync("ssh-key-2024-03-18.key"),
  };

  con
    .on("ready", function () {
      console.log("Conexión establecida. Ejecutando comando...");
      // Detener primero el contenedor de la base de datos
      con.exec("sudo docker start db", function (err, stream) {
        if (err) throw err;
        stream
          .on("close", function (code, signal) {
            console.log("Comando sudo docker start db ejecutado.");
            // Luego detener el contenedor de Odoo
            con.exec("sudo docker start odoo", function (err, stream) {
              if (err) throw err;
              stream
                .on("close", function (code, signal) {
                  console.log("Comando sudo docker start odoo ejecutado.");
                  con.end();
                })
                .on("data", function (data) {
                  console.log("STDOUT: " + data);
                })
                .stderr.on("data", function (data) {
                  console.log("STDERR: " + data);
                });
            });
          })
          .on("data", function (data) {
            console.log("STDOUT: " + data);
          })
          .stderr.on("data", function (data) {
            console.log("STDERR: " + data);
          });
      });
    })
    .connect(sshConfig);

  con.on("error", function (err) {
    console.error("Error de conexión:", err);
  });
}

function checkOdoo() {
  return new Promise((resolve, reject) => {
    const con = new Client();
    const sshConfig = {
      host: "141.147.16.21",
      port: 22,
      username: "ubuntu",
      privateKey: require("fs").readFileSync("ssh-key-2024-03-18.key"),
    };

    con
      .on("ready", function () {
        console.log("Conexión SSH establecida. Ejecutando comando...");
        con.exec(
          "sudo docker inspect --format='{{.State.Status}}' odoo",
          function (err, stream) {
            if (err) {
              reject(err);
              return;
            }
            stream
              .on("close", function (code, signal) {
                console.log("Comando docker inspect ejecutado.");
                con.end();
              })
              .on("data", function (data) {
                const estadoOdoo = data.toString().trim(); // Convertir los datos a cadena y eliminar espacios en blanco
                resolve(estadoOdoo); // Resolver la promesa con el estado obtenido
              })
              .stderr.on("data", function (data) {
                console.error(
                  "Error al ejecutar docker inspect:",
                  data.toString()
                );
                reject(data.toString()); // Rechazar la promesa si hay un error
              });
          }
        );
      })
      .connect(sshConfig);

    con.on("error", function (err) {
      console.error("Error de conexión SSH:", err);
      reject(err); // Rechazar la promesa en caso de error de conexión
    });
  });
}

app.post("/procesOdoo", async (req, res) => {
  try {
    const isActive = req.body.isActive;
    console.log("::::::::::"+isActive);
    if (isActive) {
      const start = await ArrancarOdoo();
      res.send("Odoo y db arrancadas correctamente.");

    } else if(!isActive) {
      const stop = await DetenerOdoo();
      console.log(stop);
      res.send("Odoo y db detenidas correctamente.");
    }
  } catch (error) {
    console.error("Error al arrancar Odoo:", error);
    res.status(500).send("Error al arrancar Odoo.");
  }
});

app.post("/checkOdoo", async (req, res) => {
  try {
    const estadoOdoo = await checkOdoo(); // Esperar a que la función checkOdoo() se complete
    const isRunning = estadoOdoo === "running"; // Devuelve true si el estado es 'running', false en caso contrario
    console.log(isRunning);
    res.send(isRunning);
  } catch (error) {
    console.error("Error al comprobar el estado de Odoo:", error);
    res.status(500).send("Error al comprobar el estado de Odoo.");
  }
});

app.post("/odooConnection", async (req, res) => {
  const xmlrpc = require("xmlrpc");

  const db = "GameDataBase";
  const user = "a22jonorevel@inspedralbes.cat";
  const password = "Dam2023+++";

  // Crear un cliente XML-RPC común para todas las llamadas
  const clientOptions = {
    host: "141.147.16.21",
    port: 8089,
    path: "/xmlrpc/2/common",
  };
  const client = xmlrpc.createClient(clientOptions);

  client.methodCall("authenticate", [db, user, password, {}], (error, uid) => {
    if (error) {
      console.error("Error en la autenticación:", error);
      res.status(500).send("Error en la autenticación");
    } else {
      if (uid > 0) {
        const objectClientOptions = {
          host: "141.147.16.21",
          port: 8089,
          path: "/xmlrpc/2/object",
        };
        const objectClient = xmlrpc.createClient(objectClientOptions);

        const productData = {
          name: "Nuevo producto nodejs",
          list_price: 100.0,
        };

        objectClient.methodCall(
          "execute_kw",
          [db, uid, password, "product.product", "create", [productData]],
          (error, productId) => {
            if (error) {
              console.error("Error al crear el producto:", error);
              res.status(500).send("Error al crear el producto");
            } else {
              console.log("ID del nuevo producto:", productId);
              res.status(200).send("Producto creado exitosamente");
            }
          }
        );
      } else {
        console.log("Autenticación fallida.");
        res.status(401).send("Autenticación fallida");
      }
    }
  });
});

// SOCKETS

var usersConnected = [];

io.on("connection", async (socket) => {
  socket.on("login", async () => {
    console.log("DENTRO DE LOGIN PAGE::    ");
    usersConnected.push({ socketId: socket, userId: id });
    usersConnected.forEach((u) => {
      console.log("USER ID:: ", u.userId);
      console.log("USER SOCKET:: ", u.socketId.id);
    });
  });

  socket.on("actualizarObjeto", () => {});

  socket.on("disconnect", () => {
    usersConnected.forEach((u) => {
      if (u.socketId == socket) {
        usersConnected.pop(u);
      }
      console.log("USER ID:: ", u.userId);
      console.log("USER SOCKET:: ", u.socketId.id);
    });
  });

  socket.on("initGame", (msg) => {
    io.emit("initGame", msg);
  });


});

server.listen(port, () => {
  console.log(`Server running on http//:localhost:${port}`);
});

function doCryptMD5Hash(password) {
  var hash = CryptoJS.MD5(password);
  return hash.toString();
}
