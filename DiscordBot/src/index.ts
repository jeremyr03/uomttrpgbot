import { AppDataSource } from "./data-source";
import { User } from "./entity/User";
import DiscordJS, {Intents} from 'discord.js';
import dotenv from 'dotenv';
import WOKCommands from "wokcommands";
import path from "path";
import {Test3} from "./entity/Test3";
import DateTime from "datetime-js";
import {TestUser} from "./entity/TestUser";

dotenv.config()
AppDataSource.initialize().then(async () => {

    // console.log("Inserting a new user into the database...")
    // const user = new TestUser()
    // user.firstName = "Timber"
    // user.lastName = "Saw"
    // user.age = 25
    // await AppDataSource.manager.save(user)
    // console.log("Saved a new user with id: " + user.id)
    // const user2 = new Test3()
    // user2.name = "Test Party"
    // user2.author = "2345678"
    // user2.datetime = new Date().toISOString().slice(0, 19).replace('T', ' ');
    // await AppDataSource.manager.save(user2)
    // console.log("Saved a new user with id: " + user2.id)
    //
    // console.log("Loading users from the database...")
    // const users = await AppDataSource.manager.find(User)
    // console.log("Loaded users: ", users)
    // const users2 = await AppDataSource.manager.find(Test3)
    // console.log("Loaded users: ", users2)

    console.log("Here you can setup and run express / fastify / any other framework.")

}).catch(error => console.log(error))

const client = new DiscordJS.Client({
    intents:[
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

client.on('ready', () => {
    new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        typeScript: true,
        ephemeral: true,
        testServers: ['906922951205597214', '838740199927709757']
    })
        .setDefaultPrefix('£');
})

client.login(process.env.TOKEN).then(() =>{
    console.log("logged in")
})
