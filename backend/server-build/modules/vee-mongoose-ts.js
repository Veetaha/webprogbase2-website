"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
function makeSchema({ schemaDefinition, methods, statics, schemaOptions = undefined }) {
    const newSchema = schemaOptions
        ? new mongoose.Schema(schemaDefinition, schemaOptions)
        : new mongoose.Schema(schemaDefinition);
    newSchema.methods = methods;
    newSchema.statics = statics;
    return newSchema;
}
exports.makeSchema = makeSchema;
function makeModel(name, schema, collection, skipInit) {
    return skipInit ? mongoose.model(name, schema, collection, skipInit) :
        collection ? mongoose.model(name, schema, collection) :
            mongoose.model(name, schema);
}
exports.makeModel = makeModel;
const TypeDefinitionSymbol = Symbol('Symbol to fetch type properties info from VeeMongooseSchema');
const TypeMethodsSymbol = Symbol('Symbol to fetch methods info from VeeMongooseSchema');
const TypeStaticsSymbol = Symbol('Symbol to fetch static info from VeeMongooseSchema');
