var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "comp3334_g38"
});

con.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});


//close connection
/*
con.end(function(err){
    if (err){return console.log('error:'+err.message);}
    console.log("Database connection closed");
});*/