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
    .setTitle("List of commands")
    .setDescription("Here are the following slash commands, along with a description of what they do:\n\n\n")
    .setFields(commands as EmbedFieldData[])

// commands.map(value => msg_embed.setFields(value))

export default {
    category: 'Help',
    description: 'Information about how to use the bot.',
    slash: true,

    callback: async ({interaction}) => {
        if (interaction) {
            await interaction.reply({
                // content: response,
                embeds: [msg_embed],
            });
        }
    }
} as ICommand