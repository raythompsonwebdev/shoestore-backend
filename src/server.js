import express from "express";
import "dotenv/config";
import { MongoClient, ServerApiVersion } from "mongodb";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { hashPassword, comparePassword } from "./hashPassword.js";
import { generateToken } from "./jwt.js";
// import { auth } from "express-openid-connect";
// import morgan from "morgan";
// import helmet from "helmet";
// import sanitize from 'mongo-sanitize'
//set up file paths for static files - updated
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 8000;
const baseUrl = process.env.AUTH0_BASE_URL;

const app = express();
//json parser
app.use(express.json());

//for parsing cookies
app.use(cookieParser(process.env.AUTH0_SECRET));

// app.use(morgan("dev"));
// app.use(
//   helmet({
//     contentSecurityPolicy: false,
//   })
// );

// Cross Origin Resource Sharing
const whitelist = [baseUrl];
//cors options
const corsOptions = {
  origin: whitelist,
  methods: ["GET", "POST"],
  credentials: true,
};

app.use(cors(corsOptions));

// limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply the rate limiting middleware to all requests
app.use(limiter);

// for parsing application/xwww-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Middleware to make the `user` object available for all views
// app.use(function (req, res, next) {
//   res.locals.user = req.oidc.user;
//   next();
// });

// const config = {
//   authRequired: false,
//   auth0Logout: true,
//   secret: process.env.AUTH0_CLIENT_SECRET,
//   baseURL: process.env.AUTH0_BASE_URL,
//   clientID: process.env.AUTH0_CLIENT_ID,
//   issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
// };

// auth router attaches /login, /logout, and /callback routes to the baseURL
// app.use(auth(config));

// Middleware to make the `user` object available for all views
// app.use(function (req, res, next) {
//   res.locals.user = req.oidc.user;
//   next();
// });

//static paths for images, fonts etc in build folder
app.use(express.static(path.join(__dirname, "static")));

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.aqewv.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=Cluster0`;

const uri =
  "mongodb://127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+2.1.4";

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

await client.connect();
// Send a ping to confirm a successful connection
await client.db("admin").command({ ping: 1 });
console.log("Pinged your deployment. You successfully connected to MongoDB!");

const db = client.db("shoestore");

// app.get("/profile", (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
// });

// app.get("/cart", (req, res) => {
//   res.send(req.oidc.isAuthenticated() ? "Logged in" : "Logged out");
// });

// get all products
app.get("/api/products", async (req, res) => {
  try {
    const productsInfo = await db.collection("products").find({}).toArray();

    if (productsInfo.length > 0) {
      console.log(`${productsInfo.length} customers found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No customers found`);
    }
    res.status(200).json(productsInfo); //use json instead of send
  } catch (err) {
    res.status(400).json({ Error: err });
  }
});

// get search bar options data
app.get("/api/searchbardata", async (req, res) => {
  try {
    const searchbarInfo = await db
      .collection("searchBarData")
      .find({})
      .toArray();

    if (searchbarInfo.length > 0) {
      console.log(`${searchbarInfo.length} search data found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No search data found`);
    }

    res.status(200).json(searchbarInfo); //use json instead of send
  } catch (err) {
    res.status(400).json({ Error: err });
  }
});

// get select options data
app.get("/api/selectdata", async (req, res) => {
  try {
    const selectbarInfo = await db
      .collection("selectBarData")
      .find({})
      .toArray();

    if (selectbarInfo.length > 0) {
      console.log(`${selectbarInfo.length} select data found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No select data found`);
    }
    res.status(200).json(selectbarInfo); //use json instead of send
  } catch (err) {
    res.status(400).json({ Error: err });
  }
});

// get select accordion data
app.get("/api/accordiondata", async (req, res) => {
  try {
    const accordionInfo = await db
      .collection("accordianData")
      .find({})
      .toArray();

    if (accordionInfo.length > 0) {
      console.log(`${accordionInfo.length} select data found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No select data found`);
    }
    res.status(200).json(accordionInfo); //use json instead of send
  } catch (err) {
    res.status(400).json({ Error: err });
  }
});

//// get product by name
app.get("/api/product/:name", async (req, res) => {
  try {
    const productName = req.params.name;

    const productsInfo = await db
      .collection("products")
      .findOne({ name: productName });

    res.status(200).json(productsInfo); //use json instead of send
  } catch (err) {
    res.status(400).json({ Error: err });
  }
});

// add likes to products
app.post("/api/product/:name/likes", async (req, res) => {
  try {
    const productName = req.params.name;

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
    res.status(400).json({ Error: err });
  }
});

// get cart items
app.get("/api/cartitems", async (req, res) => {
  try {
    const getcartItems = await db.collection("cartItems").find({}).toArray();

    if (getcartItems.length > 0) {
      console.log(`${getcartItems.length} item(s) found`);
      // Here you could build your html or put the results in some other data structure you want to work with
    } else {
      console.log(`No item(s) found`);
    }
    //return results
    res.status(200).json(getcartItems); //use json instead of send
    // Process the results;
  } catch (err) {
    res.status(400).json({ Error: err });
  }
});

// register users
app.post("/api/register", async (req, res) => {
  console.log(req.body);
  try {
    const newUser = req.body;
    newUser.password = await hashPassword(req.body.password);
    await db.collection("users").insertOne(newUser, (err, user) => {
      if (err) {
        return res.status(400).send({
          message: err,
        });
      } else {
        newUser.password = undefined;
        return res.json(user);
      }
    });
  } catch (err) {
    res.status(400).json({ Error: err });
  }
});

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    // confirm if user email already exists.
    const user = await db.collection("users").findOne({ useremail: email });

    console.log(user, password);

    if (user !== null) {
      //PASSWORD CHECK - using sync method to compare - will try aync method
      const validPassword = comparePassword(password, user.password);
      if (!validPassword) {
        return res.status(400).json({ error: "Incorrect password" });
      }
      const userInfo = {
        user_id: user._id,
        username: user.name,
        email: user.useremail,
      };
      generateToken(res, userInfo); //generate token and signed cookie
      res.status(200).json({ message: "User found" });
    }
  } catch (err) {
    res.status(401).json({ message: "User doesn't exist" });
  }
});

// login user route
app.post("/api/logout", async (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });

  return res.status(200).json({ loggedIn: false, message: "user logged out" });
});

app.post("/api/addcartitems", async (req, res) => {
  const cartResults = req.body.cartItems;

  const cartUserId = req.body.user;

  // const useremail = sanitize(cartUserId.email)

  try {
    const updatedUser = await db
      .collection("users")
      .findOne({ email: useremail });

    //console.log(productsInfo)
    //console.log("db cart items------------------------")

    // The optional chaining operator (?.)-fixes object is possible null error for productsInfo variable. The non-null assertion operator (!.) or the nullish coalescing operator (??) & if (typeof myName === 'string').

    await db
      .collection("users")
      .updateMany({}, { $set: { cartitems: cartResults } }, { upsert: true });

    // const updatedProductInfo = await db
    //   .collection('cartItems')
    //   .findOne({ product })

    res.status(200).json({ updatedUser });
    ///res.status(200).json(updatedProductInfo)
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err });
  }
});

//Catch 404 and forward to error handler
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
