//es6
import dotenv from 'dotenv';
import express from "express";
import bodyParser from "body-parser";
import { MongoClient } from "mongodb"; 
//import assert from 'assert';
import path from "path";

const dot = dotenv.config({ path: ".env" });;

const PORT = dot.PORT || 8000;
//const PORT = dot.PORT;
// const LOCAL_USER = dot.LOCAL_USER;
// const LOCAL_PASS = dot.LOCAL_PASS;
// const LOCAL_DATA = dot.LOCAL_DATA;
const USER = dot.DB_USER;
const PASS = dot.DB_PASS;
const DATA = dot.DB_DATA;

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const app = express();

app.use(bodyParser.json());

app.use(express.json());

app.use(express.static(path.join(__dirname, "/build")));

//const bodyParser = express.urlencoded({ extended: false });

//main connect to mongo db
const withDB = async (operations, res) => {

  try {

    // const client = await MongoClient.connect(`mongodb://localhost:27017`, { useNewUrlParser: true, useUnifiedTopology: true });
    // const db = client.db('shoestore');   
    // await operations(db);
    // client.close();     
    
    const client = await MongoClient.connect(`mongodb+srv://${DB_USER}:${DB_PASS}@cluster0.aqewv.mongodb.net/${DB_DATA}?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true });
    const db = client.db(`shoestore`);   
    await operations(db);
    client.close();     

    
  } catch (err) {
    res.status(500).send({ message: "Database Error", err });
    process.exit(1);
  }
};

app.get("/api/data/", async (req, res) => {
  //connect to mongo db
  await withDB(async (db) => {
    const productsInfo = await db.collection("products").find({});
    const results = await productsInfo.toArray();
    // Process the results
    if (results.length > 0) {
      results.forEach((result, i) => {
        console.log(result);
        // Here you could build your html or put the results in some other data structure you want to work with
      });
    } else {
      console.log(`No customers found`);
    }
    res.status(200).json(results); //use json instead of send
  }, res);
});

app.get("/api/product/:name", async (req, res) => {
  const productName = req.params.name;

  //connect to mongo db
  await withDB(async (db) => {
    const productsInfo = await db
      .collection("products")
      .findOne({ name: productName });
    res.status(200).json(productsInfo); //use json instead of send
  }, res);
});

app.post("/api/product/:name/likes", async (req, res) => {
  const productName = req.params.name;

  console.log(productName);

  // productsInfo[productName].likes += 1;

  // res
  //   .status(200)
  //   .send(`${productName} now has ${productsInfo[productName].likes} likes`);

  //connect to mongo db
  await withDB(async (db) => {

    try{
    const productsInfo = await db.collection("products").findOne({ name: productName });

    await db.collection("products").updateOne(
      { name: productName },
      {
        '$set': {
          likes: productsInfo.likes + 1,
        },
      }
    );

    const updatedProductInfo = await db.collection("products").findOne({ name: productName });
    res.status(200).json(updatedProductInfo);

    }catch(err){
      console.log(err)

    }
  }, res);

  

});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(PORT, () => console.log("Server is listening on port 8000"));
