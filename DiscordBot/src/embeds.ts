// generate embeds for each page
import {Party} from "./entity/Party";
import {MessageEmbed} from "discord.js";

export const generate_embeds = async (parties: Party[]) => {
    const embeds = [] as MessageEmbed[];

    for (let i = 0; i < parties.length; i++) {
        let msg_Embed = new MessageEmbed()
            .setColor('#6f3473')
            .setAuthor({
                name: 'UoM TTRPG Discord Bot',
                iconURL: 'https://www.instagram.com/uomttrpg/',
                url: 'https://cdn.discordapp.com/icons/745766881084047510/1315909b9927f71a62eebeeb0c85fdd8.webp'
            })
            .setThumbnail('https://cdn.discordapp.com/icons/745766881084047510/1315909b9927f71a62eebeeb0c85fdd8.webp?')
            .setTimestamp()
            .setFooter({
                text: 'Uom TTRPGBot',
                iconURL: 'https://cdn.discordapp.com/app-icons/906929143260790785/a9a3671ec785c54cf110e68049013f2e.png?'
            })
        for (let property in parties[i]) {
            switch (property) {
                case 'name':
                    msg_Embed.setTitle(`Game: ${parties[i]['name']}`);
                    break;
                case 'description':
                    if (parties[i][property]) {
                        msg_Embed.setDescription(`**${property}:** ${parties[i]['description']}`);
                    }
                    break;
                case 'author':
                    msg_Embed.addFields({name: property, value: `<@${parties[i]['author']}>`})
                    // msg_Embed.addField(property, `<@${parties[i]['author']}>`)
                    break;
                case 'id':
                    msg_Embed.addFields({name: property, value: parties[i][property].toString()})
                    break;
                default:
                    if (parties[i][property] != null) {
                        if (typeof parties[i][property] == 'number') {
                            if (parties[i][property] == 0) {
                                msg_Embed.addFields({name: property, value: "No"})
                                // msg_Embed.addField(property, "No");
                            } else if (parties[i][property] == 1) {
                                msg_Embed.addFields({name: property, value: "Yes"})
                                // msg_Embed.addField(property, "Yes");
                            } else {
                                msg_Embed.addFields({name: property, value: parties[i][property].toString()})
                                // msg_Embed.addField(property, parties[i][property].toString());
                            }
                        } else {
                            msg_Embed.addFields({name: property, value: parties[i][property].toString()})
                            // msg_Embed.addField(property,parties[i][property].toString());
                        }
                    }
                    break;
            }
        }
        embeds.push(msg_Embed);
    }
    return embeds;
}

// export {generate_embeds}