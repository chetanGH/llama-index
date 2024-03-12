"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var dotenv = require("dotenv");
var llamaindex_1 = require("llamaindex");
var mongodb_1 = require("mongodb");
// Load environment variables from local .env file
dotenv.config();
var mongoUri = process.env.mongo;
var databaseName = 'RAG';
var collectionName = 'acgme';
var vectorCollectionName = 'sample';
var indexName = 'vector_index';
function loadAndIndex() {
    return __awaiter(this, void 0, void 0, function () {
        var client, reader, documents, vectorStore, storageContext;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new mongodb_1.MongoClient(mongoUri);
                    reader = new llamaindex_1.SimpleMongoReader(client);
                    return [4 /*yield*/, reader.loadData(databaseName, collectionName, [
                            "full_text",
                        ])];
                case 1:
                    documents = _a.sent();
                    vectorStore = new llamaindex_1.MongoDBAtlasVectorSearch({
                        mongodbClient: client,
                        dbName: databaseName,
                        collectionName: vectorCollectionName,
                        indexName: indexName
                    });
                    return [4 /*yield*/, (0, llamaindex_1.storageContextFromDefaults)({ vectorStore: vectorStore })];
                case 2:
                    storageContext = _a.sent();
                    return [4 /*yield*/, llamaindex_1.VectorStoreIndex.fromDocuments(documents, { storageContext: storageContext })];
                case 3:
                    _a.sent();
                    console.log("Successfully created embeddings in the MongoDB collection ".concat(vectorCollectionName, "."));
                    return [4 /*yield*/, client.close()];
                case 4:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
/**
 * This method is document in https://www.mongodb.com/docs/atlas/atlas-search/create-index/#create-an-fts-index-programmatically
 * But, while testing a 'CommandNotFound' error occurred, so we're not using this here.
 */
function createSearchIndex() {
    return __awaiter(this, void 0, void 0, function () {
        var client, database, collection, index, result;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    client = new mongodb_1.MongoClient(mongoUri);
                    database = client.db(databaseName);
                    collection = database.collection('acgme');
                    index = {
                        name: indexName,
                        definition: {
                            /* search index definition fields */
                            mappings: {
                                dynamic: true,
                                fields: [
                                    {
                                        type: "vector",
                                        path: "metadata",
                                        numDimensions: 1536,
                                        similarity: "cosine"
                                    },
                                ]
                            }
                        }
                    };
                    return [4 /*yield*/, collection.createSearchIndex(index)];
                case 1:
                    result = _a.sent();
                    console.log("Successfully created search index:", result);
                    return [4 /*yield*/, client.close()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
createSearchIndex()["catch"](console.error);
// loadAndIndex().catch(console.error);
