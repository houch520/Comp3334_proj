console.log("initialize db_connection module");
var mysql = require('mysql');
module.exports.dbconnection = () => {
    return new Promise((resolve, reject)=>{
        var con = mysql.createConnection({
            connectionLimit:100,
            host: "localhost",
            user: "root",
            password: "",
            database: "comp3334_g38"
        });
        con.connect((err)=>{
            if (err) throw err;
            console.log("Connected");
            resolve(con);
        })
    })
}
module.exports.closeConnection = (connection)=>{
    connection.destroy();
    console.log("Disonnected");
}