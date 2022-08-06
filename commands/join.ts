import {ICommand} from 'wokcommands';
import {conn} from '../database';
import DiscordJS from 'discord.js';

export default {
    category: 'Join',
    description: 'Join a game - game id needed',
    slash: true,
    // arguments
    options: [
        {
            name: 'id',
            description: 'Enter the unique game id.',
            required: true,
            type: DiscordJS.Constants.ApplicationCommandOptionTypes.NUMBER,
        },
    ],

    callback: async ({interaction, user}) => {
        let id = interaction.options.getNumber('id');
        if (id == null){
            id = -1;
        }
        let party;

        const get_party = async () => {
            conn.query(`SELECT * FROM test1 WHERE id=${id};`,
                function (err: any, results: any) {
                    console.log(err + 'e' + results);
                    // name, description, day, time
                    if (results.length > 1){
                        party = 'length greater than 1';
                        return
                    }else if (results.length == 0){
                        party = 'no party found';
                        return;
                    }
                    results.forEach((r: any) => {
                        party = r;
                    })
                }
            )
            console.log("query")
            return new Promise((resolve) => {
                let x = 0
                setTimeout(() => {
                    for (let i=0; i<2; i++) {
                        x++
                    }
                    console.log('Loop completed.')
                    resolve(x)
                }, 2000)
            })
        }

        const join = async (q:number, usr:string) => {
            conn.query(`INSERT INTO test2(id, name) VALUES (${q},"${usr}")`,
                function (err: any, results: any) {
                    if (err) party = 'There was an error trying to join this party. Are you already a member? Did you type the write id?';
                    console.log(err + 'e' + results);
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
                    return resolve(y)
                }, 2000)
            })
        }

        await interaction.reply({
            content: `Looking for party...`,
            ephemeral: true,
        })
        await get_party();
        await join(id, user.id);
        if (typeof party != 'string'){
            party = 'Party joined. You can view parties you have joined with /parties type:joined'
        }
        await interaction.editReply({
            content: `${party}`,
        })
    }
} as ICommand