import {ICommand} from "wokcommands";
import {Message} from "discord.js";

export default {
    category: 'testing',
    description: 'replies with pong',
    slash: true,
    testOnly: true,

    callback: async ({interaction}) => {
        let msg: Message;
        msg = await interaction.reply({
            content:'pong',
            // ephemeral: true,
            fetchReply:true,
        }) as Message;
    }
} as ICommand