import {AppDataSource} from "./data-source";
import DiscordJS, {Intents} from 'discord.js';
import dotenv from 'dotenv';
import WOKCommands from "wokcommands";
import path from "path";

dotenv.config()
AppDataSource.initialize().then(async () => {
    console.log("Server up and running!")

}).catch(error => console.log(error))

const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES
    ]
})

client.on('ready', () => {
    const wok = new WOKCommands(client, {
        commandsDir: path.join(__dirname, 'commands'),
        typeScript: true,
        ephemeral: true,
        testServers: ['906922951205597214', '838740199927709757']
    });
})

client.login(process.env.TOKEN).then(async () => {
    console.log("logged in")
    // await client.application.commands.set([])
    // console.log("all removed")
})
