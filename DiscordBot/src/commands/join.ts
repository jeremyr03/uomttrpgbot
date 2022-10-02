import {ICommand} from 'wokcommands';
import DiscordJS from 'discord.js';
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

    callback: async ({interaction, user, client}) => {
        const user_id = user.id;
        let party;

        try {
            let party_id = interaction.options.getNumber('id');
            const repository = AppDataSource.getRepository(TestParty);
            const userRepo = AppDataSource.getRepository(TestUser);
            if (party_id == null) {
                party_id = -1;
            }
            party = await repository.findOneOrFail({where: {id: party_id}}) as TestParty;
            const embed = await generate_embeds([party]);

            // implement code to join party here
            let find_user = await userRepo.findOne({
                where: {
                    party_id: party_id,
                    user_id: user_id
                }
            }) as TestUser;
            console.log(find_user)
            if (!find_user || find_user.status != "joined") {
                await userRepo.save({
                    party_id: party_id,
                    user_id: user_id,
                    status: "requested"
                } as TestUser)
                console.log("saved")
            }

            await interaction.reply({
                ephemeral: true,
                content: `You requested to join the game: **${party.name}**!`,
                embeds: [embed[0]]
            })
            await client.users.fetch(party.author).then((author) => {
                author.send({
                    content: `<@${user.id}> is requesting to join **${party.name}**\n` +
                        `To accept, run the following command:\`/accept party_id:${party_id} user_id:<@${user.id}>\`\n` +
                        `To reject, run the following command:\`/reject party_id:${party_id} user_id:<@${user.id}>\``
                })
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