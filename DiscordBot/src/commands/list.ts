import {ICommand} from 'wokcommands';
import {AppDataSource} from "../data-source";
import DiscordJS, {Interaction, Message, MessageActionRow, MessageButton, MessageEmbed,} from 'discord.js';
import {Party} from "../entity/Party";
import {generate_embeds} from "../embeds";
import {User} from "../entity/User";

// initialise variables
const page_num_all = {} as { [key: string]: number }; // {userID, pageNumber}
const page_num_owned = {} as { [key: string]: number }; // {userID, pageNumber}
const page_num_joined = {} as { [key: string]: number }; // {userID, pageNumber}

// Create buttons for each page
const getRow = (id: string, embeds: MessageEmbed[], page_num: {}) => {
    const row = new MessageActionRow();

    row.addComponents(
        new MessageButton()
            .setCustomId('prev_embed')
            .setLabel('Previous')
            .setStyle('DANGER')
            .setDisabled(page_num[id] === 0)
    )

    row.addComponents(
        new MessageButton()
            .setCustomId('next_embed')
            .setLabel('Next')
            .setStyle('SUCCESS')
            .setDisabled(page_num[id] === embeds.length - 1)
    )

    return row;
}

export default {
    category: 'User',
    description: 'List of all games available to play in.',
    slash: true,
    options: [
        {
            name: 'type',
            description: 'Which list would you like to see?',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            choices: [
                {
                    name: "all",
                    value: 1,
                },
                {
                    name: "created",
                    value: 2,
                },
                {
                    name: "joined",
                    value: 3,
                }
            ],
        },
        {
            name: 'game_id',
            description: 'specific game details that you want to see',
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
            required: false,
        },
    ],

    callback: async ({interaction, user}) => {
        try {
        const id = user.id;
        let msg: Message;
        let collector;
        let choice = interaction.options.getNumber('type');
        const partyRepo = AppDataSource.getRepository(Party);
        const userRepo = AppDataSource.getRepository(User);
        const filter = (i: Interaction) => i.user.id === user.id;
        const time = 1000 * 60 * 5;

        const make_messages = async (m, embeds, page_num, parties, m2) => {
            if (embeds != null) {
                msg = await interaction.reply({
                    content: `${m}\n game *${page_num[id] + 1}/${parties.length}*`,
                    ephemeral: true,
                    embeds: [embeds[page_num[id]]],
                    components: [getRow(id, embeds, page_num)],
                    fetchReply: true,
                }) as Message;
            } else {
                msg = await interaction.reply({
                    content: `${m2}`,
                    ephemeral: true,
                    fetchReply: true,
                }) as Message;
                return
            }

            collector = msg.createMessageComponentCollector({filter, time});

            collector.on('collect', (btnInt) => {
                if (!btnInt) {
                    return;
                }
                btnInt.deferUpdate()
                if (
                    btnInt.customId !== 'prev_embed' &&
                    btnInt.customId !== 'next_embed'
                ) {
                    return;
                }
                if (btnInt.customId === 'prev_embed' &&
                    page_num[id] > 0) {
                    --page_num[id];
                } else if (btnInt.customId === 'next_embed' &&
                    page_num[id] < embeds.length - 1) {
                    ++page_num[id];
                }
                interaction.editReply({
                    content: `${m}\n game *${page_num[id] + 1}/${parties.length}*`,
                    embeds: [embeds[page_num[id]]],
                    components: [getRow(id, embeds, page_num)]
                });

            })

        }

        try {
            if (choice == 1) {
                // all
                let parties = await partyRepo.find();
                const embeds = (parties.length <= 0) ? null : await generate_embeds(parties);
                page_num_all[id] = page_num_all[id] || 0;
                const m = "List of all available parties:\n";
                const m2 = "There are no parties available. :frowning2:\nTry creating your own"
                await make_messages(m, embeds, page_num_all, parties, m2);

            } else if (choice == 2) {
                const party_id = interaction.options.getNumber('game_id')??null;
                if (!party_id) {
                    // created
                    let parties = await partyRepo.find({where: {author: id}});
                    const embeds = (parties.length <= 0) ? null : await generate_embeds(parties);
                    page_num_owned[id] = page_num_owned[id] || 0;
                    const m = "List of all available parties owned:\n";
                    const m2 = "You don't seem to own any parties. :frowning2:\nTry creating one"
                    await make_messages(m, embeds, page_num_owned, parties, m2);
                } else {
                    let party = await partyRepo.findOne({where: {author: id, id: party_id}})
                    if (party) {
                        const embeds = await generate_embeds([party]);
                        const all_members = await userRepo.find({where: {party_id: party_id}})
                        let members = null;
                        await Promise.all(all_members.map(async (value) => {
                            members += `<@${value.user_id}>`;
                        }))
                        await interaction.reply({
                            content: `Here are details about **${party.name}**`,
                            ephemeral: true,
                            embeds: [embeds[0], new MessageEmbed().addFields({
                                name: "players",
                                value: members ? members : "none",
                            })],
                            fetchReply: true,
                        });
                        return;
                    } else {
                        await interaction.reply({
                            content: `Either I could not find the game,  or you are not the owner of the game with id: **${party_id}**`,
                            ephemeral: true,
                            fetchReply: true,
                        });
                        return;
                    }

                }

            } else if (choice == 3) {
                // joined
                let party_id = await userRepo.find({where: {user_id: id, status: "joined"}}) as User[];
                const parties = await Promise.all(party_id.map(async (value) => {
                    return partyRepo.findOne({where: {id: value.party_id}})
                }))
                const embeds = (parties.length <= 0) ? null : await generate_embeds(parties);
                page_num_joined[id] = page_num_joined[id] || 0;
                const m = "List of all available parties joined:\n";
                const m2 = "You don't seem to have joined any parties. :frowning2:\nTry joining one"
                await make_messages(m, embeds, page_num_joined, parties, m2);

            } else {
                await interaction.reply({
                    content: `Unknown choice. :face_with_monocle:\nPlease try again.`,
                    ephemeral: true,
                    fetchReply: true,
                });
            }
        } catch (error) {
            console.error()
            msg = await interaction.reply({
                content: `Error: ${error}`,
                ephemeral: true,
                fetchReply: true,
            }) as Message;
            return
        }
        }catch (error) {
            console.log(error)
            await interaction.reply({
                // content: `Party added ${details['name']}\n${inserts}`,
                content: `Something went wrong.\n${error.code} \nPlease try again :)`,
                ephemeral: true,
            })
        }
    }
} as ICommand
