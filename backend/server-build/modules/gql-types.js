"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Mongoose = require("mongoose");
const Vts = require("vee-type-safe");
const graphql_1 = require("graphql");
const Apollo = require("apollo-server-express");
var ObjectId = Mongoose.Types.ObjectId;
function makeTypeMatcher(typeDescr) {
    return class TypeMatchDirective extends Apollo.SchemaDirectiveVisitor {
        visitInputFieldDefinition(field) {
            this.wrapType(field);
        }
        visitFieldDefinition(field) {
            this.wrapType(field);
        }
        static isGqlNonNull(suspect) {
            return suspect instanceof graphql_1.GraphQLNonNull;
        }
        // tslint:disable-next-line:prefer-function-over-method
        wrapType(field) {
            if (TypeMatchDirective.isGqlNonNull(field.type) &&
                field.type.ofType instanceof graphql_1.GraphQLScalarType) {
                field.type = new graphql_1.GraphQLNonNull(new GqlTypeMatchedScalar(field.type.ofType, typeDescr));
            }
            else if (field.type instanceof graphql_1.GraphQLScalarType) {
                field.type = new GqlTypeMatchedScalar(field.type, typeDescr);
            }
            else {
                throw new Error(`TypeMatchDirective expected a scalar type, but got: ${field.type}`);
            }
        }
    };
}
exports.makeTypeMatcher = makeTypeMatcher;
class GqlTypeMatchedScalar extends graphql_1.GraphQLScalarType {
    constructor(type, typeDescr) {
        super({
            name: `TypeMatchedScalar`,
            serialize(value) {
                const serialized = type.serialize(value);
                Vts.ensureMatch(serialized, typeDescr);
                return serialized;
            },
            parseValue(...args) {
                const parsed = type.parseValue(...args);
                Vts.ensureMatch(parsed, typeDescr);
                return parsed;
            },
            parseLiteral(...args) {
                const parsed = type.parseLiteral(...args);
                Vts.ensureMatch(parsed, typeDescr);
                return parsed;
            }
        });
    }
}
exports.GqlTypeMatchedScalar = GqlTypeMatchedScalar;
function tryParseObjectId(id) {
    if (!ObjectId.isValid(id)) {
        throw new Error('invalid BsonObjectId format');
    }
    return new ObjectId(id);
}
exports.GqlBsonObjectId = new graphql_1.GraphQLScalarType({
    name: 'BsonObjectId',
    description: 'BsonObjectId unique identifier.',
    serialize: String,
    parseValue: tryParseObjectId,
    parseLiteral(ast) {
        if (ast.kind === 'StringValue') {
            return tryParseObjectId(ast.value);
        }
        throw new Error('BsonObjectId must be of string type');
    }
});
