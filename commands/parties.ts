import {ICommand} from 'wokcommands';
import {conn} from '../database';
import DiscordJS, {
    Interaction, Message,
    MessageActionRow,
    MessageButton,
    MessageEmbed
} from 'discord.js';

// initialise variables
const embeds: MessageEmbed[] = [];
let page: any[] = [];
const page_num = {} as {[key : string] : number}; // {userID, pageNumber}

// get list of all games that you created
const get_owned = async (user:string) => {
    page = [];
    conn.query(`SELECT * FROM test1 WHERE author=${user};`,
        function (err: any, results: any) {
            if (err) throw err;
            console.log(err + 'e' + results);
            // name, description, day, time
            results.forEach((r: any) => {
                page.push(r);
            })
            console.log(page);
        }
    )
    console.log("query")
    return new Promise((resolve) => {
        let y = 0
        setTimeout(() => {
            for (let i=0; i<2; i++) {
                y++
            }
            console.log('Loop completed.')
            resolve(y)
        }, 2000)
    })
}

// get list of all available pages
const get_joined = async (user:string) => {
    page = [];
    conn.query(`SELECT * FROM test1 INNER JOIN test2 on test1.id = test2.id WHERE test2.name = ${user};`,
        function (err: any, results: any) {
            if (err) throw err;
            console.log(err + 'e' + results);
            // name, description, day, time
            results.forEach((r: any) => {
                page.push(r);
            })
            console.log(page);
        }
    )
    console.log("query")
    return new Promise((resolve) => {
        let y = 0
        setTimeout(() => {
            for (let i=0; i<2; i++) {
                y++
            }
            console.log('Loop completed.')
            resolve(y)
        }, 2000)
    })
}

// generate embeds for each page
const generate_pages = async () => {
    for (let i = 0; i < page.length; i++) {
        // let msg = '';
        let msg_Embed = new MessageEmbed()
            .setColor('#6f3473')
            .setAuthor({ name: 'UoM TTRPG Discord Bot',
                iconURL: 'https://www.instagram.com/uomttrpg/',
                url: 'https://cdn.discordapp.com/icons/745766881084047510/1315909b9927f71a62eebeeb0c85fdd8.webp'})
            .setThumbnail('https://cdn.discordapp.com/icons/745766881084047510/1315909b9927f71a62eebeeb0c85fdd8.webp?')
            .setTimestamp()
            .setFooter({
                text: 'made by Jeremy Roe ',
                iconURL: 'https://cdn.discordapp.com/avatars/460056221614080000/c80ab3e9c6cd06dc2a0df91a58a51c45.webp?'
            })
        for(let property in page[i]){
            switch (property){
                case 'name':
                    msg_Embed.setTitle(`Game: ${page[i]['name']}`);
                    break;
                case 'description':
                    if (page[i][property]){msg_Embed.setDescription(`**${property}:** ${page[i]['description']}`);}
                    break;
                case 'author':
                    msg_Embed.addField(property, `<@${page[i]['author']}>`)
                    break;
                default:
                    if (page[i][property] != null) {
                        if (typeof page[i][property] == 'number'){
                            if (page[i][property] == 0) {
                                msg_Embed.addField(property, "No");
                            } else if (page[i][property] == 1) {
                                msg_Embed.addField(property, "Yes");
                            } else {
                                msg_Embed.addField(property, page[i][property].toString());
                            }
                        } else {
                            msg_Embed.addField(property,page[i][property].toString());
                        }
                    }
                    break;
            }
            // if (page[i][property] != null){
            //     msg += `${property}: ${page[i][property]}\n`;
            //     console.log(page[i][property]);
            // }
        }

        // .setDescription(`${msg}`)
        embeds.push(msg_Embed);
    }
}

// creates buttons for each page
const getRow = (id:string) => {
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
    category: 'Parties',
    description: 'Get a list of parties that you are a part of.',
    slash: "both",
    // arguments
    options: [
        {
            name: 'type',
            description: 'Enter the unique game id.',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING,
            choices:[
                {
                    name: "joined",
                    value: 'join',
                },
                {
                    name: "owned",
                    value: 'own',
                }
            ]
        },
    ],

    callback:async ({ interaction, user}) => {
        const id = user.id;
        let type = interaction.options.getString('type');
        if (type == "own"){await get_owned(id)} else {await get_joined(id)}
        await generate_pages();
        page_num[id] = 0;

        let msg: Message;
        msg = await interaction.reply({
            content: `List of your games: \n game *${page_num[id] + 1}/${page.length}*`,
            ephemeral: true,
            embeds: [embeds[page_num[id]]],
            components: [getRow(id)],
            fetchReply: true,
        }) as Message

        const filter = (i:Interaction) => i.user.id === id;
        const time = 1000 * 60 * 5;
        let collector = msg.createMessageComponentCollector({filter, time, dispose:true});
        collector.on('collect', (btnInt) => {
            if(!btnInt){
                return;
            }
            btnInt.deferUpdate()
            if (
                btnInt.customId !== 'prev_embed' &&
                btnInt.customId !== 'next_embed'
            ){
                return;
            }
            if (btnInt.customId === 'prev_embed' &&
                page_num[id] > 0){
                --page_num[id];
            }else if (btnInt.customId === 'next_embed' &&
                page_num[id] < embeds.length - 1){
                ++page_num[id];
            }
            interaction.editReply({
                content: `List of all available parties to join: \n game *${page_num[id]+1}/${page.length}*`,
                embeds: [embeds[page_num[id]]],
                components: [getRow(id)]
            });

        })
    }
} as ICommand