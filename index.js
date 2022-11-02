const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
require('dotenv').config();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
	res.send('Genius Car Services Server Running');
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.z9hjm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const run = async () => {
	try {
		const database = client.db('geniusCar');
		const servicesCollection = database.collection('services');
		const ordersCollection = database.collection('orders');

		app.get('/services', async (req, res) => {
			const query = {};
			const cursor = servicesCollection.find(query);
			const services = await cursor.toArray();
			res.send(services);
		});

		app.get('/services/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const service = await servicesCollection.findOne(query);
			res.send(service);
		});

		app.get('/orders', async (req, res) => {
			const uid = req.query.uid;
			let query = {};
			if (uid) {
				query = {
					customer_uid: uid,
				};
			}
			const cursor = ordersCollection.find(query);
			const orders = await cursor.toArray();
			res.send(orders);
		});

		app.delete('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const query = { _id: ObjectId(id) };
			const result = await ordersCollection.deleteOne(query);
			res.send(result);
		});

		app.post('/orders', async (req, res) => {
			const order = req.body;
			const result = await ordersCollection.insertOne(order);
			res.send(result);
		});

		app.patch('/orders/:id', async (req, res) => {
			const id = req.params.id;
			const status = req.body.status;
			const query = { _id: ObjectId(id) };
			const updatedOrder = {
				$set: {
					status: status,
				},
            };
            const result = await ordersCollection.updateOne(query, updatedOrder)
            res.send(result)
		});
	} finally {
	}
};
run().catch((err) => console.log(err));
app.listen(port, () => {
	console.log('Genius Car Server Running');
});
