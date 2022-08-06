import {ICommand} from 'wokcommands';
import {conn} from '../database';
import moment from 'moment';
import DiscordJS, {
    Interaction,
    MessageActionRow,
    MessageButton,
    MessageEmbed,
} from 'discord.js';


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
            name: 'beginner_friendly',
            description: 'Is your game beginner friendly? (default: yes)',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices: [
                {
                    name: "yes",
                    value: 'true',
                },
                {
                    name: "no",
                    value: 'false',
                }
            ],
        },
        {
            name: 'description',
            description: 'Write a description of what your game is about.',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'date_time',
            description: 'State the date and time of the game (if over multiple sessions, put the next session).',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'trigger_warning',
            description: 'State any trigger warnings your game may have.',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'level',
            description: 'State the level that you will be starting at (if your game is level-based).',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'additional_info',
            description: 'Write any additional information your players should know about here.',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        }
    ],

    callback: async ({interaction, user, channel}) => {

        const create_game = async (q:string) => {
            conn.query(q,
                function (err: any, results: any) {
                    console.log(err + 'e' + results);
                }
            )
            console.log("query")
            return new Promise((resolve) => {
                let y = 0
                setTimeout(() => {
                    for (let i=0; i<2; i++) {
                        y++
                    }
                    console.log('Loop completed.')
                    resolve(y)
                }, 2000)
            })
        }
        // const name = interaction.options.getString('name');
        // const description = interaction.options.getString('description');
        // const dateTime = interaction.options.getString('date_time');
        // const additional = interaction.options.getString('additional_info');
        // const author = user.id;

        // level validation: number or ''
        let level;
        try {
            level = parseInt(<string>interaction.options.getString('level'));
        }catch (e){
            level = '';
        }

        // boolean conversion - string to num
        let beginner = interaction.options.getString('beginner_friendly');
        let b;
        if (beginner){
            b = (beginner == 'true')?1:0;
        }else {
            b = 0;
        }
        const details = {
            name: interaction.options.getString('name'),
            description: interaction.options.getString('description'),
            date_time: interaction.options.getString('date_time'),
            beginner_friendly: b,
            level: level,
            additional_info: interaction.options.getString('additional_info'),
            author: user.id,
        }
        console.log(details);

        let inserts = 'INSERT into test1 (';
        let values = 'VALUES(';
        for (const d in details) {
            // @ts-ignore
            switch (typeof details[d]) {
                case 'string':
                    // @ts-ignore
                    console.log(details[d]);
                    // @ts-ignore
                    if (details[d]){
                        inserts += `${d},`;
                        // @ts-ignore
                        values += `"${details[d]}",`;
                    }
                    break;
                // no longer necessary for boolean
                case "boolean":
                    // @ts-ignore
                    if(details[d]){
                        inserts += `${d},`;
                        values += `1,`;
                    }else {
                        inserts += `${d},`;
                        values += `0,`;
                    }
                    break;
                case "number":
                    inserts += `${d},`;
                    // @ts-ignore
                    values += `${details[d]},`;
                    break;
                default:
                    break;
            }

        }
        inserts = inserts.slice(0, -1);
        values = values.slice(0, -1);
        inserts += ') ';
        values += ');';
        inserts += values;

        console.log(inserts);
        await create_game(inserts);
        await interaction.reply({
            content: `List of all available parties to join:`,
            ephemeral: true,
        })
    }
} as ICommand