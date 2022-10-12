import {ICommand} from 'wokcommands';
import {AppDataSource} from "../data-source";
import DiscordJS from 'discord.js';
import {TestParty} from "../entity/TestParty";
import {generate_embeds} from "../embeds";

export default {
    category: 'DM',
    description: 'Update details of a game',
    slash: true,
    // arguments
    options: [
        {
            name: 'party_id',
            description: 'What is the party id?',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
        },
        {
            name: 'name',
            description: 'Write the name of your game.',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'description',
            description: 'Write a description of what your game is about',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        },
        {
            name: 'level',
            description: 'State the level that you will be starting at (if your game is level-based, else put 0)',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            minValue: 0,
            maxValue: 2147483647,
        },
        {
            name: 'beginner-friendly',
            description: 'Is your game beginner friendly? (default: yes)',
            required: false,
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
        try {
            const partyRepo = AppDataSource.getRepository(TestParty);
            const party_id = interaction.options.getNumber('party_id');
            let find_party = await partyRepo.findOne({where: {id: party_id}})
            if (!find_party) {
                await interaction.reply({
                    content: `Could not find a party with the id provided`,
                    ephemeral: true,
                })
                return;
            }
            if (find_party.author !== user.id) {
                await interaction.reply({
                    content: `You are unauthorised to edit **${find_party.name}** as you are not the creator`,
                    ephemeral: true,
                })
                return;
            }

            let copy = {...find_party};


            const details = {
                name: interaction.options.getString('name')?.slice(0, 256) ?? null,
                description: interaction.options.getString('description')?.slice(0, 1000) ?? null,
                beginner_friendly: !!interaction.options.getNumber('beginner-friendly') ?? null,
                level: interaction.options.getNumber('level') ?? null,
                when: interaction.options.getString('when')?.slice(0, 1000) ?? null,
                additional_info: interaction.options.getString('additional-info')?.slice(0, 1000) ?? null,
                tw: interaction.options.getString('trigger-warnings')?.slice(0, 1000) ?? null,
            } as TestParty;
            console.log(details)
            Object.keys(details).forEach((key) => {
                if (details[key] !== find_party[key] && details[key]) {
                    copy[key] = details[key]
                }
            })
            console.log(copy, find_party)
            if (copy !== find_party) {
                await AppDataSource.manager.getRepository(TestParty).update(party_id, copy)
                const embed = await generate_embeds([copy]);
                await interaction.reply({
                    content: `Party **${find_party.name}** has been updated`,
                    ephemeral: true,
                    embeds: embed
                })
            } else {
                await interaction.reply({
                    content: `Party **${find_party.name}** has not been updated as no changes have been made`,
                    ephemeral: true,
                })
            }

        } catch (error) {
            console.log(error)
            await interaction.reply({
                content: `Something went wrong.\n${error.code} \nPlease try again :)`,
                ephemeral: true,
            })
        }
    }
} as ICommand