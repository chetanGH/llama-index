import * as dotenv from "dotenv";
dotenv.config();
import { UnstructuredClient } from "unstructured-client";
import { PartitionResponse } from "unstructured-client/dist/sdk/models/operations";
import * as fs from "fs";
import { MongoClient } from 'mongodb';

const key:any = process.env.unst;
const mongodbURI:any = process.env.mongo
const client = new UnstructuredClient({
    security: {
        apiKeyAuth: key
    },
});

const filename = "sample.pdf";
const data = fs.readFileSync(filename);


client.general.partition({
    files: {
        content: data,
        fileName: "sample.pdf",
    },
    // # Other partition params
    coordinates:true,
    outputFormat:'application/json',
    strategy: "fast",
    pdfInferTableStructure:true
}).then(async(res: PartitionResponse) => {
    if (res.statusCode == 200) {
        const client = new MongoClient(mongodbURI);
        const db = client.db('RAG');
        const collection = db.collection('acgme');
        await collection.insertMany(res.elements!);
        
        console.log("length",res?.elements!.length);
    }
}).catch((e) => {
    console.log(e.statusCode);
    console.log(e.body);
});