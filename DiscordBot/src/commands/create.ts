import {ICommand} from 'wokcommands';
import {AppDataSource} from "../data-source";
import moment from 'moment';
import DiscordJS from 'discord.js';
import {TestParty} from "../entity/TestParty";
// import {Time} from "Datetime"


export default {
    category: 'Create',
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
            minValue:0,
            maxValue:2147483647,
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
            name: 'day',
            description: 'State the day that you will be playing',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            choices:[
                {
                    name: "Monday",
                    value: 1,
                },
                {
                    name: "Tuesday",
                    value: 2,
                },
                {
                    name: "Wednesday",
                    value: 3,
                },
                {
                    name: "Thursday",
                    value: 4,
                },
                {
                    name: "Friday",
                    value: 5,
                },
                {
                    name: "Saturday",
                    value: 6,
                },
                {
                    name: "Sunday",
                    value: 7,
                },
            ]
        },
        {
            name: 'time',
            description: 'State the time you will be playing',
            required: false,
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
        // add some time validation here
        let time = new Date(`1999-03-25:${interaction.options.getString('time')}`)?.toTimeString()
        if(time==="Invalid Date"){time=null}
        try {
            const details = {
                name: interaction.options.getString('name')?.slice(0,256),
                description: interaction.options.getString('description')?.slice(0,1000),
                beginner_friendly: !!interaction.options.getNumber('beginner-friendly'),
                level: interaction.options.getNumber('level'),
                additional_info: interaction.options.getString('additional-info')?.slice(0,1000),
                author: user.id,
                time: time,
                day: interaction.options.getNumber('day'),
                tw: interaction.options.getString('trigger-warnings'),
            } as TestParty;
            await AppDataSource.manager.getRepository(TestParty).save(details)
            await interaction.reply({
                // content: `Party added ${details['name']}\n${inserts}`,
                content: `Party added ${details.name}`,
                ephemeral: true,
            })

        }catch (error) {
            console.log(error)
            await interaction.reply({
                // content: `Party added ${details['name']}\n${inserts}`,
                content: `Something went wrong.\n${error.message} \nPlease try again :)`,
                ephemeral: true,
            })
        }
    }
} as ICommand