import {ICommand} from 'wokcommands';
import DiscordJS, {Formatters} from 'discord.js';
import {TestParty} from "../entity/TestParty";
import {AppDataSource} from "../data-source";
import {generate_embeds} from "../embeds";
import {TestUser} from "../entity/TestUser";

export default {
    category: 'User',
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

    callback: async ({interaction, user, message, client}) => {
        const user_id = user.id
        console.log(user_id)
        let party_id = interaction.options.getNumber('id');
        if (party_id == null) {
            party_id = -1;
        }
        let party;

        const repository = AppDataSource.getRepository(TestParty);
        const userRepo = AppDataSource.getRepository(TestUser)
        try {
            party = await repository.findOneOrFail({where: {id: party_id}}) as TestParty;
            const embed = await generate_embeds([party]);

            // implement code to join party here

            let finduser = await userRepo.findOne({
                where: {
                    party_id: party_id,
                    user_id: user_id
                }
            }) as TestUser;
            console.log(finduser)
            if (!finduser || finduser.status != "joined") {
                await userRepo.save({
                    party_id: party_id,
                    user_id: user_id,
                    status: "requested"
                } as TestUser)
                console.log("saved")
            }

            await interaction.reply({
                ephemeral: true,
                content: `You requested to join the game: ${party.name}!`,
                embeds: [embed[0]]
            })
            await client.users.fetch(party.author).then((user) => {
                user.send({content:`<@${user.id}> is requesting to join your game\n`+
                        `To accept, run the following command:\`/accept party_id:${party_id} user_id:<@${user.id}>\`\n`+
                        `To reject, run the following command:\`/reject party_id:${party_id} user_id:<@${user.id}>\``})
            });
        } catch (error) {
            console.error(error)
            await interaction.reply({
                ephemeral: true,
                content: `Could not join party. Party is either full, does not exist.`,
            })
        }
    }
} as ICommand