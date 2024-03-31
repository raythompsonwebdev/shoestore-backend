import "dotenv/config";
import express from "express";
import { MongoClient } from "mongodb";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
// import morgan from "morgan";
// import helmet from "helmet";
//set up file paths for static files - updated
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;
const baseUrl = process.env.AUTH0_BASE_URL;

const app = express();
//json parser
app.use(express.json());

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// for parsing cookies
app.use(cookieParser(process.env.AUTH0_SECRET));

// app.use(morgan("dev"));
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );

// cors
app.use(cors({ origin: baseUrl }));

// Middleware to make the `user` object available for all views
app.use(function (req, res, next) {
  res.locals.user = req.oidc.user;
  next();
});

//static paths for images, fonts etc in build folder
app.use(express.static(path.join(__dirname, "static")));

//main connect to mongo db
const withDB = async (operations, res) => {
  try {
    // const client = await MongoClient.connect(
    //   process.env.DB_USER && process.env.DB_PASS
    //     ? `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aqewv.mongodb.net/${process.env.DB_DATA}?retryWrites=true&w=majority`
    //     : `mongodb://localhost:27017/?readPreference=primary&appname=MongoDB%20Compass&ssl=false`,
    //   { useNewUrlParser: true, useUnifiedTopology: true }
    // );

    const client = await MongoClient.connect(
      "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.4"
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

  // connect to mongo db
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

// get cart items
app.get("/api/cartitems", async (req, res) => {
  //connect to mongo db
  await withDB(async (db) => {
    const getcartItems = await db.collection("cartItems").find({});
    const results = await getcartItems.toArray();
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

// register users
app.post("/api/register", async (req, res) => {
  console.log(req.body);

  // await withDB(async (db) => {
  //   try {
  //     const newUser = req.body;
  //     newUser.hashPassword = bcrypt.hashSync(req.body.password, 10);
  //     await db.collection("users").insertOne(newUser, (err, user) => {
  //       if (err) {
  //         return res.status(400).send({
  //           message: err,
  //         });
  //       } else {
  //         user.hashPassword = undefined;
  //         return res.json(user);
  //       }
  //     });
  //   } catch (err) {
  //     console.log(err);
  //   }
  // }, res);
});

// Catch 404 and forward to error handler
// app.use(function (req, res, next) {
//   const err = new Error("Not Found");
//   err.status = 404;
//   next(err);
// });

// // Error handlers
// app.use(function (err, req, res, next) {
//   res.status(err.status || 500);
//   res.send("error", {
//     message: err.message,
//     error: process.env.NODE_ENV !== "production" ? err : {},
//   });
// });

app.listen(PORT || 8000, () => console.log(`server is listening ${PORT}`));
