import {ICommand} from 'wokcommands';
import DiscordJS from 'discord.js';
import {TestParty} from "../entity/TestParty";
import {AppDataSource} from "../data-source";
import {generate_embeds} from "../embeds";

export default {
    category: 'Join',
    description: 'Join a game - game id needed',
    slash: true,
    // arguments
    options: [
        {
            name: 'id',
            description: 'Enter the unique game id.',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
        },
    ],

    callback: async ({interaction, user}) => {
        let party_id = interaction.options.getNumber('id');
        if (party_id == null) {
            party_id = -1;
        }
        let party;

        const repository = AppDataSource.getRepository(TestParty);
        try {
            party = await repository.findOneOrFail({where: {id: party_id}}) as TestParty;
            const embed = await generate_embeds([party]);

            // implement code to join party here


            await interaction.reply({
                ephemeral: true,
                content: `You joined the game: ${party.name}!\nHappy adventuring :)`,
                embeds: [embed[0]]
            })
        } catch (error) {
            console.error(error)
            await interaction.reply({
                ephemeral: true,
                content: `Could not join party. Party is either full, does not exist.`,
            })
        }
    }
} as ICommand