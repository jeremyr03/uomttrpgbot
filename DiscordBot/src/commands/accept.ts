import {ICommand} from 'wokcommands';
import DiscordJS, {Message} from 'discord.js';
import {AppDataSource} from "../data-source";
import {TestUser} from "../entity/TestUser";

export default {
    category: 'Accepting',
    description: 'For DM to accept people into the campaign',
    slash: true,
    // arguments
    options: [
        {
            name: 'party_id',
            description: 'The id of the party that you are trying to add someone to.',
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

    callback: async ({interaction, user}) => {
        const userRepo = AppDataSource.getRepository(TestUser);
        const partyID = interaction.options.getNumber('party_id');
        const userID = interaction.options.getString('user_id')?.slice(2, -1);
        console.log("ids:", partyID, userID);
        try {
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
                            status: "joined"
                        } as TestUser)
                        await interaction.reply({
                            content: `<@${userID}> has joined the party!!!`,
                            ephemeral: true,
                            fetchReply: true,
                        });
                        break;
                    case "joined":
                        await interaction.reply({
                            content: `<@${userID}> has already been added to the party.`,
                            ephemeral: true,
                            fetchReply: true,
                        });
                        break;
                    case "rejected":
                        await interaction.reply({
                            content: `You have already declined <@${userID}>'s invitation. Ask them to request again if that was a mistake.`,
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
                    content: `<@${userID}> has not registered to sign up to this party.`,
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