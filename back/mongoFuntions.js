const { MongoClient } = require("mongodb");
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
}
async function insertData(nameCharacter, description, picture) {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    const data = {
      name_character: nameCharacter,
      description: description,
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

async function insertBroadcast(message) {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName2);
    const data = {
      message: message,
    };
    const result = await collection.insertOne(data);
    console.log(`Se inserto correctamente`);
    await client.close();
  } catch (err) {
    console.log(err.message);
  }
}


