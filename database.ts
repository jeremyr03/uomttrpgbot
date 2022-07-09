// Create connection to database
import dotenv from 'dotenv'
const mysql = require("mysql");
dotenv.config()

const config = {
    host: "localhost",
    port:3306,
    user: "root",
    password: '',
    database: process.env.DATABASE,

};

// let conn = new mysql.createConnection(config);
export const conn = new mysql.createConnection(config);
conn.connect(
    function (err: any) {
        if (err) {
            console.log("!!! Cannot connect !!! Error:");
            throw err;
        }
        else
        {
            console.log("Connection to database established.");
        }
    });

export default {conn: conn}
