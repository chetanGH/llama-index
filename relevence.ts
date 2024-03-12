import * as dotenv from "dotenv";
dotenv.config();
import {
    RelevancyEvaluator,
    FaithfulnessEvaluator,
    OpenAI,
    serviceContextFromDefaults,
    MongoDBAtlasVectorSearch,
    VectorStoreIndex,
    CorrectnessEvaluator,
  } from "llamaindex";
import { MongoClient } from "mongodb";
import { dot } from "node:test/reporters";


    async function answerQuestion(query:string){
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
        return result;
    }

    function main(){
        const query = "Give me 10 points of qualification of program coordinator?";
        const llm = new OpenAI({
            model: "gpt-4",
        });
        const ctx = serviceContextFromDefaults({
            llm,
        });
        const evaluator = new RelevancyEvaluator({
            serviceContext: ctx,
        });
        const correct = new CorrectnessEvaluator({
            serviceContext: ctx,
        });
        const fairness = new FaithfulnessEvaluator({
            serviceContext: ctx,
        });
        answerQuestion(query)
        .then(async(response:any)=>{
            const relevence = await evaluator.evaluateResponse({
                query,
                response: response,
            });
            const correctoness = await correct.evaluate({
                query: query,
                response: response,
            });
            const fair = await fairness.evaluateResponse({
                query,
                response,
            });
            console.log("relevency",relevence);
            
            console.log("correctoness",correctoness);

            console.log("Fairness",fair);
        })
    }
    main()