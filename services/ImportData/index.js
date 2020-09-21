const fetch = require('node-fetch');
const MongoClient = require('mongodb').MongoClient;

module.exports = async function (context, myTimer) {
    let headers = {
        'Authorization': `Bearer ${process.env["ClasOfClansApiToken"]}`
    };
    
    const clanUri = `https://api.clashofclans.com/v1/clans/${encodeURIComponent(process.env['ClanTag'])}`;
    let result = await fetch(clanUri, { headers });
    let clan = await result.json();

    const client = new MongoClient(process.env["MongoDbConnectionString"], { useNewUrlParser: true });
    client.connect(async err => {
        var timeStamp = new Date().toISOString();
        const db = client.db("clash");
        db.collection('ClansHistories').insertOne({
            at: timeStamp,
            tag: clan.tag,
            clan: {
                tag: clan.tag,
                memberList: clan.memberList.map(m => ({
                    tag: m.tag,
                    name: m.name,
                    clanRank: m.clanRank
                }))
            }
        });

        let playersHistories = [];
        for (let member of clan.memberList) {
            result = await fetch(`https://api.clashofclans.com/v1/players/${encodeURIComponent(member.tag)}`, { headers });
            const player = await result.json();

            playersHistories.push({
                at: timeStamp,
                tag: player.tag,
                clangTag: clan.tag,
                player: {
                    tag: player.tag,
                    name: player.name,
                    achievements: player.achievements.filter(a => a.name == 'Games Champion')
                }
            });
        }
        db.collection('PlayersHistories').insertMany(playersHistories);

        client.close();
    });
};