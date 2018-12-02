import * as mongoose from 'mongoose';
import { BasicObject } from 'vee-type-safe';
import { SchemaTypeOpts } from "mongoose";



export type BufferConstructor             = typeof Buffer;
export type MongooseMixed                 = mongoose.Schema.Types.Mixed;
export type MongooseObjectId              = mongoose.Schema.Types.ObjectId;
export type MongooseDecimal128            = mongoose.Schema.Types.Decimal128;
export type MongooseMixedConstructor      = typeof mongoose.Schema.Types.Mixed;
export type MongooseObjectIdConstructor   = typeof mongoose.Schema.Types.ObjectId;
export type MongooseDecimal128Constructor = typeof mongoose.Schema.Types.Decimal128;

type OneElementTuple<T> = [T];
interface ArraySchemaTuple extends OneElementTuple<VeeSchemaDefinitionType> {}
interface VeeDesriptiveSchemaType {
    alias?: string;

    /* Common Options for all schema types */
    type?: VeeSchemaDefinitionType;

    /** Sets a default value for this SchemaType. */
    default?: SchemaTypeOpts.DefaultFn<DocumentPropertyMainType<VeeSchemaDefinitionType>>
            | DocumentPropertyMainType<VeeSchemaDefinitionType>;

    /**
     * Getters allow you to transform the representation of the data as it travels
     * from the raw mongodb document to the value that you see.
     */
    get?: (value: VeeSchemaDefinitionType, schematype?: this) => VeeSchemaDefinitionType | any;

    /** Declares the index options for this schematype. */
    index?: SchemaTypeOpts.IndexOpts | boolean | string;

    /**
     * Adds a required validator to this SchemaType. The validator gets added
     * to the front of this SchemaType's validators array using unshift().
     */
    required?: true | false;

    /**
     * Sets default select() behavior for this path.
     * Set to true if this path should always be included in the results, false
     * if it should be excluded by default. This setting can be overridden at
     * the query level.
     */
    select?: boolean | any;

    /**
     * Setters allow you to transform the data before it gets to the raw mongodb
     * document and is set as a value on an actual key.
     */
    set?: (value: VeeSchemaDefinitionType, schematype?: this) => VeeSchemaDefinitionType | any;

    /** Declares a sparse index. */
    sparse?: boolean | any;

    /** Declares a full text index. */
    text?: boolean | any;

    /**
     * Adds validator(s) for this document path.
     * Validators always receive the value to validate as their first argument
     * and must return Boolean. Returning false means validation failed.
     */
    validate?: RegExp | [RegExp, string] |
        SchemaTypeOpts.ValidateFn<VeeSchemaDefinitionType> | [SchemaTypeOpts.ValidateFn<VeeSchemaDefinitionType>, string] |
        SchemaTypeOpts.ValidateOpts | SchemaTypeOpts.AsyncValidateOpts |
        SchemaTypeOpts.AsyncPromiseValidationFn<VeeSchemaDefinitionType> | SchemaTypeOpts.AsyncPromiseValidationOpts |
        (SchemaTypeOpts.ValidateOpts | SchemaTypeOpts.AsyncValidateOpts |
            SchemaTypeOpts.AsyncPromiseValidationFn<VeeSchemaDefinitionType> | SchemaTypeOpts.AsyncPromiseValidationOpts)[];

    /** Declares an unique index. */
    unique?: boolean | any;


    /* Options for specific schema types (String, Number, Date, etc.) */
    /** String only - Adds an enum validator */
    enum?: VeeSchemaDefinitionType[] | SchemaTypeOpts.EnumOpts<VeeSchemaDefinitionType> | any;
    /** String only - Adds a lowercase setter. */
    lowercase?: boolean | any;
    /** String only - Sets a regexp validator. */
    match?: RegExp | [RegExp, string] | any;
    /** String only - Sets a maximum length validator. */
    maxlength?: number | [number, string] | any;
    /** String only - Sets a minimum length validator. */
    minlength?: number | [number, string] | any;
    /** String only - Adds a trim setter. */
    trim?: boolean | any;
    /** String only - Adds an uppercase setter. */
    uppercase?: boolean | any;

    /**
     * Date, Number only - Sets a minimum number validator.
     * Sets a minimum date validator.
     */
    min?: number | [number, string] |
        Date | [Date, string] |
        any;

    /**
     * Date, Number only - Sets a maximum number validator.
     * Sets a maximum date validator.
     */
    max?: number | [number, string] |
        Date | [Date, string] |
        any;

    /**
     * Date only - Declares a TTL index (rounded to the nearest second)
     * for Date types only.
     */
    expires?: number | string | any;

    /** ObjectId only - Adds an auto-generated ObjectId default if turnOn is true. */
    auto?: boolean | any;
}



type VeeSchemaDefinitionType = VeeSchemaDefinition[string];
interface VeeSchemaDefinition {
    [key: string]: StringConstructor
                 | BooleanConstructor
                 | NumberConstructor
                 | DateConstructor
                 | MapConstructor
                 | ArraySchemaTuple | never[]
                 | BufferConstructor
                 | MongooseObjectIdConstructor
                 | MongooseDecimal128Constructor
                 | MongooseMixedConstructor
                 | VeeDesriptiveSchemaType
                 | VeeSchemaDefinition;
}


type VeeSchemaData<T> = {
    [key in keyof T]: DocumentProperty<T[key]>;
};

export interface DocumentMapOf<T> extends Map<string, DocumentProperty<T>> {}
export interface DocumentArrayType<TItem> extends Array<DocumentProperty<TItem>> {}

type DocumentPropertyMainType<T> =
    T extends StringConstructor                           ? string                              :
    T extends BooleanConstructor                          ? boolean                             :
    T extends NumberConstructor                           ? number                              :
    T extends DateConstructor                             ? Date                                :
    T extends MapConstructor                              ? BasicObject<unknown>                :
    T extends never[]                                     ? unknown[]                           :
    T extends any[]                                       ? DocumentArrayType<T[number]>        :
    T extends BufferConstructor                           ? Buffer                              :
    T extends MongooseMixedConstructor                    ? MongooseMixed                       :
    T extends MongooseDecimal128Constructor               ? MongooseDecimal128                  :
    T extends MongooseObjectIdConstructor                 ? MongooseObjectId                    :
    T extends { type: StringConstructor, enum: any[]    } ? T['enum'][number]                   :
    T extends { type: StringConstructor                 } ? string                              :
    T extends { type: BooleanConstructor                } ? boolean                             :
    T extends { type: NumberConstructor                 } ? number                              :
    T extends { type: DateConstructor                   } ? Date                                :
    T extends { type: MapConstructor, of: any           } ? DocumentMapOf<T['of']>              :
    T extends { type: MapConstructor                    } ? BasicObject<unknown>                :
    T extends { type: never[]                           } ? unknown[]                           :
    T extends { type: any[]                             } ? DocumentArrayType<T['type'][0]>     :
    T extends { type: BufferConstructor                 } ? Buffer                              :
    T extends { type: MongooseObjectIdConstructor       } ? MongooseObjectId                    :
    T extends { type: MongooseMixedConstructor          } ? MongooseMixed                       :
    T extends { type: MongooseDecimal128Constructor     } ? MongooseDecimal128                  :
    T extends object                                      ? VeeSchemaData<T>              :
    T extends never                                       ? any                                 :
    never;

type DocumentProperty<T> = T extends { required: true }
                         ? DocumentPropertyMainType<T>
                         : (DocumentPropertyMainType<T> | undefined);

interface MakeSchemaArgument<
    T extends VeeSchemaDefinition,
    TMethods extends object,
    TStatics extends object
> {
    schemaDefinition: T;
    methods: TMethods;
    statics: TStatics;
    schemaOptions?: mongoose.SchemaOptions;
}

export interface VeeMethods<TSchema extends VeeMongooseSchema> {
    [key: string]: (this: VeeMongooseDocument<TSchema>, ...args: any[]) => any;
}

export interface VeeStatics<TSchema extends VeeMongooseSchema> {
    [key: string]: (this: VeeMongooseModel<TSchema>, ...args: any[]) => any;
}

export function makeSchema<
    T extends VeeSchemaDefinition,
    TMethods extends object,
    TStatics extends object,
>(
    { schemaDefinition, methods, statics, schemaOptions = undefined }
    : MakeSchemaArgument<T, TMethods, TStatics>
): VeeMongooseSchema<T, typeof methods, typeof statics> {
    const newSchema = schemaOptions
        ? new mongoose.Schema(schemaDefinition, schemaOptions)
        : new mongoose.Schema(schemaDefinition);
    newSchema.methods = methods;
    newSchema.statics = statics;
    return newSchema;
}

export function makeModel<TSchema extends VeeMongooseSchema>(
    name: string,
    schema: TSchema,
    collection?: string,
    skipInit?: boolean
) : VeeMongooseModel<TSchema> {
    return skipInit ? mongoose.model(name, schema, collection, skipInit) :
         collection ? mongoose.model(name, schema, collection) :
         mongoose.model(name, schema);
}

const TypeDefinitionSymbol = Symbol('Symbol to fetch type properties info from VeeMongooseSchema');
const TypeMethodsSymbol = Symbol('Symbol to fetch methods info from VeeMongooseSchema');
const TypeStaticsSymbol = Symbol('Symbol to fetch static info from VeeMongooseSchema');

interface VeeMongooseSchema<
    TSchemaDef extends VeeSchemaDefinition = any,
    TMethods = any,
    TStatics = any
> extends mongoose.Schema {
    [TypeDefinitionSymbol]?: VeeSchemaData<TSchemaDef>;
    [TypeMethodsSymbol]?:    TMethods;
    [TypeStaticsSymbol]?:    TStatics;
}

export type DocmumentDataFromSchema<TSchema extends VeeMongooseSchema>   = TSchema[typeof TypeDefinitionSymbol];
export type DocumentMethodsFromSchema<TSchema extends VeeMongooseSchema> = TSchema[typeof TypeMethodsSymbol];
export type ModelStaticsFromSchema<TSchema extends VeeMongooseSchema>    = TSchema[typeof TypeStaticsSymbol];

export type VeeMongooseDocument<TSchema  extends VeeMongooseSchema> =
    DocmumentDataFromSchema<TSchema>
  & DocumentMethodsFromSchema<TSchema>
  & mongoose.Document;



export type VeeMongooseModel<TSchema extends VeeMongooseSchema> =
    ModelStaticsFromSchema<TSchema>
  & mongoose.Model<VeeMongooseDocument<TSchema>, DocmumentDataFromSchema<TSchema>>;

