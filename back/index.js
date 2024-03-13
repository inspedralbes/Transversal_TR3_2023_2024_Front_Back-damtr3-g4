const express = require("express");
const session = require("express-session");
const http = require("http");
const fs = require("fs");
const cors = require("cors");
const CryptoJS = require("crypto-js");

const app = express();
const server = http.createServer(app);
const port = 3789;

app.use(express.json());
app.use(cors());

const {
    selectUserByMailPass,
    insertUser
} = require("./dbFunctions");

app.post("/authoritzationLogin", async (req, res) => {
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
    await insertUser(user.name,  user.password, user.mail);
    res.send({ response: "User inserted correctly", userData: user });
});

server.listen(port, () => {
    console.log(`Server running on http//:localhost:${port}`);
});

function doCryptMD5Hash(password) {
    var hash = CryptoJS.MD5(password);
    return hash.toString();
}