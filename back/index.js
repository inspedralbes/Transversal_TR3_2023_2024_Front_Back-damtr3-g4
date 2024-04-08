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
const { Client } = require('ssh2');
const xmlrpc = require('xmlrpc'); //Se utiliza para establecer la conexión con Odoo
const nodemailer = require('nodemailer');


app.use(express.json());
app.use(cors());
// Servir archivos estáticos desde la carpeta 'assets'
app.use('/assets', express.static(path.join(__dirname, 'assets')));
const routeImg = path.join(__dirname, 'assetsForAndroid');

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

const {
    getOdooClients,
} = require("./OdooFuntions");

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

app.post("/insertUserToOddo", async (req, res) => { //EndPoint Para insertar un usuario a Sql y como cliente a Odoo
    try {
        const user = req.body;
        console.log(req.body);

        // Verificar si el usuario ya existe en MySQL
        const infoUser = await selectUsers();
        console.log(infoUser);
        const isUser = infoUser.find((u) => u.correo === user.mail || u.usuario === user.name);

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

                        // Insertar el nuevo cliente en Odoo
                        objectClient.methodCall('execute_kw', [odooCredentials.db, uid, odooCredentials.password, 'res.partner', 'create', [odooClient]], (error, clientId) => {
                            if (error) {
                                console.error('Error al crear el cliente en Odoo:', error);
                                res.status(500).send('Error al crear el cliente en Odoo');
                            } else {
                                console.log('ID del nuevo cliente en Odoo:', clientId);
                                res.send({ response: "User inserted correctly and migrated to Odoo", userData: user });
                            }
                        });
                    } else {
                        console.log('Autenticación fallida con Odoo.');
                        res.status(401).send('Autenticación fallida con Odoo');
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error al insertar usuario y migrarlo a Odoo:', error);
        res.status(500).send('Error al insertar usuario y migrarlo a Odoo');
    }
});

app.post("/syncUsersToOdoo", async (req, res) => { //EndPoint para verificar si hay algún usuario en Sql que no existe aún en Odoo como cliente
    try {
        // Obtener los usuarios de MySQL
        const usersFromSql = await selectUsers();
        console.log("Usuarios de MySQL:", usersFromSql);

        // Obtener los clientes de Odoo
        const odooClients = await getOdooClients();
        console.log("Clientes de Odoo:", odooClients);

        // Filtrar usuarios que no están en Odoo
        const usersToAdd = usersFromSql.filter(user => !odooClients.some(client => client.name === user.usuario && client.email === user.correo));
        console.log("Usuarios a agregar en Odoo:", usersToAdd);

        if (usersToAdd.length === 0) {
            res.send({ response: "No new users to add to Odoo" });
            return;
        }

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

                    // Insertar los nuevos clientes en Odoo
                    const newClientIds = [];
                    usersToAdd.forEach(user => {
                        const odooClient = {
                            name: user.usuario,
                            email: user.correo
                        };
                        objectClient.methodCall('execute_kw', [odooCredentials.db, uid, odooCredentials.password, 'res.partner', 'create', [odooClient]], (error, clientId) => {
                            if (error) {
                                console.error('Error al crear el cliente en Odoo:', error);
                            } else {
                                console.log('ID del nuevo cliente en Odoo:', clientId);
                                newClientIds.push(clientId);
                            }
                        });
                    });
                    res.send({ response: "New users added to Odoo", newClientIds: newClientIds });
                } else {
                    console.log('Autenticación fallida con Odoo.');
                    res.status(401).send('Autenticación fallida con Odoo');
                }
            }
        });
    } catch (error) {
        console.error('Error al sincronizar usuarios con Odoo:', error);
        res.status(500).send('Error al sincronizar usuarios con Odoo');
    }
});


// MONGO 
app.post("/insertCharacter", async (req, res) => {
    const data = req.body;
    const result = await insertData(data.name_character, data.description, data.picture, data.price, data.idPhrase)
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
    console.log("ID::::" + id);
    const nameFile = id + ".png";
    const routeFile = path.join(routeImg, nameFile);
    fs.readFile(routeFile, (error, datos) => {
        if (error) {
            console.error('Error al leer el archivo:', error);
            res.status(404).send('El archivo no existe');
            return;
        }

        console.log('El archivo existe:', nameFile);
    });

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

function DetenerOdoo() {
    const con = new Client();
    const sshConfig = {
        host: '141.147.16.21',
        port: 22,
        username: 'ubuntu',
        privateKey: require('fs').readFileSync('ssh-key-2024-03-18.key')
    };

    con.on('ready', function () {
        console.log('Conexión establecida. Ejecutando comando...');
        // Detener primero el contenedor de la base de datos
        con.exec('sudo docker stop db', function (err, stream) {
            if (err) throw err;
            stream
                .on('close', function (code, signal) {
                    console.log('Comando sudo docker stop db ejecutado.');
                    // Luego detener el contenedor de Odoo
                    con.exec('sudo docker stop odoo', function (err, stream) {
                        if (err) throw err;
                        stream
                            .on('close', function (code, signal) {
                                console.log('Comando sudo docker stop odoo ejecutado.');
                                con.end();
                            })
                            .on('data', function (data) {
                                console.log('STDOUT: ' + data);
                            })
                            .stderr.on('data', function (data) {
                                console.log('STDERR: ' + data);
                            });
                    });
                })
                .on('data', function (data) {
                    console.log('STDOUT: ' + data);
                })
                .stderr.on('data', function (data) {
                    console.log('STDERR: ' + data);
                });
        });
    }).connect(sshConfig);

    con.on('error', function (err) {
        console.error('Error de conexión:', err);
    });
}

function ArrancarOdoo() {
    const con = new Client();
    const sshConfig = {
        host: '141.147.16.21',
        port: 22,
        username: 'ubuntu',
        privateKey: require('fs').readFileSync('ssh-key-2024-03-18.key')
    };

    con.on('ready', function () {
        console.log('Conexión establecida. Ejecutando comando...');
        // Detener primero el contenedor de la base de datos
        con.exec('sudo docker start db', function (err, stream) {
            if (err) throw err;
            stream
                .on('close', function (code, signal) {
                    console.log('Comando sudo docker start db ejecutado.');
                    // Luego detener el contenedor de Odoo
                    con.exec('sudo docker start odoo', function (err, stream) { 
                        if (err) throw err;
                        stream
                            .on('close', function (code, signal) {
                                console.log('Comando sudo docker start odoo ejecutado.');
                                con.end();
                            })
                            .on('data', function (data) {
                                console.log('STDOUT: ' + data);
                            })
                            .stderr.on('data', function (data) {
                                console.log('STDERR: ' + data);
                            });
                    });
                })
                .on('data', function (data) {
                    console.log('STDOUT: ' + data);
                })
                .stderr.on('data', function (data) {
                    console.log('STDERR: ' + data);
                });
        });
    }).connect(sshConfig);

    con.on('error', function (err) {
        console.error('Error de conexión:', err);
    });
}

function checkOdoo() {
    return new Promise((resolve, reject) => {
        const con = new Client();
        const sshConfig = {
            host: '141.147.16.21',
            port: 22,
            username: 'ubuntu',
            privateKey: require('fs').readFileSync('ssh-key-2024-03-18.key')
        };

        con.on('ready', function () {
            console.log('Conexión SSH establecida. Ejecutando comando...');
            con.exec("sudo docker inspect --format='{{.State.Status}}' odoo", function (err, stream) {
                if (err) {
                    reject(err);
                    return;
                }
                stream
                    .on('close', function (code, signal) {
                        console.log('Comando docker inspect ejecutado.');
                        con.end();
                    })
                    .on('data', function (data) {
                        const estadoOdoo = data.toString().trim(); // Convertir los datos a cadena y eliminar espacios en blanco
                        resolve(estadoOdoo); // Resolver la promesa con el estado obtenido
                    })
                    .stderr.on('data', function (data) {
                        console.error('Error al ejecutar docker inspect:', data.toString());
                        reject(data.toString()); // Rechazar la promesa si hay un error
                    });
            });
        }).connect(sshConfig);

        con.on('error', function (err) {
            console.error('Error de conexión SSH:', err);
            reject(err); // Rechazar la promesa en caso de error de conexión
        });
    });
}


app.post('/stopOdoo', async (req, res) => {
    try {
      await DetenerOdoo(); // Esperar a que la función DetenerOdoo() se complete
      res.send('Odoo y db detenidas correctamente.');
    } catch (error) {
      console.error('Error al detener Odoo:', error);
      res.status(500).send('Error al detener Odoo.');
    }
  });

app.post('/startOdoo', async (req, res)=>{
    try {
        await ArrancarOdoo(); // Esperar a que la función DetenerOdoo() se complete
        res.send('Odoo y db arrancadas correctamente.');
      } catch (error) {
        console.error('Error al arrancar Odoo:', error);
        res.status(500).send('Error al arrancar Odoo.');
      }
})

app.post('/checkOdoo', async (req, res) => {
    try {
        const estadoOdoo = await checkOdoo(); // Esperar a que la función checkOdoo() se complete
        const isRunning = estadoOdoo === 'running'; // Devuelve true si el estado es 'running', false en caso contrario
        console.log(isRunning);
        res.send(isRunning);
    } catch (error) {
        console.error('Error al comprobar el estado de Odoo:', error);
        res.status(500).send('Error al comprobar el estado de Odoo.');
    }
});

app.post("/InsertProductInOdoo", async (req, res) => {
    const xmlrpc = require('xmlrpc');

    const db = 'GameDataBase';
    const user = 'a22jonorevel@inspedralbes.cat';
    const password = 'Dam2023+++';

    // Crear un cliente XML-RPC común para todas las llamadas
    const clientOptions = {
        host: '141.147.16.21',
        port: 8069,
        path: '/xmlrpc/2/common'
    };
    const client = xmlrpc.createClient(clientOptions);

    client.methodCall('authenticate', [db, user, password, {}], (error, uid) => {
        if (error) {
            console.error('Error en la autenticación:', error);
            res.status(500).send('Error en la autenticación');
        } else {
            if (uid > 0) {
                const objectClientOptions = {
                    host: '141.147.16.21',
                    port: 8069,
                    path: '/xmlrpc/2/object'
                };
                const objectClient = xmlrpc.createClient(objectClientOptions);

                const productData = {
                    name: 'Nuevo producto nodejs',
                    list_price: 100.0
                };

                objectClient.methodCall('execute_kw', [db, uid, password, 'product.product', 'create', [productData]], (error, productId) => {
                    if (error) {
                        console.error('Error al crear el producto:', error);
                        res.status(500).send('Error al crear el producto');
                    } else {
                        console.log('ID del nuevo producto:', productId);
                        res.status(200).send('Producto creado exitosamente');
                    }
                });
            } else {
                console.log('Autenticación fallida.');
                res.status(401).send('Autenticación fallida');
            }
        }
    });
});


app.post("/ConnectionOdoo", async (req, res) => {

    const db = 'GameDataBase';
    const user = 'a22jonorevel@inspedralbes.cat';
    const password = 'Dam2023+++';

    // Crear un cliente XML-RPC común para todas las llamadas
    const clientOptions = {
        host: '141.147.16.21',
        port: 8069,
        path: '/xmlrpc/2/common'
    };
    const client = xmlrpc.createClient(clientOptions);

    client.methodCall('authenticate', [db, user, password, {}], (error, uid) => {
        if (error) {
            console.error('Error en la autenticación:', error);
            res.status(500).send('Error en la autenticación');
        } else {
            if (uid > 0) {
                const objectClientOptions = {
                    host: '141.147.16.21',
                    port: 8069,
                    path: '/xmlrpc/2/object'
                };
                const objectClient = xmlrpc.createClient(objectClientOptions);

                objectClient.methodCall('execute_kw', [db, uid, password, 'product.product', 'search_read', [[]], {fields: ['name', 'list_price']}], (error, products) => {
                    if (error) {
                        console.error('Error al obtener la lista de productos:', error);
                        res.status(500).send('Error al obtener la lista de productos');
                    } else {
                        console.log('Lista de productos:');
                        products.forEach(product => {
                            console.log(`Nombre: ${product.name}, Precio: ${product.list_price}`);
                        });
                        res.status(200).send('Lista de productos obtenida correctamente');
                    }
                });
            } else {
                console.log('Autenticación fallida.');
                res.status(401).send('Autenticación fallida');
            }
        }
    });
});

app.post("/migrateFromMongoToOdoo", async (req, res) => { //EndPoint para migrar los personajes de MongoDb a Odoo
    try {
        const odooCredentials = {
            db: 'GameDataBase',
            user: 'a22jonorevel@inspedralbes.cat',
            password: 'Dam2023+++'
        };

        //Obtener los datos de MongoDB
        const mongoData = await getData();

        //Procesar los datos y realizar la inserción en Odoo
        for (const data of mongoData) {
            const { name_character, description, price } = data;

            const imageName = `${name_character}.png`;
            const imagePath = path.join(__dirname, 'assets', imageName);

            // Leer la imagen como cadena de bytes codificada en base64
            const imageData = fs.readFileSync(imagePath);
            const imageBase64 = imageData.toString('base64');

            const productData = {
                name: name_character,
                description: description,
                list_price: price,
                image_1920: imageBase64,
            };

            // Crear un cliente XML-RPC para Odoo
            const clientOptions = {
                host: '141.147.16.21',
                port: 8069,
                path: '/xmlrpc/2/common'
            };
            const client = xmlrpc.createClient(clientOptions);

            // Autenticar en Odoo
            client.methodCall('authenticate', [odooCredentials.db, odooCredentials.user, odooCredentials.password, {}], (error, uid) => {
                if (error) {
                    console.error('Error en la autenticación:', error);
                    res.status(500).send('Error en la autenticación');
                } else {
                    if (uid > 0) {
                        const objectClientOptions = {
                            host: '141.147.16.21',
                            port: 8069,
                            path: '/xmlrpc/2/object'
                        };
                        const objectClient = xmlrpc.createClient(objectClientOptions);

                        // Insertar el producto en Odoo
                        objectClient.methodCall('execute_kw', [odooCredentials.db, uid, odooCredentials.password, 'product.product', 'create', [productData]], (error, productId) => {
                            if (error) {
                                console.error('Error al crear el producto:', error);
                                // Tratar errores de inserción en Odoo
                            } else {
                                console.log('ID del nuevo producto:', productId);
                                // Manejar inserción exitosa en Odoo
                            }
                        });
                    } else {
                        console.log('Autenticación fallida.');
                        res.status(401).send('Autenticación fallida');
                    }
                }
            });
        }

        //Enviar respuesta de éxito
        res.status(200).send("Migración exitosa de MongoDB a Odoo.");
    } catch (error) {
        console.error("Error en la migración:", error);
        res.status(500).send("Error en la migración de MongoDB a Odoo.");
    }
});


async function sendInvoicesAutomatically() {
    try {
        // Establecer conexión con Odoo
        const odooClient = xmlrpc.createClient({
            host: '141.147.16.21',
            port: 8069,
            path: '/xmlrpc/2/object'
        });

        // Crear la actividad planificada
        const activityData = {
            model: 'mail.activity.plan',
            method: 'create',
            args: [{
                activity_type_id: 1, // ID del tipo de actividad (puedes obtenerlo de tu instancia de Odoo)
                summary: 'Enviar factura',
                note: 'Adjuntamos la factura de tu compra.',
                email_from: 'a22jonorevel@inspedralbes.cat',
                email_to: 'a22jonorevel@inspedralbes.cat',
                date_deadline: '2024-04-10 00:00:00', // Fecha y hora de ejecución de la actividad
                state: 'planned', // Estado de la actividad
                user_id: 1, // ID del usuario responsable de la actividad (puedes obtenerlo de tu instancia de Odoo)
                // Otros campos necesarios para la actividad planificada
            }]
        };

        // Llamada a la API XML-RPC para crear la actividad planificada
        const result = await new Promise((resolve, reject) => {
            odooClient.methodCall('execute_kw', ['GameDataBase', 1, 'Dam2023+++', 'execute', activityData], (error, value) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(value);
                }
            });
        });

        console.log('Actividad planificada creada:', result);
    } catch (error) {
        console.error('Error al enviar la factura automáticamente:', error);
        throw error;
    }
}

// EndPoint para activar el envío automático de facturas
app.post("/sendInvoicesAutomatically", async (req, res) => {
    try {
        await sendInvoicesAutomatically();
        res.status(200).send('Envío automático de facturas activado correctamente');
    } catch (error) {
        console.error('Error en el endPoint sendInvoicesAutomatically:', error);
        res.status(500).send('Error en el endPoint sendInvoicesAutomatically');
    }
});

app.get("/getOdooClients", async (req, res) => {
    try {
        const clients = await getOdooClients();
        res.status(200).json(clients);
    } catch (error) {
        console.error('Error en el endPoint getOdooClients:', error);
        res.status(500).send('Error en el endPoint getOdooClients');
    }
});