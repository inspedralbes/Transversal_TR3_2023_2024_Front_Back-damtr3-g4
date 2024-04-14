const express = require("express");
const session = require("express-session");

const http = require("http");
const xmlrpc = require("xmlrpc");
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
const musicMenuURL = "tr3.dam.inspedralbes.cat:3789/music/menu.mp3";
const musicGameURL = "tr3.dam.inspedralbes.cat:3789/music/battle.mp3";

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
// Servir archivos estáticos desde la carpeta 'assets'
app.use("/assets", express.static(path.join(__dirname, "assets")));
const routeImg = path.join(__dirname, "assetsForAndroid");
app.use("/assetsForAndroid", express.static(routeImg));

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
  insertGame,
  insertSkin,
  selectPlayersInGame,
  getIdGame,
  updateUserGameId,
  selectUserDataById,
  updateUserSkin
} = require("./dbFunctions");

const {
  insertData,
  getData,
  insertBroadcast,
  getBroadcast,
  editMessage,
  insertUserCharacter,
  updateUserCharacter,
  getSkinsByIdUser,
  getDataSkinByIdSkin,
  getInfo
} = require("./mongoFuntions");

const {
  getOdooClients,
  createSaleOrderInOdoo,
  getProductInfo,
  insertUserToOdoo,
} = require("./odooFunction");

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

app.post("/getUser", async (req, res) => {
  const data = req.body;
  console.log(data);
  const result = await selectUserDataById(data.id);
  console.log(result);
  res.send(result[0]);
})

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

app.post("/updateUserSkin", async(req, res)=>{
  console.log(req.body);
  const dataSkin = req.body;
  const result = await updateUserSkin(dataSkin.id, dataSkin.sprite);
  res.send(result);
});

// MONGO

app.get('/obtener-datos', async (req, res) => {
  try {
    // Llama a la función getInfo para obtener los datos de la base de datos
    const data = await getInfo();
    // Envía los datos como respuesta al cliente
    res.json(data);
  } catch (err) {
    console.log(err.message);
    res.status(500).send('Error al obtener los datos de la base de datos.');
  }
});

app.post("/inserUserCharacter", async (req, res) => {
  const data = req.body;
  await insertUserCharacter(data.idUser);
  res.send({ result: "Do correct insert" })
});

app.post("/updateUserCharacter", async (req, res) => {
  const data = req.body;
  const result = await updateUserCharacter(data.idUser, data.idSkin);
  res.send({ result: result })
})

app.post("/getSkinsByUser", async (req, res) => {
  const data = req.body;
  console.log(data);
  const skins = await getSkinsByIdUser(data.id);
  console.log(skins);
  const skinsData = [];
  for (const idSkin of skins[0].idSkins) {
    let skinData = await getDataSkinByIdSkin(idSkin);
    skinsData.push(skinData[0]);
  }
  res.send(skinsData)
});

app.post("/getSkinById", async (req, res) => {
  const data = req.body;
  const result = await getDataSkinByIdSkin(data.idSkin);
  res.send({ result: result });
});

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

// Con esta funcion manda todos los sprites para android
app.get("/getAllCharacters", async (req, res) => {

  try {
    // Leer el contenido del directorio
    const files = await fs.promises.readdir(routeImg);

    // Filtrar solo los archivos de imagen (asumiendo que solo quieres archivos con extensiones jpg, png y gif)
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif';
    });

    // Enviar la lista de archivos de imagen como respuesta
    res.json({ imageFiles });
  } catch (error) {
    // Manejar errores
    console.error('Error al leer el directorio:', error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los archivos.' });
  }
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
  console.log("caca");
  const id = req.params.id;
  const message = req.body;
  console.log(id);
  console.log(message);
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
      (fileName) => `http://tr3.dam.inspedralbes.cat:3789/audio/${fileName}`
    );

    // Devolver la lista de URLs de archivos de audio
    res.json(audioUrls);
  });
});

app.post("/returnAudioMenu", (req, res) => {
  const { audioUrl } = req.body;
  musicMenuURL = audioUrl;
  res.send({ result: "SUCCESFUL" })
});

app.post("/returnAudioGame", (req, res) => {
  const { audioUrl } = req.body;
  musicGameURL = audioUrl;
  res.send({ result: "SUCCESFUL" })
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
    console.log("::::::::::" + isActive);
    if (isActive) {
      const start = await ArrancarOdoo();
      res.send("Odoo y db arrancadas correctamente.");
    } else if (!isActive) {
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

app.post("/InsertProductInOdoo", async (req, res) => {
  const xmlrpc = require("xmlrpc");

  const db = "GameDataBase";
  const user = "a22jonorevel@inspedralbes.cat";
  const password = "Dam2023+++";

  // Crear un cliente XML-RPC común para todas las llamadas
  const clientOptions = {
    host: "141.147.16.21",
    port: 8069,
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
          port: 8069,
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

app.post("/ConnectionOdoo", async (req, res) => {
  const db = "GameDataBase";
  const user = "a22jonorevel@inspedralbes.cat";
  const password = "Dam2023+++";

  // Crear un cliente XML-RPC común para todas las llamadas
  const clientOptions = {
    host: "141.147.16.21",
    port: 8069,
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
          port: 8069,
          path: "/xmlrpc/2/object",
        };
        const objectClient = xmlrpc.createClient(objectClientOptions);

        objectClient.methodCall(
          "execute_kw",
          [
            db,
            uid,
            password,
            "product.product",
            "search_read",
            [[]],
            { fields: ["name", "list_price"] },
          ],
          (error, products) => {
            if (error) {
              console.error("Error al obtener la lista de productos:", error);
              res.status(500).send("Error al obtener la lista de productos");
            } else {
              console.log("Lista de productos:");
              products.forEach((product) => {
                console.log(
                  `Nombre: ${product.name}, Precio: ${product.list_price}`
                );
              });
              res.status(200).send("Lista de productos obtenida correctamente");
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

app.post("/migrateFromMongoToOdoo", async (req, res) => {
  try {
    const odooCredentials = {
      db: "GameDataBase",
      user: "a22jonorevel@inspedralbes.cat",
      password: "Dam2023+++",
    };

    //Obtener los datos de MongoDB
    const mongoData = await getData();

    //Procesar los datos y realizar la inserción en Odoo
    for (const data of mongoData) {
      const { name_character, description, price } = data;

      const imageName = `${name_character}.png`;
      const imagePath = path.join(__dirname, "assets", imageName);

      // Leer la imagen como cadena de bytes codificada en base64
      const imageData = fs.readFileSync(imagePath);
      const imageBase64 = imageData.toString("base64");

      const productData = {
        name: name_character,
        description: description,
        list_price: price,
        image_1920: imageBase64,
      };

      // Crear un cliente XML-RPC para Odoo
      const clientOptions = {
        host: "141.147.16.21",
        port: 8069,
        path: "/xmlrpc/2/common",
      };
      const client = xmlrpc.createClient(clientOptions);

      // Autenticar en Odoo
      client.methodCall(
        "authenticate",
        [
          odooCredentials.db,
          odooCredentials.user,
          odooCredentials.password,
          {},
        ],
        (error, uid) => {
          if (error) {
            console.error("Error en la autenticación:", error);
            res.status(500).send("Error en la autenticación");
          } else {
            if (uid > 0) {
              const objectClientOptions = {
                host: "141.147.16.21",
                port: 8069,
                path: "/xmlrpc/2/object",
              };
              const objectClient = xmlrpc.createClient(objectClientOptions);

              // Insertar el producto en Odoo
              objectClient.methodCall(
                "execute_kw",
                [
                  odooCredentials.db,
                  uid,
                  odooCredentials.password,
                  "product.product",
                  "create",
                  [productData],
                ],
                (error, productId) => {
                  if (error) {
                    console.error("Error al crear el producto:", error);
                    // Tratar errores de inserción en Odoo
                  } else {
                    console.log("ID del nuevo producto:", productId);
                    // Manejar inserción exitosa en Odoo
                  }
                }
              );
            } else {
              console.log("Autenticación fallida.");
              res.status(401).send("Autenticación fallida");
            }
          }
        }
      );
    }

    //Enviar respuesta de éxito
    res.status(200).send("Migración exitosa de MongoDB a Odoo.");
  } catch (error) {
    console.error("Error en la migración:", error);
    res.status(500).send("Error en la migración de MongoDB a Odoo.");
  }
});

app.post("/migrateUsersToOdoo", async (req, res) => {
  try {
    // Obtener los usuarios de MySQL
    const usersFromSql = await selectUsers();

    // Mapear los campos de MySQL al modelo de datos de clientes de Odoo
    const odooClients = usersFromSql.map((user) => {
      return {
        name: user.name, // Nombre del cliente en Odoo
        email: user.mail, // Correo electrónico del cliente en Odoo
        // Puedes mapear otros campos según sea necesario
      };
    });

    // Conectar con Odoo
    const odooCredentials = {
      db: "GameDataBase",
      user: "a22jonorevel@inspedralbes.cat",
      password: "Dam2023+++",
    };

    const clientOptions = {
      host: "141.147.16.21",
      port: 8069,
      path: "/xmlrpc/2/common",
    };
    const client = xmlrpc.createClient(clientOptions);

    // Autenticar en Odoo
    client.methodCall(
      "authenticate",
      [odooCredentials.db, odooCredentials.user, odooCredentials.password, {}],
      (error, uid) => {
        if (error) {
          console.error("Error en la autenticación con Odoo:", error);
          res.status(500).send("Error en la autenticación con Odoo");
        } else {
          if (uid > 0) {
            const objectClientOptions = {
              host: "141.147.16.21",
              port: 8069,
              path: "/xmlrpc/2/object",
            };
            const objectClient = xmlrpc.createClient(objectClientOptions);

            // Insertar los clientes en Odoo
            objectClient.methodCall(
              "execute_kw",
              [
                odooCredentials.db,
                uid,
                odooCredentials.password,
                "res.partner",
                "create",
                [odooClients],
              ],
              (error, clientIds) => {
                if (error) {
                  console.error("Error al crear los clientes en Odoo:", error);
                  res.status(500).send("Error al crear los clientes en Odoo");
                } else {
                  console.log("IDs de los nuevos clientes en Odoo:", clientIds);
                  res.status(200).send("Clientes migrados exitosamente a Odoo");
                }
              }
            );
          } else {
            console.log("Autenticación fallida con Odoo.");
            res.status(401).send("Autenticación fallida con Odoo");
          }
        }
      }
    );
  } catch (error) {
    console.error("Error en la migración de usuarios a Odoo:", error);
    res.status(500).send("Error en la migración de usuarios a Odoo");
  }
});

app.post("/insertUserToOddo", async (req, res) => {
  //EndPoint Para insertar un usuario a Sql y como cliente a Odoo
  try {
    const user = req.body;
    console.log(req.body);

    // Verificar si el usuario ya existe en MySQL
    const infoUser = await selectUsers();
    console.log(infoUser);
    const isUser = infoUser.find(
      (u) => u.correo === user.mail || u.usuario === user.name
    );

    if (isUser) {
      res.send({ response: "Existing user" });
    } else {
      // Insertar el nuevo usuario en MySQL
      user.password = doCryptMD5Hash(req.body.password);
      await insertUser(user.name, user.password, user.mail);

      // Mapear los campos del nuevo usuario al modelo de datos de clientes de Odoo
      const odooClient = {
        name: user.name, // Nombre del cliente en Odoo
        email: user.mail, // Correo electrónico del cliente en Odoo
        // Puedes mapear otros campos según sea necesario
      };

      // Conectar con Odoo
      const odooCredentials = {
        db: "GameDataBase",
        user: "a22jonorevel@inspedralbes.cat",
        password: "Dam2023+++",
      };

      const clientOptions = {
        host: "141.147.16.21",
        port: 8069,
        path: "/xmlrpc/2/common",
      };
      const client = xmlrpc.createClient(clientOptions);

      // Autenticar en Odoo
      client.methodCall(
        "authenticate",
        [
          odooCredentials.db,
          odooCredentials.user,
          odooCredentials.password,
          {},
        ],
        (error, uid) => {
          if (error) {
            console.error("Error en la autenticación con Odoo:", error);
            res.status(500).send("Error en la autenticación con Odoo");
          } else {
            if (uid > 0) {
              const objectClientOptions = {
                host: "141.147.16.21",
                port: 8069,
                path: "/xmlrpc/2/object",
              };
              const objectClient = xmlrpc.createClient(objectClientOptions);

              // Insertar el nuevo cliente en Odoo
              objectClient.methodCall(
                "execute_kw",
                [
                  odooCredentials.db,
                  uid,
                  odooCredentials.password,
                  "res.partner",
                  "create",
                  [odooClient],
                ],
                (error, clientId) => {
                  if (error) {
                    console.error("Error al crear el cliente en Odoo:", error);
                    res.status(500).send("Error al crear el cliente en Odoo");
                  } else {
                    console.log("ID del nuevo cliente en Odoo:", clientId);
                    res.send({
                      response: "User inserted correctly and migrated to Odoo",
                      userData: user,
                    });
                  }
                }
              );
            } else {
              console.log("Autenticación fallida con Odoo.");
              res.status(401).send("Autenticación fallida con Odoo");
            }
          }
        }
      );
    }
  } catch (error) {
    console.error("Error al insertar usuario y migrarlo a Odoo:", error);
    res.status(500).send("Error al insertar usuario y migrarlo a Odoo");
  }
});

app.post("/syncUsersToOdoo", async (req, res) => {
  //EndPoint para verificar si hay algún usuario en Sql que no existe aún en Odoo como cliente
  console.log("entre::::::odoo");
  try {
    // Obtener los usuarios de MySQL
    const usersFromSql = await selectUsers();
    console.log("Usuarios de MySQL:", usersFromSql);

    // Obtener los clientes de Odoo
    const odooClients = await getOdooClients();
    console.log("Clientes de Odoo:", odooClients);

    // Filtrar usuarios que no están en Odoo
    const usersToAdd = usersFromSql.filter(
      (user) =>
        !odooClients.some(
          (client) =>
            client.name === user.usuario && client.email === user.correo
        )
    );
    console.log("Usuarios a agregar en Odoo:", usersToAdd);

    if (usersToAdd.length === 0) {
      res.send({ response: "No new users to add to Odoo" });
      return;
    }

    // Conectar con Odoo
    const odooCredentials = {
      db: "GameDataBase",
      user: "a22jonorevel@inspedralbes.cat",
      password: "Dam2023+++",
    };

    const clientOptions = {
      host: "141.147.16.21",
      port: 8069,
      path: "/xmlrpc/2/common",
    };
    const client = xmlrpc.createClient(clientOptions);

    // Autenticar en Odoo
    client.methodCall(
      "authenticate",
      [odooCredentials.db, odooCredentials.user, odooCredentials.password, {}],
      (error, uid) => {
        if (error) {
          console.error("Error en la autenticación con Odoo:", error);
          res.status(500).send("Error en la autenticación con Odoo");
        } else {
          if (uid > 0) {
            const objectClientOptions = {
              host: "141.147.16.21",
              port: 8069,
              path: "/xmlrpc/2/object",
            };
            const objectClient = xmlrpc.createClient(objectClientOptions);

            // Insertar los nuevos clientes en Odoo
            const newClientIds = [];
            usersToAdd.forEach((user) => {
              const odooClient = {
                name: user.usuario,
                email: user.correo,
              };
              objectClient.methodCall(
                "execute_kw",
                [
                  odooCredentials.db,
                  uid,
                  odooCredentials.password,
                  "res.partner",
                  "create",
                  [odooClient],
                ],
                (error, clientId) => {
                  if (error) {
                    console.error("Error al crear el cliente en Odoo:", error);
                  } else {
                    console.log("ID del nuevo cliente en Odoo:", clientId);
                    newClientIds.push(clientId);
                  }
                }
              );
            });
            res.send({
              response: "New users added to Odoo",
              newClientIds: newClientIds,
            });
          } else {
            console.log("Autenticación fallida con Odoo.");
            res.status(401).send("Autenticación fallida con Odoo");
          }
        }
      }
    );
  } catch (error) {
    console.error("Error al sincronizar usuarios con Odoo:", error);
    res.status(500).send("Error al sincronizar usuarios con Odoo");
  }
});

app.post('/getOdooClients', async (req, res) => { //EndPoint para las estadísticas de los clientes
  try {
    const clients = await getOdooClients();
    res.status(200).json(clients);
  } catch (error) {
    console.error('Error al obtener los clientes de Odoo:', error);
    res.status(500).send('Error al obtener los clientes de Odoo');
  }
});

app.post("/createSaleOrder", async (req, res) => {
  const { productId, partnerId } = req.body;

  if (!productId || !partnerId) {
    res.status(400).send('Se requieren los IDs de producto y cliente');
    return;
  }

  try {
    const saleOrderId = await createSaleOrderInOdoo(productId, partnerId);
    console.log(saleOrderId);
    res.status(200).json({ saleOrderId });
  } catch (error) {
    console.error('Error al crear la orden de venta:', error);
    res.status(500).send('Error al crear la orden de venta en Odoo');
  }
});

app.post("/getProductInfo", async (req, res) => {
  try {
    const productList = await getProductInfo();
    res.status(200).json(productList);
  } catch (error) {
    console.error('Error al obtener la lista de productos:', error);
    res.status(500).send('Error al obtener la lista de productos');
  }
});

app.post("/getSalesStatistics", async (req, res) => { //EndPoint para las ventas
  try {
    // Conectar con Odoo
    const odooCredentials = {
      db: 'GameDataBase',
      user: 'a22jonorevel@inspedralbes.cat',
      password: 'Dam2023+++'
    };

    const clientOptions = {
      host: '141.147.16.21',
      port: 8069,
      path: '/xmlrpc/2/common'
    };
    const client = xmlrpc.createClient(clientOptions);

    // Autenticar en Odoo
    client.methodCall('authenticate', [odooCredentials.db, odooCredentials.user, odooCredentials.password, {}], (error, uid) => {
      if (error) {
        console.error('Error en la autenticación con Odoo:', error);
        res.status(500).send('Error en la autenticación con Odoo');
      } else {
        if (uid > 0) {
          const objectClientOptions = {
            host: '141.147.16.21',
            port: 8069,
            path: '/xmlrpc/2/object'
          };
          const objectClient = xmlrpc.createClient(objectClientOptions);

          // Obtener las estadísticas de ventas
          objectClient.methodCall('execute_kw', [odooCredentials.db, uid, odooCredentials.password, 'sale.report', 'search_read', [[]], { fields: ['name', 'product_id', 'price_subtotal', 'product_uom_qty', 'date'] }], (error, sales) => {
            if (error) {
              console.error('Error al obtener las estadísticas de ventas:', error);
              res.status(500).send('Error al obtener las estadísticas de ventas');
            } else {
              console.log('Estadísticas de ventas:', sales);
              res.send({ sales: sales });
            }
          });
        } else {
          console.log('Autenticación fallida con Odoo.');
          res.status(401).send('Autenticación fallida con Odoo');
        }
      }
    });
  } catch (error) {
    console.error('Error al obtener las estadísticas de ventas:', error);
    res.status(500).send('Error al obtener las estadísticas de ventas');
  }
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
    const userDataToSend = userParseado[userParseado.length - 1];
    console.log(userDataToSend);
    var usuariosEmit = [];
    usersConnected.forEach(u => {
      userParseado.forEach(uBD => {
        if (uBD.id == u.userId) {
          usuariosEmit.push(u);
        }
      });
    });
    // console.log("---------------------------USERS PARA ENVIAR EMIT-----------------------");
    // usuariosEmit.forEach(element => {
    //   console.log(element.userName);
    //   console.log(element.userId);
    // });
    usuariosEmit.forEach(u => {
      u.socketId.emit('getMovementUser', userDataToSend);
    });

  });

  socket.on("sendMovementWeapon", async (weapon, users)=>{
    // console.log("SEND MOVEMENT WEAPON IN GAME");
    // console.log(JSON.parse(weapon));
    // console.log(JSON.parse(users));
    // console.log("---------------------------USERS PARA ENVIAR EMIT-----------------------");
    const userParseado = JSON.parse(users);
    var usuariosEmit = [];
    usersConnected.forEach(u => {
      userParseado.forEach(uBD => {
        if (uBD.id == u.userId) {
          usuariosEmit.push(u);
        }
      });
    });

    usuariosEmit.forEach(u => {
      u.socketId.emit('getMovementWeapon', JSON.parse(weapon));
    });
  });

  socket.on("sendActionThrowWeapon", async(users)=>{
    console.log("SEND ACTION WEAPON IN GAME");
    const userParseado = JSON.parse(users);
    var usuariosEmit = [];
    usersConnected.forEach(u => {
      userParseado.forEach(uBD => {
        if (uBD.id == u.userId) {
          usuariosEmit.push(u);
        }
      });
    });

    usuariosEmit.forEach(u => {
      u.socketId.emit('getActionThrowWeapon', true);
    });
  });

  socket.on("sendStartGame", async (verifyUsers) => {
    console.log("------------------ SEND START GAME ------------------");
    console.log(verifyUsers);
    const verifyUsersParseado = JSON.parse(verifyUsers)
    console.log(verifyUsersParseado);
    var usuariosEmit = [];
    usersConnected.forEach(u => {
      verifyUsersParseado.forEach(uBD => {
        if (uBD.id == u.userId) {
          usuariosEmit.push(u);
        }
      });
    });

    usuariosEmit.forEach(u => {
      u.socketId.emit('getStartGame', verifyUsersParseado);
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
  console.log(`Server running on http://tr3.dam.inspedralbes.cat:${port}`);
});

function doCryptMD5Hash(password) {
  var hash = CryptoJS.MD5(password);
  return hash.toString();
}
