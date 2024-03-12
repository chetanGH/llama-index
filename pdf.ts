import * as dotenv from "dotenv";
dotenv.config();
import fs from 'fs';
import pdfParse from 'pdf-parse';
import axios from 'axios';
import { MongoClient } from 'mongodb';
import { 
    IngestionPipeline,
  TitleExtractor,
  QuestionsAnsweredExtractor,
  Document,
  OpenAI,
  MarkdownNodeParser,
  SimpleNodeParser,
  SentenceSplitter,
  serviceContextFromDefaults,
  Ollama,
  OpenAIEmbedding,
  VectorStoreIndex,
 } from "llamaindex";

interface PDFDocument {
    fileName: string;
    text: string;
    embedding: number[];
}

async function extractTextFromPDF(filePath: string): Promise<string> {
    const pdfBuffer = await fs.promises.readFile(filePath);
    const pdfData = await pdfParse(pdfBuffer);
    return pdfData.text;
}

async function generateEmbedding(text: string): Promise<any> {
    try {
        // console.log(text);
        
    
        const response = await axios.post(
            'https://api.openai.com/v1/embeddings',
            {
                "input": text,
                "model": "text-embedding-ada-002",
                "encoding_format": "float"
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.OPENAI_API_KEY!}`
                }
            }
        );
        // const nodes = await pipeline.run({
        //     documents: [
        //       new Document({ 'text': text }),
        //     ],
        // });
        // for (const node of nodes) {
        //     console.log(node);
        // }
        console.log(response.statusText)
        const embedding = response.data;
        return embedding;
    } catch (error:any) {
        console.error('An error occurred:', error?.response?.data);
        return [];
    }
}

const client = new MongoClient(process.env.mongo!);
async function storeEmbeddingInMongoDB(embedding: number[], fileName: string, text: string) {
    try {
        await client.connect();
        const db = client.db('RAG');
        const collection = db.collection('pdf_embeddings');
        const document: PDFDocument = { fileName, text, embedding };
        await collection.insertOne(document);
        console.log('Embedding stored in MongoDB.');
    } finally {
        await client.close();
    }
}

async function main() {
    try {
        const filePath = 'sample.pdf';
        const text = await extractTextFromPDF(filePath);
        // const pipeline = new IngestionPipeline({
        //     transformations: [
        //       new TitleExtractor(),
        //       new QuestionsAnsweredExtractor({
        //         questions: 1,
        //       }),
        //     ],
        // });
        // const nodeParser = new SimpleNodeParser();
        // const splitter = new SentenceSplitter({ chunkSize: 1 });
        // const textSplits = splitter.splitText(text);
        // console.log("text",textSplits)
        // const nodes = await pipeline.run({
        //     documents: [
        //       new Document({ 'text': text }),
        //     ],
        // });
        // for (const node of nodes) {
        //     console.log("node",node)
        // }
        // const ollamaEmbedModel = new Ollama({model:'gemma'});
        const openaiEmbedModel = new OpenAIEmbedding({
            embedBatchSize:10,
            // dimensions:256,
            model:'text-embedding-ada-002',
            // nodeParser: new SimpleNodeParser({
            //     textSplitter:new SentenceSplitter(),
            //     includeMetadata:true,
            //     includePrevNextRel:true,
            //     chunkOverlap:1
            // })
        });
        const serviceContext = serviceContextFromDefaults({
            embedModel: openaiEmbedModel,
            nodeParser: new SimpleNodeParser({
                textSplitter:new SentenceSplitter(),
                includeMetadata:true,
                includePrevNextRel:true,
                chunkOverlap:1
            })
        });
        let doc = new Document({ 'text': text })
        const index = await VectorStoreIndex.fromDocuments([doc], {
            serviceContext,
          });
        console.log("doc",index)
        // const embedding = await generateEmbedding(text);
        // console.log("embedding.",embedding)
        // await storeEmbeddingInMongoDB(embedding, filePath, text);
    } catch (error) {
        console.error('An error occurred:', error);
    }
}

main();
