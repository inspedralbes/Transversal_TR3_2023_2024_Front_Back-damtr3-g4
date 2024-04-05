var mysql = require('mysql2');
const fs = require('fs');
const { resolve } = require('path');

module.exports = {
    selectUserByMailPass,
    insertUser,
    selectUsers,
    insertGame,
    insertSkin,
    selectPlayersInGame,
    getIdGame,
    updateUserGameId
};

var dbConfig = {
    host: "dam.inspedralbes.cat",
    user: "a22martiptai_tr3",
    password: "Dam2023+++",
    database: "a22martiptai_tr3"
};

// ----------------------------------------------- FUNCIONES SQL PARA USUARIOS -------------------------------

function selectUsers() {
    return new Promise((resolve, reject) => {
        let con = conectDB();
        var sql = "SELECT id, correo, usuario FROM Usuario;";

        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
        disconnectDB(con);
    });
}

function selectUserByMailPass(mail, password) {
    return new Promise((resolve, reject) => {
        let con = conectDB();
        var sql = "SELECT id, correo, usuario FROM Usuario WHERE correo='" + mail + "' and contrasenya='" + password + "';";

        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
        disconnectDB(con);
    });
}

function insertUser(name, password, mail) {
    return new Promise((resolve, reject) => {
        let con = conectDB();
        var sql = "INSERT INTO Usuario(usuario, contrasenya, correo) VALUES ('" + name + "','" + password + "', '" + mail + "');";
        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
        });
        disconnectDB(con);
    });
}


// ----------------------------------------------- FUNCIONES SQL PARA GAMES -------------------------------
function insertGame(numPlayers, state, password) {
    return new Promise((resolve, reject) => {
        let con = conectDB();
        let sql = "INSERT INTO Partida (Njugadores, estado, password) VALUES (?, ?, ?)";
        let values = [numPlayers, state, password];

        con.query(sql, values, function (err, result) {
            if (err) {
                reject(err);
            } else {
                getIdGame(password).then((data) =>{
                    resolve(data);
                })
                
            }
            disconnectDB(con);
        });
    });
}

function getIdGame(password){
    return new Promise((resolve, reject)=>{
        let con = conectDB();
        let sql = "SELECT id FROM Partida WHERE password ='"+ password +"';"

        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
            disconnectDB(con);
        });
    });
}

function selectPlayersInGame(id, state) {
    return new Promise((resolve, reject) => {
        let con = conectDB();
        var sql = "SELECT Usuario.id, Usuario.usuario, Usuario.correo FROM Usuario JOIN Partida ON Usuario.id_partida = Partida.id WHERE Partida.id = '"+ id +"' AND Partida.estado = '"+ state +"'; ";

        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
            disconnectDB(con);
        });
    });
}

function selectIdGameByPassword(passwordGame){
    return new Promise((resolve, reject)=>{
        let con = conectDB();
        var sql = "SELECT id FROM Partida WHERE password='"+passwordGame+"'";

        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
            disconnectDB(con);
        });
    });
}

function updateUserGameId(passwordGame, idUser){
    return new Promise((resolve, reject)=>{
        let con = conectDB();
        var sql = "UPDATE Usuario SET id_partida=(SELECT Partida.id FROM Partida WHERE Partida.password='"+passwordGame+"') WHERE Usuario.id="+ idUser +";";

        con.query(sql, function (err, result) {
            if (err) {
                reject(err);
            } else {
                selectIdGameByPassword(passwordGame).then((data)=>{
                    resolve(data);
                });
            }
            disconnectDB(con);
        });
    });
}

function insertSkin(nombre, precio, descripcion, imagen) {
    return new Promise((resolve, reject) => {
        let con = conectDB();
        let sql = "INSERT INTO Skins (nombre, precio, descripcion, imagen) VALUES (?, ?, ?, ?)";
        let values = [nombre, precio, descripcion, imagen];

        con.query(sql, values, function (err, result) {
            if (err) {
                reject(err);
            } else {
                resolve(result);
            }
            disconnectDB(con);
        });
    });
}

// ----------------------------------------------- FUNCIONES SQL PARA CONECTAR BASE DE DATOS -------------------------------
function conectDB() {
    let con = mysql.createConnection(dbConfig)
    con.connect(function (err) {
        if (err) {
            console.log("No conexio");
        } else {
            console.log("Conectado");
        }
    })
    return con
}

function disconnectDB(con) {
    con.end(function (err) {
        if (err) {
            return console.log("error: " + err.message);
        }
    })
}