const { MongoClient } = require("mongodb");
const url =
  "mongodb+srv://a22martiptai:Dam2023@cluster0.oadcs7f.mongodb.net/";
const client = new MongoClient(url);

const dbName = "AssetsGame";
const collectionName = "CHARACTERS";
module.exports = {
    insertData,
    getData,
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
