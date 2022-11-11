const express = require('express');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const cors = require('cors')
const app = express();
const port = process.env.Port || 5000;

// use Middle ware

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('server is running on port')
})

// connection mongodb

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.d0mpqsd.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


		function verifyJWT (req, res, next){
			const authHeader = req.headers.authorization;
			if (!authHeader) {
				res.status(401).send({message: 'unauthorized access'})
			}
			const token = authHeader.split(' ')[1];
			jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
				// console.log(decoded , err);
				if (err) {
					// console.log(err);

				res.status(401).send({message: 'unauthorized access'})
				}
				req.decoded = decoded
				next();
			})
			// console.log(token)
 		}

async function run() {
    try {
			const servicesCollection = client
				.db('spaCollection')
				.collection('services');

			const reviewCollection = client.db('spaCollection').collection('reviews');

			app.post('/jwt', (req, res) => {
				const user = req.body;
				// console.log(user);
				const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
					expiresIn: '1d',
				});
				res.send({ token });
			});

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
			app.get('/service/:id', async (req, res) => {
				const id = req.params.id;
				const query = { _id: ObjectId(id) };
				const service = await servicesCollection.findOne(query);
				res.send(service);
			});

			//! Review Post....
			app.post('/reviews', async (req, res) => {
				const reviews = req.body;
				const result = await reviewCollection.insertOne(reviews);
				res.send(result);
			});

			app.get('/reviews', verifyJWT, async (req, res) => {
				const decoded = req.decoded.email;
				const userEmail = req.query.email;
				console.log(userEmail, decoded);

				if (decoded !== userEmail) {
					res.status(403).send({ message: 'Forbidden access' });
				}

				if (req.query.email) {
					const query = { email: userEmail };
					const cursor = reviewCollection.find(query);
					const reviews = await cursor.toArray();
					res.send(reviews);
				}
			});

			app.post('/services', async (req, res) => {
				const services = req.body;
				// console.log(services);
				const result = await servicesCollection.insertOne(services);
				res.send(result);
			});

			app.get('/reviews/:id', async (req, res) => {
				const id = req.params.id;
				const query = { ServiceId: id };
				const cursor = reviewCollection.find(query);
				const reviews = await cursor.toArray();
				res.send(reviews);
			});

			app.delete('/reviews/:id', async (req, res) => {
				const id = req.params.id;
				const query = { _id: ObjectId(id) };
				const result = await reviewCollection.deleteOne(query);
				res.send(result);
			});
			app.put('/reviews', verifyJWT, async (req, res) => {
				const userEmail = req.query.email;
				const updatedId = req.query.id;
				const currentReview = req.body.status;
				console.log(userEmail, updatedId, currentReview);

				const decoded = req.decoded.email;
				if (decoded !== userEmail) {
					res.status(403).send({ message: 'Forbidden access' });
				}
				console.log(currentReview);
				const query = { _id: ObjectId(updatedId) };

				const updateDoc = {
					$set: {
						message: currentReview,
					},
				};
				const result = await reviewCollection.updateOne(query, updateDoc);
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