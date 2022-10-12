import "reflect-metadata"
import {DataSource} from "typeorm"
import {Party} from "./entity/Party";
import {User} from "./entity/User";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: `src/data/database.sqlite`,
    entities: [User, Party],
    logging: false,
    synchronize: true,
    migrations: [],
    subscribers: [],
})
