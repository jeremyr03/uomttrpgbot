import {ICommand} from 'wokcommands';
import {AppDataSource} from "../data-source";
import DiscordJS, {Interaction, Message, MessageActionRow, MessageButton, MessageEmbed,} from 'discord.js';
import {User} from "../entity/User";
import {TestParty} from "../entity/TestParty";
import {generate_embeds} from "../embeds";
import {TestUser} from "../entity/TestUser";

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

    // row.addComponents(
    //     new MessageButton()
    //         .setCustomId('join_embed')
    //         .setLabel('Join')
    //         .setStyle('PRIMARY')
    //         // check between id and party
    //         .setDisabled(true)
    // )
    // row.addComponents(
    //     new MessageButton()
    //         .setCustomId('leave_embed')
    //         .setLabel('Leave')
    //         .setStyle('SECONDARY')
    //         .setDisabled(true)
    // )

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
    ],

    callback: async ({interaction, user}) => {
        const id = user.id;
        let msg: Message;
        let collector;
        let choice = interaction.options.getNumber('type');
        const partyRepo = AppDataSource.getRepository(TestParty);
        const userRepo = AppDataSource.getRepository(TestUser);
        const filter = (i: Interaction) => i.user.id === user.id;
        const time = 1000 * 60 * 5;

        const make_messages = async (m, embeds, page_num, parties, m2) => {
            if (embeds != null) {
                msg = await interaction.reply({
                    content: `${m}: \n game *${page_num[id] + 1}/${parties.length}*`,
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
                    content: `List of all available parties to join: \n game *${page_num[id] + 1}/${parties.length}*`,
                    embeds: [embeds[page_num[id]]],
                    components: [getRow(id, embeds, page_num)]
                });

            })

        }

        if (choice == 1) {
            // all
            let parties = await partyRepo.find();
            const embeds = (parties.length <= 0) ? null : await generate_embeds(parties);
            page_num_all[id] = page_num_all[id] || 0;
            const m = "List of all available parties\n";
            const m2 = "There are no parties available. :frowning2:\nTry creating your own"
            await make_messages(m, embeds, page_num_all, parties, m2);

        } else if (choice == 2) {
            // created
            let parties = await partyRepo.find({where: {author: id}});
            const embeds = (parties.length <= 0) ? null : await generate_embeds(parties);
            page_num_owned[id] = page_num_owned[id] || 0;
            const m = "List of all available parties owned\n";
            const m2 = "You don't seem to own any parties. :frowning2:\nTry creating one"
            await make_messages(m, embeds, page_num_owned, parties, m2);

        } else if (choice == 3) {
            // joined
            let party_id = await userRepo.find({where: {user_id: id, status: "joined"}}) as TestUser[];
            const parties = await Promise.all(party_id.map(async (value) => {
                return partyRepo.findOne({where: {id: value.party_id}})
            }))
            const embeds = (parties.length <= 0) ? null : await generate_embeds(parties);
            page_num_joined[id] = page_num_joined[id] || 0;
            const m = "List of all available parties joined\n";
            const m2 = "You don't seem to have joined any parties. :frowning2:\nTry joining one"
            await make_messages(m, embeds, page_num_joined, parties, m2);

        } else {
            await interaction.reply({
                content: `Unknown choice. :face_with_monocle:\nPlease try again.`,
                ephemeral: true,
                fetchReply: true,
            });
        }
    }
} as ICommand
