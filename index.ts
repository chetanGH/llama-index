import * as dotenv from "dotenv";
import fs from "fs/promises";
const readline = require("readline");

import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch,Document, VectorStoreIndex ,QdrantVectorStore,OpenAIEmbedding, serviceContextFromDefaults} from "llamaindex";
dotenv.config();

async function main() {
 
    async function answerQuestion(query:string){
        // const response = await queryEngine.query({
        //     'query': query,
        // });
        const client = new MongoClient(process.env.mongo!);
        const serviceContext = serviceContextFromDefaults();
        const store = new MongoDBAtlasVectorSearch({
          mongodbClient: client,
          dbName: 'RAG',
          collectionName: 'vectorCollectionName',
          indexName: 'viktor',
        });
      
        const index = await VectorStoreIndex.fromVectorStore(store, serviceContext);
      
        const retriever = index.asRetriever({ similarityTopK: 5 });
        const queryEngine = index.asQueryEngine({ retriever });
        const result = await queryEngine.query({
          'query': query,
        });
        // console.log(result)
        return result.response.toString();
    }

  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.setPrompt("Ask me a question: ");

  rl.on("line", (question:any) => {
    answerQuestion(question.trim()).then((answer:any)=>{
        console.log(answer);
        rl.prompt();
    })
  });

  rl.prompt();
}

main();