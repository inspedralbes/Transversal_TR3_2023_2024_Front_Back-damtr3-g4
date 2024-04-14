const { MongoClient } = require("mongodb");
const { ObjectId } = require('mongodb');
// 
const url =
  "mongodb://a22martiptai:Dam2023@ac-loawaxe-shard-00-00.oadcs7f.mongodb.net:27017,ac-loawaxe-shard-00-01.oadcs7f.mongodb.net:27017,ac-loawaxe-shard-00-02.oadcs7f.mongodb.net:27017/?replicaSet=atlas-llm4yv-shard-0&ssl=true&authSource=admin";
const client = new MongoClient(url);

const dbName = "AssetsGame";
const collectionName = "CHARACTERS";
const collectionName2 = "BROADCAST";
const collectionUSERCHARACTER = "USERCHARACTERS";
const collectionUSINFO = "INFO";
module.exports = {
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
}
async function insertData(nameCharacter, description, picture) {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const data = {
      name_character: nameCharacter,
      description: description,
      phraseId: phrase,
      picture: picture,
    };
    const result = await collection.insertOne(data);
    console.log(`Se inserto correctamente`);
    await client.close();
  } catch (err) {
    console.log(err.message);
  }
}

async function getInfo() {
  const client = new MongoClient(url, { useNewUrlParser: true, useUnifiedTopology: true });
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionUSINFO);
    const data = await collection.find({}).toArray();
    return data;
  } catch (err) {
    console.log(err.message);
  } finally {
    await client.close();
  }
}

async function getData(){
  try{
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const result = await collection.find({}).toArray();
    return result;
  } catch(err){
    console.log(err.message);
  }
}

async function getDataSkinByIdSkin(idSkin){
  try{
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const objectId = new ObjectId(idSkin); // Crear un nuevo ObjectId
    const result = await collection.find({_id: objectId}).toArray();
    return result;
  } catch(err){
    console.log(err.message);
  }
}

async function getSkinsByIdUser(idUser){
  console.log(idUser);
  try{
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionUSERCHARACTER);
    const result = await collection.find({ idUser: idUser }).project({ _id: 0, idSkins: 1 }).toArray();
    return result;
  } catch(err){
    console.log("CAGASGTE EN SKIN BY USER ID. mongofunction");
    console.log(err.message);
  }
}

async function insertUserCharacter(idUser){
  try{
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionUSERCHARACTER);
    const data = {
      idUser: idUser,
      idSkins: ["defaultSkin"],
    };
    const result = await collection.insertOne(data);
    console.log(`Se inserto correctamente`);
    await client.close();
  } catch(err){
    console.log(err.message);
  }
}

async function updateUserCharacter(idUser, idSkin){
  try{
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionUSERCHARACTER);
    const skins = await getSkinsByIdUser(idUser);
    skins[0].idSkins.push(idSkin);
    const result = await collection.updateOne(
      { idUser: idUser },
      { $set: { idSkins: skins[0].idSkins} }
    );
    return result;
  } catch(err){
    console.log(err.message);
  }
}

async function insertBroadcast(message, idCharacter) {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName2);
    const data = {
      message: message,
      idCharacter: idCharacter,
    };
    const result = await collection.insertOne(data);
    console.log(`Se inserto correctamente`);
    await client.close();
  } catch (err) {
    console.log(err.message);
  }
}

async function getBroadcast(){
  try{
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName2);
    const result = await collection.find({}).toArray();
    return result;
  } catch(err){
    console.log(err.message);
  }
}

async function editMessage(id, newMessage) {
  try {

    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName2);

    const objectId = new ObjectId(id);

    const result = await collection.updateOne(
      { _id: objectId },
      { $set: { message: newMessage } }
    );
    return result;
  } catch(err) {
    console.log(err.message);
    throw new Error("No se pudo actualizar el mensaje.");
  }
}






