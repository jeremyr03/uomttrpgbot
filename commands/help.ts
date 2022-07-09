import {ICommand} from "wokcommands";
import {MessageEmbed} from "discord.js";

let response =
    "**Hello, **\n\n" +
    "Here are the following slash commands:\n" +
    "```/help - returns a list of slash actions available```"

export default {
    category: 'testing',
    description: 'Creates a list of possible slash functions.',
    slash: true,

    callback:({interaction}) => {
        if(interaction){
            interaction.reply({
                // content: response,
                embeds: [new MessageEmbed().setDescription(response)],
            });
        }
    }
} as ICommand