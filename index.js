const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const cors = require('cors')
const app = express();
const port = process.env.Port || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('server is running on port')
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d0mpqsd.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        		const servicesCollection = client
							.db('spaCollection')
							.collection('services');

						app.get('/services', async (req, res) => {
							const query = {};
							const cursor = servicesCollection.find(query);
							const services = await cursor.toArray();
							res.send(services);
						});
		
						app.get('/service', async (req, res) => {
							const query = {};
							const cursor = servicesCollection.find(query);
							const services = await cursor.limit(3).toArray();
							res.send(services);
						});
    }
    finally {
        
    }
}
run().catch(err => console.error(err))

app.listen(port, () => {
    console.log('server is running')
})