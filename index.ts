import fs from "fs/promises";
const readline = require("readline");
import { Document, VectorStoreIndex } from "llamaindex";
async function main() {
  // Load essay from abramov.txt in Node
  const essay = await fs.readFile(
    "node_modules/llamaindex/examples/abramov.txt",
    "utf-8",
  );



  // Create Document object with essay
  const document = new Document({ text: essay });

  // Split text and create embeddings. Store them in a VectorStoreIndex
  const index = await VectorStoreIndex.fromDocuments([document]);

  // Query the index
  const queryEngine = index.asQueryEngine();
    async function answerQuestion(query:string){
        const response = await queryEngine.query({
            'query': query,
        });
        return response.toString();
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
  // Output response
//   console.log(response.toString());
}

main();