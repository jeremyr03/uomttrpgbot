import {ICommand} from 'wokcommands';
import {AppDataSource} from "../data-source";
import {Interaction, Message, MessageActionRow, MessageButton, MessageEmbed,} from 'discord.js';
import {MessageButtonStyles} from "discord.js/typings/enums";
import {User} from "../entity/User";
import {TestParty} from "../entity/TestParty";
import {generate_embeds} from "../embeds";

// initialise variables
const page_num = {} as { [key: string]: number }; // {userID, pageNumber}

// Create buttons for each page
const getRow = (id: string, embeds: MessageEmbed[]) => {
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
    category: 'Read',
    description: 'Paginated list',
    slash: true,

    callback: async ({interaction, user}) => {
        const id = user.id;
        let msg: Message;
        let collector;

        let parties = await AppDataSource.manager.find(TestParty);
        const embeds = (parties.length <= 0) ? null : await generate_embeds(parties);
        page_num[id] = page_num[id] || 0;

        const filter = (i: Interaction) => i.user.id === user.id;
        const time = 1000 * 60 * 5;
        if (embeds != null) {
            msg = await interaction.reply({
                content: `List of all available parties to join: \n game *${page_num[id] + 1}/${parties.length}*`,
                ephemeral: true,
                embeds: [embeds[page_num[id]]],
                components: [getRow(id, embeds)],
                fetchReply: true,
            }) as Message;
        } else {
            msg = await interaction.reply({
                content: `There are currently no games to be found :(\nTry creating one!`,
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
                components: [getRow(id, embeds)]
            });

        })
    }
} as ICommand
