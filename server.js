var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var REMITTANCE_COLLECTION = "remittance";

var app = express();
app.use(bodyParser.json());

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

//API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}




app.get("/api/remittances", function(req, res) {
  db.collection(REMITTANCE_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get remittance.");
    } else {
      res.status(200).json(docs);
    }
  });
});

/*
// THIS IS A TEST ROUTE THAT SHOULD NOT BE EXPOSED

function validateInput(r){
    return!!r.Temple && !!r.GBC && !!r.Remittance && !!r.Month && !!r.Year; 
}


app.post("/api/remittances", function(req, res) {
  var newContact = req.body;
  newContact.createDate = new Date();

  if (!validateInput(req.body.remittance)) {
    handleError(res, "Invalid user input", "You must provide a temple, GBC, remittance amount, month, and year", 400);
  }

  db.collection(REMITTANCE_COLLECTION).insertOne(newContact, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new remittance entry.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});
**/

app.get("/api/remittances/temple/:temple", function(req, res) {
  db.collection(REMITTANCE_COLLECTION).find({ "Temple": req.params.temple}).toArray(function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get temple");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.get("/api/remittances/gbc/:gbc", function(req, res) {
    db.collection(REMITTANCE_COLLECTION).find({ "GBC": req.params.gbc}).toArray(function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get GBC");
      } else {
        res.status(200).json(doc);
      }
    });
  });

  app.get("/api/remittances/:year/:month", function(req, res) {
    db.collection(REMITTANCE_COLLECTION).find({ "Year": parseInt(req.params.year), "Month": req.params.month}).toArray(function(err, doc) {
      if (err) {
        handleError(res, err.message, "Failed to get monthly data");
      } else {
        res.status(200).json(doc);
      }
    });
  });
