const MongoClient = require('mongodb').MongoClient;

module.exports = async function (context, req) {
    const client = new MongoClient(process.env["MongoDbConnectionString"], { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });
    await client.connect();
    const db = client.db("clash");
    context.log(req.query.after);
    const histories = await db.collection('Histories').find({
        'at': { 
            '$gt': new Date(req.query.after).toISOString()
        }
    }).toArray();
    //req.query.after
    
    context.log(histories.length);
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(histories)
    };
}