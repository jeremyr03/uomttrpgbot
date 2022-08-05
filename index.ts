import DiscordJS, {Intents} from 'discord.js'
import dotenv from 'dotenv'
import WOKCommands from "wokcommands";
import path from "path";
// import {conn} from './database';
dotenv.config()
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

client.login(process.env.TOKEN)
