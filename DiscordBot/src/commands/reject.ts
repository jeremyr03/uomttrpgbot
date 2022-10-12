import {ICommand} from 'wokcommands';
import DiscordJS from 'discord.js';
import {AppDataSource} from "../data-source";
import {TestUser} from "../entity/TestUser";
import {TestParty} from "../entity/TestParty";

export default {
    category: 'DM',
    description: 'For DM to decline people from entering the campaign',
    slash: true,
    // arguments
    options: [
        {
            name: 'party_id',
            description: 'The id of the party that you are trying to reject someone from.',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
        },
        {
            name: 'user_id',
            description: 'The person\'s id.',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        }
    ],

    callback: async ({interaction, user, client}) => {
        try {
            const userRepo = AppDataSource.getRepository(TestUser);
            const partyID = interaction.options.getNumber('party_id');
            const userID = interaction.options.getString('user_id')?.slice(2, -1);
            const party_author = await AppDataSource.getRepository(TestParty).findOne({where: {id: partyID}}) as TestParty
            if (!party_author) {
                await interaction.reply({
                    content: `Could not find game \`${partyID}\`.`,
                    ephemeral: true,
                    fetchReply: true,
                });
                return;
            }
            if (user.id === party_author.author) {
                let find_user = await userRepo.findOne({
                    where: {
                        party_id: partyID,
                        user_id: userID
                    }
                }) as TestUser;
                if (find_user) {
                    switch (find_user.status) {
                        case "requested":
                            await userRepo.save({
                                party_id: partyID,
                                user_id: userID,
                                status: "rejected"
                            } as TestUser)
                            await interaction.reply({
                                content: `<@${userID}>'s request to join **${party_author.name}** has been declined. :no_entry_sign:`,
                                ephemeral: true,
                                fetchReply: true,
                            });
                            await client.users.fetch(userID).then((rejected) => {
                                rejected.send({content: `Unfortunately, your request to join **${party_author.name}** has been declined. :no_entry_sign:`})
                            });
                            break;
                        case "joined":
                            await interaction.reply({
                                content: `<@${userID}> has already been added to ${party_author.name}. To remove them as a party member use \`/delete ${partyID} ${userID}\``,
                                ephemeral: true,
                                fetchReply: true,
                            });
                            break;
                        case "rejected":
                            await interaction.reply({
                                content: `You have already declined <@${userID}>'s invitation to **${party_author.name}**`,
                                ephemeral: true,
                                fetchReply: true,
                            });
                            break;
                        default:
                            await interaction.reply({
                                content: `Something went wrong`,
                                ephemeral: true,
                                fetchReply: true,
                            });
                    }
                } else {
                    await interaction.reply({
                        content: `<@${userID}> has not registered to sign up to **${party_author.name}**`,
                        ephemeral: true,
                        fetchReply: true,
                    });
                }
            } else {
                await interaction.reply({
                    content: `Unauthorised. Only <@${party_author.author}> **${party_author.name}** can reject people from this party`,
                    ephemeral: true,
                    fetchReply: true,
                });
            }
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