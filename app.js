const my_mongodb = require("mongodb");
const fetch = require("node-fetch");
const {
  uniqueNamesGenerator,
  adjectives,
  colors,
  animals,
} = require("unique-names-generator");

const env = require("dotenv").config().parsed;
const database_password = env["MONGODB_PASSWORD"];

const SRV_STRING = `mongodb+srv://ahmarcode-one:${database_password}@ahmar-my-first-cluster.jegayvb.mongodb.net/?retryWrites=true&w=majority`;

const URL_LIST = [
  "google.com",
  "netflix.com",
  "cloudflare.com",
  "yandex.com",
  "jetbrains.com",
  "uidai.gov.in",
];

function getRandomWebsiteURL(list = URL_LIST) {
  return list[Math.floor(Math.random() * list.length)];
}

function getUniqueName() {
  const output = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    separator: "-",
  });
  return output;
}

function sleepFor10Seconds() {
  function mySleep() {
    const startTime = Date.now();
    for (let i = 0; i < 4e9; i++) {}
    const endTime = Date.now();
    const timeTaken = (endTime - startTime) / 1e3;
    console.log("I am done", { timeTaken });
    return timeTaken;
  }

  mySleep();
  mySleep();
}

// copied
const { MongoClient, ServerApiVersion } = require("mongodb");

// Replace the placeholder with your Atlas connection string
const uri = SRV_STRING;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function visitWebsite(url = "google.com") {
  if (!url.startsWith("http") && !url.startsWith("https")) {
    url = "https://" + url;
  }
  const startTime = Date.now();
  const response = await fetch(url);
  const endTime = Date.now();
  const timeTaken = (endTime - startTime) / 1e3;

  console.log("visitWebsite", { response });
  console.log("-----\n", { timeTaken });
  return [timeTaken, response];
}
async function run() {
  try {
    // Connect the client to the server (optional starting in v4.7)
    await client.connect();

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    async function findItem(someArg = { item: "journal" }) {
      const someMovies = await client
        .db("test")
        .collection("movies")
        .findOne(someArg);
      console.log(someMovies);
    }

    async function addItem(
      someArg = { time: new Date().toLocaleTimeString() }
    ) {
      const response = await client.db("test").collection("movies").insertMany([
        someArg,
        // {
        //   item: 'journal',
        //   qty: 25,
        //   tags: ['blank', 'red'],
        //   size: { h: 14, w: 21, uom: 'cm' }
        // },
        // {
        //   item: 'mat',
        //   qty: 85,
        //   tags: ['gray'],
        //   size: { h: 27.9, w: 35.5, uom: 'cm' }
        // },
        // {
        //   item: 'mousepad',
        //   qty: 25,
        //   tags: ['gel', 'blue'],
        //   size: { h: 19, w: 22.85, uom: 'cm' }
        // }
      ]);
      console.log(response);
      return response;
    }

    async function addLatencyDatumToCloud(url = getRandomWebsiteURL()) {
      const [timeTaken, response_] = await visitWebsite(getRandomWebsiteURL());

      const _date = new Date();
      const time = _date.toLocaleDateString();
      const date = _date.toLocaleTimeString();
      const myId = getUniqueName();
      const httpStatus = {
        statusCode: response_.status,
        statusText: response_.statusText,
      };

      const payload = {
        date,
        myId,
        time,
        url,
        timeTaken,
        httpStatus,
      };
      const response = await client
        .db("test")
        .collection("movies")
        .insertMany([payload]);

      console.log({ response, payload });
      return { response, payload };
    }

    async function monitorInternetLatencyEvery10Seconds() {
      while (true) {
        await addLatencyDatumToCloud();
        console.log("website visited");
        sleepFor10Seconds();
      }
    }

    await monitorInternetLatencyEvery10Seconds();
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}
run().catch(console.dir);
