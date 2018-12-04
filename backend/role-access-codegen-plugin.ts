import * as GqlGen from 'graphql-codegen-core';
import * as Gql from 'graphql';
import * as _ from 'lodash';

export const plugin = (schema => {
    const UserRoleValues: string[] = (schema
        .getType('UserRole') as Gql.GraphQLEnumType)
        .getValues()
        .map(v => v.value);
    return (
`export namespace Access {
// tslint:disable:no-shadowed-variable
    ${_.reduce(schema.getTypeMap(), (code, type) => (
        !(type instanceof Gql.GraphQLObjectType) ||
        !type.astNode                            ||
        !type.astNode.directives                 ?
        code                                     :
        `${code}${objectAccessDefintion(type)}`), '')}
// tslint:enable:no-shadowed-variable
}`);
    function stringifyRoleRestrictions(restrs?: string[] | null) {
        return restrs ? `new Set([${restrs.join(', ')}])` : '__Free';
    }


    function objectAccessDefintion(type: Gql.GraphQLObjectType) {
        const objectRestrs = roleRestrictionsFromDirectives(type.astNode!.directives!);
        const fieldRestrs = _.compact(_.map(type.getFields(), (field, key) => {
            const restrs = roleRestrictionsFromField(field);
            return restrs && `${key}: ${stringifyRoleRestrictions(restrs)}`;
        }));

        return !objectRestrs && !fieldRestrs.length ? '' :
`export const ${type.name} = {
    ${!objectRestrs ? '' : `$: ${stringifyRoleRestrictions(objectRestrs)},\n${space(8)}`}
    ${!fieldRestrs.length ? '' : fieldRestrs.join(`,\n${space(8)}`)}
};`
        
        ;
    }

    function roleRestrictionsFromField({ astNode }: Gql.GraphQLField<unknown, unknown>) {
        return astNode && astNode.directives && roleRestrictionsFromDirectives(astNode.directives);
    }

    function roleRestrictionsFromDirectives(directives: ReadonlyArray<Gql.DirectiveNode>) {
        const dir = directives.find(({name: {value}}) => ['allow', 'deny'].includes(value));
        return dir && directiveToAllowedRoles(dir);
    }
    function directiveToAllowedRoles({ arguments: args, name: { value: name }}: Gql.DirectiveNode) {
        const roles = (args![0].value as Gql.ListValueNode).values
            .map(valNode => (valNode as Gql.EnumValueNode).value);
        // roles
        return (name === 'allow' ? roles : _.difference(UserRoleValues, roles))
            .map(userRoleValueToEnumAccess);
    }
    function userRoleValueToEnumAccess(role: string) {
        return `UserRole.${role[0].toUpperCase()}${role.slice(1)}`;
    }
    function space(amount: number) {
        return ' '.repeat(amount);
    }
}) as GqlGen.PluginFunction<unknown>;