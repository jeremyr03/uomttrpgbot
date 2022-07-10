import {Client, Collection, CommandInteraction, Intents} from 'discord.js'
import dotenv from 'dotenv'
import path from "node:path";
import fs from "node:fs";
import {Routes} from "discord-api-types/v9";
import {REST} from "@discordjs/rest";

dotenv.config()
const TOKEN = process.env['TOKEN'] || '';
const TEST_GUILD_ID = process.env['TEST_GUILD_ID'];

// setting up client
const client:{[key: string]: any} = new Client({ // {[key: string]: any} to add .commands to client
    intents:[
        Intents.FLAGS.GUILDS
    ]
})

// getting all commands
const commands: any[] = [];
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.ts'));
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command.data.toJSON());
    client.commands.set(command.data.name, command);
}

client.on('ready', () => {
    // refreshing commands
    const rest = new REST({ version: '9' }).setToken(TOKEN);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            if (!TEST_GUILD_ID){
                await rest.put(
                    Routes.applicationCommands(client.user?.id || ''),
                    { body: commands },
                );
            }else {
                await rest.put(
                    Routes.applicationGuildCommands(TEST_GUILD_ID, client.user?.id || ''),
                    { body: commands },
                );
            }

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
})

client.on('interactionCreate', async (interaction: CommandInteraction) => {
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    if (!command) return;
    try {
        await command.execute(interaction);
    } catch (error) {
        if (error) console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

client.login(TOKEN)
