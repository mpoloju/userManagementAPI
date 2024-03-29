const express = require('express');
const app = express();
const port = process.env.PORT || 6800;
const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const bodyParser = require('body-parser');  
const cors = require('cors');
const mongourl = "mongodb+srv://mpoloju:Mongo296052@cluster0.vtpnh.mongodb.net";
const swaggerUi = require('swagger-ui-express');
const package = require('./package.json');
const swaggerDocument = require('./swagger.json');

swaggerDocument.info.version = package.version;
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

let db;
let col_name = "febuser";

//middleware
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());


app.get('/health', (req, res) => {
    res.status(200).send('Health Ok')
})

//Read 
app.get('/users', (req, res) => {
    let query = {};
    if(req.query.city && req.query.role) {
        query = {city:req.query.city, role:req.query.role, isActive:true}
    } else if(req.query.city) {
        query = {city:req.query.city, isActive:true}
    } else if(req.query.name) {
        query = {name:req.query.name, isActive:true}
    } else if(req.query.role) {
        query = {role:req.query.role, isActive:true}
    } else if(req.query.isActive) {
        let isActive = req.query.isActive;
        if(isActive == "false") {
            isActive = false;
        } else {
            isActive = true;
        }
        query = {isActive};
    } else {
        query = {isActive:true}
    }
    db.collection(col_name).find(query).toArray((err, result) => {
        if (err) throw err;
        res.status(200).send(result);
    })
})

//find particular users
app.get('/user/:id', (req, res) => {
    let id = mongo.ObjectId(req.params.id);
    db.collection(col_name).find({_id:id}).toArray((err, result) => {
        if(err) throw err;
        res.status(200).send(result);
    })
})

//deactivate particular users
app.put('/deactivateOneUser/:id', (req, res) => {
    let id = mongo.ObjectId(req.params.id);
    db.collection(col_name).update({_id:id}, {
        $set:{
            isActive:false
        }
    },(err, result) => {
        if(err) throw err;
        res.status(200).send(`User deactivated`);
    })
});

//update users
app.put('/updateUser', (req, res) => {
    db.collection(col_name).updateOne({_id:mongo.ObjectId(req.body._id)},
    {
        $set:{
            name: req.body.name,
            city: req.body.city,
            phone: req.body.phone,
            role: req.body.role,
            isActive: true
        }
    }, (err, result) => {
        if(err) throw err;
        res.status(200).send('data updated');
    })
})

//add user > post
app.post('/addUser', (req, res) => {
    //console.log(req.body);
    db.collection(col_name).insertOne(req.body, (err, result) => {
        if (err) throw err;
        res.status(200).send('User added');
    })
});

//hard delete

app.delete('/deleteUser', (req, res) => {
    db.collection(col_name).deleteOne({_id:mongo.ObjectId(req.body._id)}, (err, result) => {
        if(err) throw err;
        res.status(200).send('User deleted');
    })
});

//activate
app.put('/activateUser', (req, res) => {
    db.collection(col_name).updateOne({_id:mongo.ObjectId(req.body._id)},
    {
        $set:{

            isActive: true
        }
    }, (err, result) => {
        if(err) throw err;
        res.status(200).send('User activated');
    })
});

//soft delete(deactivate)
app.put('/deactivateUser', (req, res) => {
    db.collection(col_name).updateOne({_id:mongo.ObjectId(req.body._id)},
    {
        $set:{

            isActive: false,
        }
    }, (err, result) => {
        if(err) throw err;
        res.status(200).send('User deactivated');
    })
});


//DB connection

MongoClient.connect(mongourl, (err, client) => {
    if(err) console.error('Error while connecting');
    db = client.db('febnode22');
    app.listen(port, (err) => {
        console.log(`App running on port ${port}`);
    });
})