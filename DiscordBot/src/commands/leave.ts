import {ICommand} from 'wokcommands';
import DiscordJS from 'discord.js';
import {AppDataSource} from "../data-source";
import {User} from "../entity/User";
import {Party} from "../entity/Party";

export default {
    category: 'User',
    description: 'To leave a campaign.',
    slash: true,
    // arguments
    options: [
        {
            name: 'party_id',
            description: 'The id of the party that you are trying to reject someone from.',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
        }
    ],

    callback: async ({interaction, user}) => {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const partyRepo = AppDataSource.getRepository(Party);
            const partyID = interaction.options.getNumber('party_id');
            const find_user = await userRepo.findOne({where: {party_id: partyID, user_id: user.id}});
            const find_party = await partyRepo.findOne({where: {id: partyID}});
            if (!find_party) {
                await interaction.reply({
                    content: `Party with id \`${partyID}\` could not be found`,
                    ephemeral: true,
                    fetchReply: true,
                });
                return;
            }
            if (find_user && find_user.status == "joined") {
                await userRepo.delete(find_user);

                await interaction.reply({
                    content: `You have been removed from **${find_party.name}**.`,
                    ephemeral: true,
                    fetchReply: true,
                });
                return;
            }
            await interaction.reply({
                content: `You could not be removed from **${find_party.name}** as are not a member of this party`,
                ephemeral: true,
                fetchReply: true,
            });
        } catch (error) {
            console.error(error);
            await interaction.reply({
                content: `Something went wrong.\n${error.message} \nPlease try again :)`,
                ephemeral: true,
                fetchReply: true,
            });
        }
    }
} as ICommand