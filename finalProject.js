let http = require("http");
const path = require("path");
let express = require("express");
let bodyParser = require("body-parser");
let app = express();
let url = require("url");
const PORT = process.env.PORT || 8080;

app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:false}));

require("dotenv").config({ path: path.resolve(__dirname, 'credentials/.env') })

const username = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_DB_COLLECTION};

const { MongoClient, ServerApiVersion } = require('mongodb');


async function main() {
    const uri = `mongodb+srv://${username}:${password}@cluster0.we90t.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
    
    app.post("/pokemonAbilities", async function(request, response) {
        try {
            await client.connect();
        
            let newPokemon = {
                name: request.body.name
            };
            
            
            await insertPokemon(client, databaseAndCollection, newPokemon);
            let name = request.body.name;
            response.render("abilities", {name});
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    });
    
    app.get("/pokemonTable", async function(request, response) {
        try {
            await client.connect();
        
            const cursor = client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find().sort({"name": 1 });
            const result = await cursor.toArray();
            
            let pokemonTable = '<table border=\"1\"><tr><th>Name</th></tr>';
            result.map(pokemon => {
                pokemonTable += `<tr>
                <td>${pokemon.name}</td>
                </tr>`;
            })
            pokemonTable += '</table>';
            
            let reqUrl = request.get('host');
            let reqProt = request.protocol;
            
            response.render("pokeTable", {reqProt, reqUrl, pokemonTable});
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    });
    
    app.post("/pokemonDelete", async function(request, response) {
        try {
            await client.connect();
        
            //let filter = {};
            const cursor = client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).find();
        
            const pokemonRemoved = await cursor.toArray();
            
            let numberRemoved = pokemonRemoved.length;
            
            const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).deleteMany({});
    
            response.render("delete", {numberRemoved});
        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }
    });
}

app.get("/", function(request, response) {
    let reqUrl = request.get('host');
    let reqProt = request.protocol;
   response.render("homePage", {reqProt, reqUrl});
});


app.get("/pokemon", function(request, response) {
    let reqUrl = request.get('host');
    let reqProt = request.protocol;
   response.render("pokemon", {reqProt, reqUrl});
});

async function insertPokemon(client, databaseAndCollection, newPokemon) {
    const result = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collection).insertOne(newPokemon);
}

main().catch(console.error);

http.createServer(app).listen(PORT);
console.log("Web server is running at http://localhost:" + PORT);
process.stdin.setEncoding("utf8");
process.stdout.write("Stop to shutdown the server: ");
process.stdin.on('readable', function() {
	let dataInput = process.stdin.read();
	if (dataInput !== null) {
		let command = dataInput.trim();
		if (command === "stop") {
			console.log("Shutting down the server");
            process.exit(0);
        } else {
            console.log(`Invalid command: ${command}`);
        }
    process.stdout.write("Stop to shutdown the server: ");
    process.stdin.resume();
    }
});