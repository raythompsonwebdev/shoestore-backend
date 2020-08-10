import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const app = express();

app.use(express.static(path.join(__dirname, '/build')));
app.use(bodyParser.json());

const withDB = async (operations ,res) => {
    try {
        const client = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true, useUnifiedTopology: true , user:'rayThompWeb', password:'Mu!a8een100'});
        const db = client.db('shoestore'); // name of database

        await operations(db);

        client.close();
    } catch (err) {
        res.status(500).send({ message: 'Database Error', err });
    }
}

// app.get('/hello', (req, res) => res.send('Hello!'));
// app.post('/hello', (req, res) => res.send(`Hello ${req.body.name}!`));
// app.get('/hello/:name', (req, res) => res.send(`Hello ${req.params.name}!`));

app.get('/api/product/:name', async (req, res) => {
    const productName = req.params.name;
    await withDB(async db => {
        const productsInfo = await db.collection('products').findOne({ name: productName });
        res.status(200).json(productsInfo); //use json instead of send
    }, res);
});

app.post('/api/product/:name/likes', async (req, res) => {
    const productName = req.params.name;

    //productsInfo[productName].likes += 1
    //res.status(200).send(`${productName} now has ${productsInfo[productName].likes} likes`)

    await withDB(async db => {
        const productsInfo = await db.collection('products').findOne({ name: productName });
        await db.collection('products').updateOne({ name: productName }, { '$set': {
            likes: productsInfo.likes + 1,
        }});
        const updatedProductInfo = await db.collection('products').findOne({ name: productName });
        res.status(200).json(updatedProductInfo);
    } ,res);
    
});

// app.post('/api/product/:name/add-comment', async (req, res) => {

//     const productName = req.params.name;
//     const newComment = req.body.comment;

//     await withDB(async (db) => {
//         const productsInfo = await db.collection('products').findOne({ name: productName });
//         await db.collection('products').updateOne({ name: productName }, { '$set': {
//             comments: productsInfo.comments.concat(newComment),
//         }});
//         const updatedProductInfo = await db.collection('products').findOne({ name: productName });
//         res.status(200).json(updatedProductInfo);
//     }, res);
// });

app.get('*', (req, res) =>{
    res.sendFile(path.join(__dirname + '/build/index.html'));
});

app.listen(8000, () => console.log('Server is listening on port 8000'));

