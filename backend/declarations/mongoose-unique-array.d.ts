declare module "mongoose-unique-array" {
    import { Schema } from 'mongoose';
    function plugin(schema: Schema): void;
    export = plugin;
}