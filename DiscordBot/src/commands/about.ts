import {ICommand} from "wokcommands";
import {EmbedField, EmbedFieldData, MessageEmbed} from "discord.js";

// const commands = [{"help": "returns a list of slash actions available"},
//     {"list_public": "returns a list of current public games"},
//     {"ping": "returns with pong if the bot is running. If it is not, please contact <@460056221614080000>"}]
const commands = [
    {name: "help", value: "returns a list of slash actions available"},
    {name: "list_public", value: "returns a list of current public games"},
    {
        name: "ping",
        value: "returns with pong if the bot is running. If it is not, please contact <@460056221614080000>"
    },
]

let response =
    "**Hello, **\n\n" +
    "Here are the following slash commands:\n"

const msg_embed = new MessageEmbed()
    .setColor('#6f3473')
    .setAuthor({
        name: 'UoM TTRPG Discord Bot',
        iconURL: 'https://www.instagram.com/uomttrpg/',
        url: 'https://cdn.discordapp.com/icons/745766881084047510/1315909b9927f71a62eebeeb0c85fdd8.webp'
    })
    .setThumbnail('https://cdn.discordapp.com/icons/745766881084047510/1315909b9927f71a62eebeeb0c85fdd8.webp?')
    .setFooter({
        text: "We hope you enjoy using our Discord bot :)"
    })
    .setTitle("UoM TableTop RolePlaying Society Bot")
    .setDescription("This Discord bot is made by <@460056221614080000>")
// .setFields(commands as EmbedFieldData[])

export default {
    category: 'testing',
    description: 'Information about the bot.',
    slash: true,

    callback: async ({interaction}) => {
        if (interaction) {
            await interaction.reply({
                ephemeral: true,
                embeds: [msg_embed],
            });
        }
    }
} as ICommand