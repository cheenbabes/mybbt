var express = require("express");
var moment = require("moment");
moment().format();
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "contacts";

var app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
var distDir = __dirname + "/dist/";
app.use(express.static(distDir));

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/test", function (err, client) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = client.db();
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/api/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/api/contacts", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get contacts.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/api/contacts", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!req.body.name) {
    handleError(res, "Invalid user input", "Must provide a name.", 400);
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new contact.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/api/contacts/:id"
 *    GET: find contact by id
 *    PUT: update contact by id
 *    DELETE: deletes contact by id
 */

app.get("/api/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get contact");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/api/contacts/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update contact");
    } else {
      updateDoc._id = req.params.id;
      res.status(200).json(updateDoc);
    }
  });
});

app.delete("/api/contacts/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete contact");
    } else {
      res.status(200).json(req.params.id);
    }
  });
});


//ACTUAL SERVER.JS CODE ==== THESE ARE THE REAL ROUTES FOR THE APP
function getSum(array){
  return array.map((record) => {
    return record.Remittance;
  }).reduce((a,b) => {
    return a + b;
  }, 0);
}

var REMITTANCE_COLLECTION = "remittance";
app.get("/api/remittances", function(req, res) {
  db.collection(REMITTANCE_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get remittance.");
    } else {
      return res.status(200).json({
        data: doc,
        sum: getSum(doc),
        max: Math.max(...doc.map(o => o.Remittance))
      });
    }
  });
});

app.get("/api/remittances/temple/:temple", function(req, res) {
  db.collection(REMITTANCE_COLLECTION).find({ "Temple": req.params.temple}).toArray(function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get temple");
    } else {
      return res.status(200).json({
        data: doc,
        sum: getSum(doc),
        max: Math.max(...doc.map(o => o.Remittance))
      });
    }
  });
});

app.get("/api/remittances/year/:year/:temple", function(req, res){
  db.collection(REMITTANCE_COLLECTION)
  .find({"Temple": req.params.temple, "Year": parseInt(req.params.year)})
  .toArray(function(err, doc){
    if (err) {
      handleError(res, err.message, "Failed to get yearly data for temple");
    } else {
      return res.status(200).json({
        data: doc,
        sum: getSum(doc),
        max: Math.max(...doc.map(o => o.Remittance))
      });
    }
  });
});

app.get("/api/remittances/year/:year", function(req, res){
  db.collection(REMITTANCE_COLLECTION)
  .find({"Temple": req.params.temple, "Year": parseInt(req.params.year)})
  .toArray(function(err, doc){
    if (err) {
      handleError(res, err.message, "Failed to get yearly data");
    } else {
      return res.status(200).json({
        data: doc,
        sum: getSum(doc),
        max: Math.max(...doc.map(o => o.Remittance))
      });
    }
  });
});

app.get("/api/remittances/gbc/:gbc", function(req, res) {
    db.collection(REMITTANCE_COLLECTION).find({ "GBC": req.params.gbc}).toArray(function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get GBC");
      } else {
        return res.status(200).json({
          data: doc,
          sum: getSum(doc),
          max: Math.max(...doc.map(o => o.Remittance))
        });
      }
    });
  });

  app.get("/api/remittances/:year/:month", function(req, res) {
    db.collection(REMITTANCE_COLLECTION).find({ "Year": parseInt(req.params.year), "Month": req.params.month}).toArray(function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get monthly data");
      } else {
        return res.status(200).json({
          data: doc,
          sum: getSum(doc),
          max: Math.max(...doc.map(o => o.Remittance))
        });
      }
    });
  });

  app.get("/api/remittances/:year/:month/:temple", function(req, res){
    db.collection(REMITTANCE_COLLECTION)
    .find({"Temple": req.params.temple, "Month": req.params.month, "Year": parseInt(req.params.year)})
    .toArray(function(err, doc){
      if (err) {
        handleError(res, err.message, "Failed to get monthly data");
      } else {
        return res.status(200).json({
          data: doc,
          sum: getSum(doc),
          max: Math.max(...doc.map(o => o.Remittance))
        });
      }
    });
  });


  app.get("/api/remittances/history", function(req, res){
    if(!req.query.months || isNaN(req.query.months)){
      handleError(res, "No month lookback supplied or not a number", "Failed to get historical data");
    }

    let startDate = moment().startOf('month').subtract(req.query.months, 'months');
    let filteredByDate;
    let final;
    let ret = {};

    //Simplify to call the API only once, then filter here on the server
    db.collection(REMITTANCE_COLLECTION).find({}).toArray(function(err, doc){
      if(err){
        handleError(res, err.message, "Failed to get all the data from the db");
      }else{
          filteredByDate = doc.filter(record => {
          let recordDate = moment().year(record.Year).month(record.Month);
          return recordDate.isAfter(startDate);
        });
      }
      if(req.query.location && req.query.location !== ""){
          final = filteredByDate.filter(record =>{
          return record.Temple === req.query.location;
        });
        ret.data = final;
      }else{
        ret.data = filteredByDate;
      }

      let total = ret.data.map(record => {
        return record.Remittance;
      }).reduce((a,b) => {
        return a+b;
      }, 0)

      ret.sum = total;
      res.status(200).json(ret);
    });
  });

  
  app.get("/api", function(req, res){
    let ret =[];
    app._router.stack.forEach(function(r){
      if (r.route && r.route.path){
        ret.push(r.route.path);
      }
    });
    res.status(200).json(ret);
  });