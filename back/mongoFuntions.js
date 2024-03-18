const { MongoClient } = require("mongodb");
const url =
  "mongodb://a22martiptai:Dam2023@ac-loawaxe-shard-00-00.oadcs7f.mongodb.net:27017,ac-loawaxe-shard-00-01.oadcs7f.mongodb.net:27017,ac-loawaxe-shard-00-02.oadcs7f.mongodb.net:27017/?replicaSet=atlas-llm4yv-shard-0&ssl=true&authSource=admin";
const client = new MongoClient(url);

const dbName = "AssetsGame";
const collectionName = "CHARACTERS";
module.exports = {
    insertData,
}
async function insertData(nameCharacter, description, picture) {
  try {
    await client.connect();
    const database = client.db(dbName);
    const collection = database.collection(collectionName);
    // Objeto con los datos a insertar
    const data = {
      name_character: nameCharacter,
      description: description,
      picture: picture,
    };
    const result = await collection.insertOne(data);
    console.log(`Se insertaron ${result.insertedCount} documentos.`);
    await client.close();
  } catch (err) {
    console.log(err.message);
  }
}
