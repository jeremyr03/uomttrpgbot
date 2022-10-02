import {ICommand} from "wokcommands";
import {
    Interaction,
    Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed
} from "discord.js";

const page_num = {} as { [key: string]: number }; // {userID, pageNumber}

const commands = [
    {name:"Hello", value:"Hello and welcome to the UoM TTRPG Bot. Here are a list of commands:\n\n" +
            "**/help**\n" +
            "**/create**\n" +
            "**/update**\n" +
            "**/join**\n" +
            "**/leave**\n" +
            "**/accept**\n" +
            "**/reject**\n" +
            "**/delete**\n" +
            "**/leave**\n" +
            "**/ping**\n\n" +
            "Click the buttons to go through what each command does."},
    {name: "help", value: "returns a list of slash actions available"},
    {
        name: "list", value: "returns a list of games.\n\n There are **3 choices** for the type parameter:\n\n" +
            "• *all* - shows all public games.\n "+
            "• *created* - shows games that you created (if you specify the game id as well," +
            "you can see more details about the game - provided you are the GM).\n" +
            "• *joined* - to see games that you have joined.\n",
    },
    {
        name: "create", value: "To create a game.\n\n There are **5 required** parameters, and **2 optional** parameters:\n\n" +
            "• *name* - The name of the game.\n" +
            "• *description* - A brief description of what the game is, where it is, how long it is expected to go on for etc. .\n" +
            "• *level* - The level that you will be playing at. If not applicable, enter 0.\n" +
            "• *beginner-friendly* - Will beginners be able to take part in this game (choose from the yes or no option).\n" +
            "• *when* - Details about when and where the game will take place.\n" +
            "• *trigger_warnings* - (optional) If any sensitive material is going to be in the game that some may find distressing.\n" +
            "• *additional-info* - (optional) Any additional info that the players may need to know.\n",
    },
    {
        name: "update", value: "If you are the GM, you can use this to update information about the game.\n" +
             "Simply provide the **game_id**, and then edit all the optional parameters that you want to change the info for.\n",
    },
    {
        name: "join", value: "Use this command to join a game. \nYou will need to enter the **game_id** in order to join.\n",
    },
    {
        name: "leave",
        value: "Use this command to leave a game. \nYou will need to enter the **game_id** in order to leave.\n",
    },
    {
        name: "accept", value: "Use this command to accept someone requesting to join your game.\n" +
             "You will need to enter the **game_id** and **@ the user** in order to be able to accept them.\n",
    },
    {
        name: "reject", value: "Use this command to reject someone requesting to join your game.\n" +
             "You will need to enter the **game_id** and **@ the user** in order to be able to reject them.\n",
    },
    {
        name: "delete", value: "Use this command to either **delete a game**, or to **kick someone from your game**.\n\n" +
            "• To delete a game, you just need the *game_id*\n "+
            "• To kick someone, you will need to enter the *game_id* and *@ the user*.\n",
    },
    {
        name: "leave", value: "Use this command to leave a game you've joined.\n" +
             "You will need to enter the **game_id** in order to leave the game.\n",
    },
    {
        name: "ping",
        value: "returns with pong if the bot is running. If it is not, please contact <@460056221614080000>\n\n\nThank you for using our bot :)"
    }
]

const generate_embeds = async (content: { name: string, value: string }[]) => {
    return content.map((v) => {
        return new MessageEmbed()
            .setColor('#6f3473')
            .setAuthor({
                name: 'UoM TTRPG Discord Bot',
                iconURL: 'https://www.instagram.com/uomttrpg/',
                url: 'https://cdn.discordapp.com/icons/745766881084047510/1315909b9927f71a62eebeeb0c85fdd8.webp'
            })
            .setThumbnail('https://cdn.discordapp.com/icons/745766881084047510/1315909b9927f71a62eebeeb0c85fdd8.webp?')
            .setTitle(v['name'])
            .setDescription(v['value'])
    })

}

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
    return row;
}

export default {
    category: 'Help',
    description: 'Information about how to use the bot.',
    slash: true,

    callback: async ({interaction,user}) => {
        const id = user.id;
        let collector;
        let msg: Message;
        const embeds = await generate_embeds(commands);
        page_num[id] = page_num[id] || 0;
        const filter = (i: Interaction) => i.user.id === user.id;
        const time = 1000 * 60 * 5;
        if (interaction) {
            msg = await interaction.reply({
                content:`Page ${page_num[id]} of ${embeds.length}. \n*Previous: ${embeds[page_num[id]-1]?.title?embeds[page_num[id]-1].title:' '}\t \tNext up: ${embeds[page_num[id]+1]?.title?embeds[page_num[id]+1].title:' '}*`,
                embeds: [embeds[page_num[id]]],
                components: [getRow(id, embeds)],
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
                content:`Page ${page_num[id]} of ${embeds.length}. \n*Previous: ${embeds[page_num[id]-1]?.title?embeds[page_num[id]-1].title:' '}\t \tNext up: ${embeds[page_num[id]+1]?.title?embeds[page_num[id]+1].title:' '}*`,
                embeds: [embeds[page_num[id]]],
                components: [getRow(id, embeds)]
            });

        })

    }
} as ICommand