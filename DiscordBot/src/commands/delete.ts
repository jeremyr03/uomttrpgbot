import {ICommand} from 'wokcommands';
import DiscordJS from 'discord.js';
import {AppDataSource} from "../data-source";
import {User} from "../entity/User";
import {Party} from "../entity/Party";

export default {
    category: 'Delete',
    description: 'To delete a campaign or remove yourself from it',
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
            description: 'If you are trying to remove someone from your campaign.',
            required: false,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
        }
    ],

    callback: async ({interaction, user, client}) => {
        try {
            const userRepo = AppDataSource.getRepository(User);
            const partyRepo = AppDataSource.getRepository(Party);
            const partyID = interaction.options.getNumber('party_id');
            const userID = interaction.options.getString('user_id')?.slice(2, -1);
            const party_author = await partyRepo.findOne({where: {id: partyID}}) as Party
            if (!party_author) {
                await interaction.reply({
                    content: `Could not find game \`${partyID}\`.`,
                    ephemeral: true,
                    fetchReply: true,
                });
                return;
            }

            // if you are the DM
            if (user.id === party_author.author) {
                // if userID supplied
                if (userID) {
                    // remove user
                    const party_member = await userRepo.findOne({
                        where: {
                            party_id: partyID,
                            user_id: userID
                        }
                    }) as User;
                    await userRepo.delete(party_member);
                    client.users.fetch(party_member.user_id).then((user) => {
                        user.send({
                            content: `You have been removed from **${party_author.name}** :wastebasket:`
                        })
                    });
                    await interaction.reply({
                        content: `**<@${party_member.user_id}>** has been deleted from ${party_author.name}. :wastebasket:`,
                        ephemeral: true,
                        fetchReply: true,
                    });

                } else {
                    // delete campaign and remove all users
                    const party_members = await userRepo.find({where: {party_id: partyID}}) as User[];
                    await partyRepo.delete({id: partyID})
                    await interaction.reply({
                        content: `**${party_author.name}** has been deleted. :wastebasket:`,
                        ephemeral: true,
                        fetchReply: true,
                    });
                    party_members.forEach(value => {
                        userRepo.delete(value);
                        client.users.fetch(value.user_id).then((user) => {
                            user.send({
                                content: `**${party_author.name}** ` +
                                    `has been deleted from the server by the creator, <@${party_author.author}>. :wastebasket:`
                            })
                        });
                    })
                }
            } else {
                // if user ID supplied
                if (userID) {
                    await interaction.reply({
                        content: `**Error**, you do not have permission to delete <@${userID}> ` +
                            `from **${party_author.name}** :no_entry_sign:`,
                        ephemeral: true,
                        fetchReply: true,
                    });
                } else {
                    // remove user from game
                    await userRepo.delete({user_id: userID})
                }
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