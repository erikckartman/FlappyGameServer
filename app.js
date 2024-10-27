const express = require('express');
const app = express();

const { Pool } = require("pg");
const port = 3000;

//SQL-requests
const viewBase = 'SELECT * FROM leaderboard ORDER BY score DESC;';
const addData = 'INSERT INTO leaderboard(name, score) VALUES($1, $2)';

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

const client = new Pool({    
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    }
});

client.connect()
    .then(() => console.log("Connection succesful"))
    .catch(err => {
        console.log("Error", err);
        console.log("Connection error", err.stack);
    });

app.get('/getdata', async (req, res) => {
    const request = await client.query(viewBase);
    let scoredata = request.rows.map(row => row.name + ', ' + row.score).join("\n");
    res.send(scoredata);
    console.log(scoredata);
});

app.post('/senddata', async (req, res) => {
    console.log("Request Body:", req.body);
    const name = req.body.name;
    const score = req.body.score;

    console.log(`Received - Name: ${name}, Score: ${score}`);

    try {
        await client.query(addData, [name, score]);
        res.status(200).send("We've got your data");
    } catch (error) {
        console.error("Error inserting data:", error);
        res.status(500).send("Error");
    }
})

app.listen(port, () => {
    console.log("Server works on port: " + port);
});

//host: 'dpg-csefngu8ii6s73933gq0-a.render.com',
//    port: 5432,
//        database: 'leaderboard_sjmj',
//            user: 'leaderboard_sjmj_user',
//                password: 'SKQYF30ycuwVpTtueJzS9et6xMHizzk7'