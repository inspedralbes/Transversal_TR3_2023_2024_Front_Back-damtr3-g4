var mysql = require('mysql2');
const fs = require('fs');
const { resolve } = require('path');

module.exports = {
    selectUserByMailPass,
    insertUser,
    selectUsers,
    insertGame,
};

var dbConfig = {
    host: "dam.inspedralbes.cat",
    user: "a22martiptai_tr3",
    password: "Dam2023+++",
    database: "a22martiptai_tr3"
};

function selectUsers(){
    return new Promise((resolve, reject) => {
        let con = conectDB();
        var sql = "SELECT id, correo, usuario FROM Usuarios;";

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

function selectUserByMailPass(mail, password){
    return new Promise((resolve, reject) => {
        let con = conectDB();
        var sql = "SELECT id, correo, usuario FROM Usuarios WHERE correo='" + mail + "' and contrasenya='" + password + "';";

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

function insertUser(name, password, mail){
    return new Promise((resolve, reject) => {
        let con = conectDB();
        var sql = "INSERT INTO Usuarios(usuario, contrasenya, correo) VALUES ('" + name + "','" + password + "', '" + mail + "');";
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

function insertGame(player1Id, player2Id, resultado){
    return new Promise((resolve, reject) => {
        let con = conectDB();
        let sql;
        let values;
        //Si es partida con 2 jugadores
        if (player2Id){
            sql = "INSERT INTO Partidas (jugador1_id, jugador2_id, resultado) VALUES (?, ?, ?)";
            values = [player1Id, player2Id, resultado];
        } else { //Si es un partida en solitario
            sql = "INSERT INTO Partidas (jugador1_id, resultado) VALUES (?, ?)";
            values = [player1Id, resultado];
        }

        con.query(sql, values, function (err, result){
            if(err){
                reject(err);
            } else {
                resolve(result);
            }
            disconnectDB(con);
        });
    });
}

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