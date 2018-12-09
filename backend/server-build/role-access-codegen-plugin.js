"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Gql = require("graphql");
const _ = require("lodash");
exports.plugin = (schema => {
    const UserRoleValues = schema
        .getType('UserRole')
        .getValues()
        .map(v => v.value);
    return (`export namespace Access {
// tslint:disable:no-shadowed-variable
    ${_.reduce(schema.getTypeMap(), (code, type) => (!(type instanceof Gql.GraphQLObjectType) ||
        !type.astNode ||
        !type.astNode.directives ?
        code :
        `${code}${objectAccessDefintion(type)}`), '')}
// tslint:enable:no-shadowed-variable
}`);
    function stringifyRoleRestrictions(restrs) {
        return restrs ? `new Set([${restrs.join(', ')}])` : '__Free';
    }
    function objectAccessDefintion(type) {
        const objectRestrs = roleRestrictionsFromDirectives(type.astNode.directives);
        const fieldRestrs = _.compact(_.map(type.getFields(), (field, key) => {
            const restrs = roleRestrictionsFromField(field);
            return restrs && `${key}: ${stringifyRoleRestrictions(restrs)}`;
        }));
        return !objectRestrs && !fieldRestrs.length ? '' :
            `export const ${type.name} = {
    ${!objectRestrs ? '' : `$: ${stringifyRoleRestrictions(objectRestrs)},\n${space(8)}`}
    ${!fieldRestrs.length ? '' : fieldRestrs.join(`,\n${space(8)}`)}
};`;
    }
    function roleRestrictionsFromField({ astNode }) {
        return astNode && astNode.directives && roleRestrictionsFromDirectives(astNode.directives);
    }
    function roleRestrictionsFromDirectives(directives) {
        const dir = directives.find(({ name: { value } }) => ['allow', 'deny'].includes(value));
        return dir && directiveToAllowedRoles(dir);
    }
    function directiveToAllowedRoles({ arguments: args, name: { value: name } }) {
        const roles = args[0].value.values
            .map(valNode => valNode.value);
        // roles
        return (name === 'allow' ? roles : _.difference(UserRoleValues, roles))
            .map(userRoleValueToEnumAccess);
    }
    function userRoleValueToEnumAccess(role) {
        return `UserRole.${role[0].toUpperCase()}${role.slice(1)}`;
    }
    function space(amount) {
        return ' '.repeat(amount);
    }
});
