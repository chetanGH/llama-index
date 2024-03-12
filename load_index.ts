import * as dotenv from "dotenv";
import {
  MongoDBAtlasVectorSearch,
  SimpleMongoReader,
  storageContextFromDefaults,
  VectorStoreIndex,
} from "llamaindex";
import { MongoClient } from "mongodb";

// Load environment variables from local .env file
dotenv.config();

const mongoUri = process.env.mongo!;
const client = new MongoClient(mongoUri);

const databaseName:any = 'RAG';
const collectionName = 'acgme';
const vectorCollectionName = 'sample';
const indexName = 'vector_index';

async function loadAndIndex() {
  const client = new MongoClient(mongoUri);
  const db = client.db(databaseName)
  const collection = db.collection(collectionName);
  const reader = new SimpleMongoReader(client);
  const documents = await reader.loadData('RAG', 'acgme');

  // create Atlas as a vector store
  const vectorStore = new MongoDBAtlasVectorSearch({
    mongodbClient: client,
    dbName: 'RAG',
    collectionName: 'vectorCollectionName', // this is where your embeddings will be stored
    indexName: 'viktor', // this is the name of the index you will need to create
  });


  const storageContext = await storageContextFromDefaults({ vectorStore });
  await VectorStoreIndex.fromDocuments(documents, { storageContext });
  console.log(
    `Successfully created embeddings in the MongoDB collection ${vectorCollectionName}.`,
  );
  console.log("storageContext",storageContext)
  await client.close();
}

async function createSearchIndex() {
  const client = new MongoClient(mongoUri);
  const database = client.db('RAG');
  const collection = database.collection('vectorCollectionName');

  const index = {
    name: 'viktor',
    definition: {
      mappings: {
        dynamic: true,
        fields: [
          {
            type: "vector",
            path: "embedding",
            numDimensions: 1536,
            similarity: "cosine",
          },
        ],
      },
    },
  };
  // run the helper method
  const result = await collection.createSearchIndex(index);
  console.log("Successfully created search index:", result);
  await client.close();
}
// createSearchIndex().catch(console.error);
loadAndIndex().catch(console.error);