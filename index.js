const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
		
        		const reviewCollection = client
							.db('spaCollection')
							.collection('reviews');

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
							app.get('/service/:id',async(req, res) => {
							const id = req.params.id;
							const query = { _id: ObjectId(id) };
								const service = await servicesCollection.findOne(query);
								res.send(service);


							})
		
		app.post('/reviews', async (req, res) => {
			const reviews = req.body;
			const result = await reviewCollection.insertOne(reviews);
			res.send(result);
		});
		
				app.get('/reviews', async (req, res) => {
					let query = {};
					if (req.query.email) {
						query = { email: req.query.email };
					}
					const cursor = reviewCollection.find(query);
					const reviews = await cursor.toArray();
					res.send(reviews);
				});

						app.post('/services', async (req, res) => {
							const services = req.body;
							// console.log(services);
							const result = await servicesCollection.insertOne(services);
							res.send(result);
						});

						
		app.delete('/reviews/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await reviewCollection.deleteOne(query);
			res.send(result);
		});
    }
    finally {
        
    }
}
run().catch(err => console.error(err))

app.listen(port, () => {
    console.log('server is running')
})