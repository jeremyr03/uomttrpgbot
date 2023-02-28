import "reflect-metadata"
import {DataSource} from "typeorm"
import {Party} from "./entity/Party";
import {User} from "./entity/User";
import dotenv from "dotenv";

dotenv.config()
export const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.HOST,
    // port:parseInt(process.env.PORT) || 3306,
    database:process.env.DATABASE,
    username:process.env.USR,
    password:process.env.PASSWORD,
    entities: [User, Party],
    logging: false,
    synchronize: true,
    migrations: [],
    subscribers: [],
})
