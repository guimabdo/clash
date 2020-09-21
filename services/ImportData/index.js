const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;

module.exports = async function (context, myTimer) {
    try {
        let headers = {
            'Authorization': `Bearer ${process.env["ClasOfClansApiToken"]}`
        };

        const clanUri = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(process.env['ClanTag'])}`;
        context.log('Fetching clan');
        let result = await fetch(clanUri, { headers });
        let clan = await result.json();
        //context.log(clan);
        context.log('clan name: ' + clan.name);

        const client = new MongoClient(process.env["MongoDbConnectionString"], { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();

        var timeStamp = new Date().toISOString();
        const db = client.db("clash");

        let history = {
            at: timeStamp,
            clanTag: clan.tag,
            clanName: clan.name,
            players: []
        };

        for (let member of clan.memberList) {
            context.log(`getting player: ${member.name} ${member.tag}`);
            result = await fetch(`https://api.clashofclans.com/v1/players/${encodeURIComponent(member.tag)}`, { headers });
            const player = await result.json();

            history.players.push({
                tag: player.tag,
                name: player.name,
                achievements: player.achievements.filter(a => a.name == 'Games Champion')
            });
        }
        await db.collection('Histories').insertOne(history);

        await client.close();
        context.log(`import succeeded`);
    } catch (err) {
        context.log(err);
    }
};