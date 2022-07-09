import {ICommand} from "wokcommands";

export default {
    category: 'testing',
    description: 'replies with pong',
    slash: true,

    callback:({interaction}) => {
        if(interaction){
            interaction.reply({
                content:'pong',
                ephemeral: true,
            });
        }
    }
} as ICommand