const MongoClient = require('mongodb').MongoClient;

module.exports = async function (context, req) {
    const client = new MongoClient(process.env["MongoDbConnectionString"], { 
        useNewUrlParser: true, 
        useUnifiedTopology: true 
    });
    await client.connect();
    const db = client.db("clash");
    context.log(req.query.after);
    const result = await db.collection('league-recruitments').findOne({});
    context.res = {
        // status: 200, /* Defaults to 200 */
        body: JSON.stringify(result)
    };
}