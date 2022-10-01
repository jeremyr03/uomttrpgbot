import {ICommand} from "wokcommands";
import {MessageEmbed} from "discord.js";

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

export default {
    category: 'About',
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