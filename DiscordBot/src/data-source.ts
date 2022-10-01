import "reflect-metadata"
import {DataSource} from "typeorm"
import {TestParty} from "./entity/TestParty";
import {TestUser} from "./entity/TestUser";

export const AppDataSource = new DataSource({
    type: "sqlite",
    database: `src/data/database.sqlite`,
    entities: [TestUser, TestParty],
    logging: false,
    synchronize: true,
    migrations: [],
    subscribers: [],
})
