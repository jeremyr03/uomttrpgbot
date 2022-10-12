import {ICommand} from 'wokcommands';
import {AppDataSource} from "../data-source";
import DiscordJS from 'discord.js';
import {Party} from "../entity/Party";

export default {
    category: 'DM',
    description: 'Create a game',
    slash: true,
    // arguments
    options: [
        {
            name: 'name',
            description: 'Write the name of your game.',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'description',
            description: 'Write a description of what your game is about',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'level',
            description: 'State the level that you will be starting at (if your game is level-based, else put 0)',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            minValue: 0,
            maxValue: 2147483647,
        },
        {
            name: 'beginner-friendly',
            description: 'Is your game beginner friendly? (default: yes)',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            choices: [
                {
                    name: "yes",
                    value: 1,
                },
                {
                    name: "no",
                    value: 0,
                }
            ],
        },
        {
            name: 'when',
            description: 'The timing of when it is being run (time, day, if it\'s reccuring, how many times a week/month etc.)',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'trigger-warnings',
            description: 'State any trigger warnings your game may have',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'additional-info',
            description: 'Write any additional information your players should know about here (specific timings etc.)',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        }
    ],

    callback: async ({interaction, user}) => {
        try {
            const details = {
                name: interaction.options.getString('name')?.slice(0, 256),
                description: interaction.options.getString('description')?.slice(0, 1000),
                beginner_friendly: !!interaction.options.getNumber('beginner-friendly'),
                level: interaction.options.getNumber('level'),
                when: interaction.options.getString('when')?.slice(0, 1000),
                additional_info: interaction.options.getString('additional-info')?.slice(0, 1000),
                author: user.id,
                tw: interaction.options.getString('trigger-warnings')?.slice(0, 1000) ?? null,
            } as Party;
            await AppDataSource.manager.getRepository(Party).save(details)
            await interaction.reply({
                content: `Party added **${details.name}**`,
                ephemeral: true,
            })

        } catch (error) {
            console.log(error)
            await interaction.reply({
                // content: `Party added ${details['name']}\n${inserts}`,
                content: `Something went wrong.\n${error.code} \nPlease try again :)`,
                ephemeral: true,
            })
        }
    }
} as ICommand