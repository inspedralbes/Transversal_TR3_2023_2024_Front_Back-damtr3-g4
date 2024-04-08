const { MongoClient } = require("mongodb");
const { ObjectId } = require("mongodb");
// 
const url =
  "mongodb://a22martiptai:Dam2023@ac-loawaxe-shard-00-00.oadcs7f.mongodb.net:27017,ac-loawaxe-shard-00-01.oadcs7f.mongodb.net:27017,ac-loawaxe-shard-00-02.oadcs7f.mongodb.net:27017/?replicaSet=atlas-llm4yv-shard-0&ssl=true&authSource=admin";
const client = new MongoClient(url);

const dbName = "AssetsGame";
const collectionName = "CHARACTERS";
const collectionName2 = "BROADCAST";
module.exports = {
    insertData,
    getData,
    insertBroadcast,
    getBroadcast,
    editMessage
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
    console.log(id, newMessage);
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName2);

    // Convertir el id en ObjectId
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






