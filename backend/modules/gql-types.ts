import * as Mongoose  from 'mongoose';
import * as _         from 'lodash';
import * as Vts       from 'vee-type-safe';

import {
    GraphQLScalarType,
    GraphQLField,
    GraphQLInputField,
    GraphQLNonNull
} from 'graphql';
import * as Apollo from 'apollo-server-express';
import ObjectId = Mongoose.Types.ObjectId;

export function makeTypeMatcher(typeDescr: Vts.TypeDescription) {
    return class TypeMatchDirective extends Apollo.SchemaDirectiveVisitor {

        visitInputFieldDefinition(field: GraphQLInputField) {
            this.wrapType(field);
        }
    
        visitFieldDefinition(field: GraphQLField<unknown, unknown>) {
            this.wrapType(field);
        }
    
        private static isGqlNonNull(suspect: unknown): suspect is GraphQLNonNull<any> {
            return suspect instanceof GraphQLNonNull;
        }

        // tslint:disable-next-line:prefer-function-over-method
        wrapType(field: GraphQLInputField | GraphQLField<unknown, unknown>) {
            if (TypeMatchDirective.isGqlNonNull(field.type) &&
                field.type.ofType instanceof GraphQLScalarType
            ) {
                field.type = new GraphQLNonNull(
                    new GqlTypeMatchedScalar(field.type.ofType, typeDescr),
                );
            } else if (field.type instanceof GraphQLScalarType) {
                field.type = new GqlTypeMatchedScalar(field.type, typeDescr);
            } else {
                throw new Error(
                    `TypeMatchDirective expected a scalar type, but got: ${field.type}`
                );
            }
        }
    };
}
export class GqlTypeMatchedScalar extends GraphQLScalarType {
    constructor(type: GraphQLScalarType, typeDescr: Vts.TypeDescription) {
        super({
            name: `TypeMatchedScalar`,
            serialize(value: unknown) {
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

function tryParseObjectId(id: string) {
    if (!ObjectId.isValid(id)) {
        throw new Error('invalid BsonObjectId format');
    }
    return new ObjectId(id);
}
export const GqlBsonObjectId = new GraphQLScalarType({
    name: 'BsonObjectId',
    description: 'BsonObjectId unique identifier.',
    serialize:  String,
    parseValue: tryParseObjectId,
    parseLiteral(ast) {
        if (ast.kind === 'StringValue') {
            return tryParseObjectId(ast.value);
        }
        throw new Error('BsonObjectId must be of string type');
    }
});