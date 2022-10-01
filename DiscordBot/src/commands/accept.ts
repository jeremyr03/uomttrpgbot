import {ICommand} from 'wokcommands';
import DiscordJS, {MessageEmbed} from 'discord.js';
import {AppDataSource} from "../data-source";
import {TestUser} from "../entity/TestUser";
import {TestParty} from "../entity/TestParty";
import {generate_embeds} from "../embeds";

export default {
    category: 'DM',
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

    callback: async ({interaction, user, client}) => {
        try {
            const userRepo = AppDataSource.getRepository(TestUser);
            const partyID = interaction.options.getNumber('party_id');
            const userID = interaction.options.getString('user_id')?.slice(2, -1);
            console.log("ids:", partyID, userID);
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
                                status: "joined"
                            } as TestUser)
                            await interaction.reply({
                                content: `<@${userID}> has joined **${party_author.name}**!!!`,
                                ephemeral: true,
                                fetchReply: true,
                            });
                            const embed = await generate_embeds([party_author]);
                            await client.users.fetch(party_author.author).then((user) => {
                                user.send({
                                    content: `You have joined **${party_author.name}**!!!\n Happy adventuring :)`,
                                    // can add more gifs to show
                                    embeds: [new MessageEmbed().setImage("https://media.tenor.com/CARgJFTXTO4AAAAC/nat20-d20.gif"), embed[0]]
                                })
                            });
                            break;
                        case "joined":
                            await interaction.reply({
                                content: `<@${userID}> has already been added to **${party_author.name}**.`,
                                ephemeral: true,
                                fetchReply: true,
                            });
                            break;
                        case "rejected":
                            await interaction.reply({
                                content: `You have already declined <@${userID}>'s invitation to **${party_author.name}**. Ask them to request again if that was a mistake.`,
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
                        content: `<@${userID}> has not registered to sign up to ${party_author.name}.`,
                        ephemeral: true,
                        fetchReply: true,
                    });
                }
            } else {
                await interaction.reply({
                    content: `Unauthorised. Only the DM of ${party_author.name} can accept people to this party`,
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