//es6
import dotenv from "dotenv";
import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import cors from "cors";
// import morgan from "morgan";
// import helmet from "helmet";
import { auth, requiredScopes } from "express-oauth2-jwt-bearer";

const __dirname = path.dirname(new URL(import.meta.url).pathname);
const app = express();

//json parser
app.use(express.json());

//dot env
const dot = dotenv.config({ path: ".env" });

const PORT = process.env.PORT || 8000;
const baseUrl = process.env.AUTH0_BASE_URL;
const issuerBaseUrl = process.env.AUTH0_ISSUER_BASE_URL;
const audience = process.env.AUTH0_AUDIENCE;

if (!issuerBaseUrl || !audience) {
  throw "Make sure you have ISSUER_BASE_URL, and AUDIENCE in your .env file";
}

if (!audience) {
  console.log(
    "AUTH0_AUDIENCE not set in .env.local. Shutting down API server."
  );
  process.exit(1);
}

// app.use(morgan("dev"));
// app.use(helmet());

app.use(cors({ origin: baseUrl }));

const checkJwt = auth({
  audience: `${audience}`,
  issuerBaseURL: `${issuerBaseUrl}`,
});

// This route needs authentication
app.get("/api/private", checkJwt, function (req, res) {
  res.send("Secured Resource");
});

const checkScopes = requiredScopes("read:products");

app.get("/api/private-scoped", checkJwt, checkScopes, function (req, res) {
  res.json({
    message:
      "Hello from a private endpoint! You need to be authenticated and have a scope of read:messages to see this.",
  });
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  return res.set(err.headers).status(err.status).json({ message: err.message });
});

//static paths for images, fonts etc in build folder
app.use(express.static(path.join(__dirname, "/build")));

//main connect to mongo db
const withDB = async (operations, res) => {
  try {
    const client = await MongoClient.connect(
      process.env.DB_USER && process.env.DB_PASS
        ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aqewv.mongodb.net/${process.env.DB_DATA}?retryWrites=true&w=majority`
        : `mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false`,
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    const db = client.db(`shoestore`);
    await operations(db);
    client.close();
  } catch (err) {
    res.status(500).send({ message: "Database Error", err });
    process.exit(1);
  }
};

// get all products
app.get("/api/products", async (req, res) => {
  //connect to mongo db
  await withDB(async (db) => {
    const productsInfo = await db.collection("products").find({});
    const results = await productsInfo.toArray();
    // Process the results
    if (results.length > 0) {
      console.log(`${results.length} customers found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No customers found`);
    }
    //return results
    res.status(200).json(results); //use json instead of send
  }, res);
});

// get search bar options data
app.get("/api/searchbardata", async (req, res) => {
  //connect to mongo db
  await withDB(async (db) => {
    const searchbarInfo = await db.collection("searchBarData").find({});
    const results = await searchbarInfo.toArray();
    // Process the results
    if (results.length > 0) {
      console.log(`${results.length} search data found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No search data found`);
    }
    res.status(200).json(results); //use json instead of send
  }, res);
});

// get select options data
app.get("/api/selectdata", async (req, res) => {
  //connect to mongo db
  await withDB(async (db) => {
    const selectbarInfo = await db.collection("selectBarData").find({});
    const results = await selectbarInfo.toArray();
    // Process the results
    if (results.length > 0) {
      console.log(`${results.length} select data found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No select data found`);
    }
    res.status(200).json(results); //use json instead of send
  }, res);
});

// get select accordion data
app.get("/api/accordiondata", async (req, res) => {
  //connect to mongo db
  await withDB(async (db) => {
    const accordionInfo = await db.collection("accordianData").find({});
    const results = await accordionInfo.toArray();
    // Process the results
    if (results.length > 0) {
      console.log(`${results.length} select data found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No select data found`);
    }
    res.status(200).json(results); //use json instead of send
  }, res);
});

//// get product by name
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

// add likes to products
app.post("/api/product/:name/likes", async (req, res) => {
  const productName = req.params.name;
  //connect to mongo db
  await withDB(async (db) => {
    try {
      const productsInfo = await db
        .collection("products")
        .findOne({ name: productName });

      await db.collection("products").updateOne(
        { name: productName },
        {
          $set: {
            likes: productsInfo.likes + 1,
          },
        }
      );
      const updatedProductInfo = await db
        .collection("products")
        .findOne({ name: productName });
      res.status(200).json(updatedProductInfo);
    } catch (err) {
      console.log(err);
    }
  }, res);
});

// register users
// app.post("/api/register", async (req, res) => {
//   //connect to mongo db
//   await withDB(async (db) => {
//     try{

//       const newUser = req.body;
//       newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);
//       await db.collection("register").insertOne(newUser ,(err, user) => {
//           if (err) {
//               return res.status(400).send({
//                   message: err
//               });
//           } else {
//               user.hashPassword = undefined;
//               return res.json(user);
//           }
//       })

//     }catch(err){
//       console.log(err)

//     }
//   }, res);
// });

//test if build works

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname + "/build/index.html"));
});

app.listen(PORT || 8000, () => console.log(`server is listening ${PORT}`));
