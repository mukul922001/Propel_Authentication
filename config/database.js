var mysql = require('mysql');
const fs = require('fs');
var con = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
  password: "Server",
  database: "defaultdb",
  
});

var createTableQuery = `
CREATE TABLE IF NOT EXISTS Propel_Users (
  uid INT(11) AUTO_INCREMENT PRIMARY KEY,
  mid INT(11),
  first_name VARCHAR(20),
  last_name VARCHAR(20),
  Userid VARCHAR(20),
  Password VARCHAR(150),
  Salt VARCHAR(60),  -- Adjusting the length to accommodate bcrypt salts
  Token VARCHAR(50),
  firstLogin INT(1),
  allowIps JSON DEFAULT NULL,
  invalidLoginCount INT DEFAULT NULL,
  userType INT CHECK (userType IN (0, 1, 2, 3)),
  use2FactorAuth INT DEFAULT 0,
  Email VARCHAR(50) DEFAULT NULL,
  Mobile VARCHAR(20) DEFAULT NULL,
  Status INT DEFAULT 0
);

`;

con.connect(function(err) {
    if (err){
        console.log("error in connecting to databse");
        return;
    }else{
    console.log("Connected to MySQL!");

    }
    // Execute the SQL query to create the table
    con.query(createTableQuery, function (err, result) {
      if (err) throw err;
      console.log("Table created successfully!");
     // Close the connection
    });
  });

module.exports = con;
