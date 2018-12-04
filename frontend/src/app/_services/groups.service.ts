import { Injectable } from '@angular/core';

import * as Gql from '@services/gql';


@Injectable({
  providedIn: 'root'
}) export class GroupsService {
    constructor(
        private getGroupsGql:   Gql.GetGroupsGQL,
        private getGroupGql:    Gql.GetGroupGQL,
        private createGroupGql: Gql.CreateGroupGQL,
        private updateGroupGql: Gql.UpdateGroupGQL,
        private deleteGroupGql: Gql.DeleteGroupGQL
    ) { }
    private options = { fetchPolicy: 'no-cache' } as { fetchPolicy: 'no-cache' };

    getGroups(req: Gql.GetGroupsRequest) {
        return this.getGroupsGql.fetch({ req }, this.options);
    }

    getGroup(groupReq: Gql.GetGroupRequest, membersReq: Gql.GetGroupMembersRequest) {
        return this.getGroupGql.fetch({ groupReq, membersReq }, this.options);
    }

    createGroup(req: Gql.CreateGroupRequest) {
        return this.createGroupGql.mutate({ req }, this.options);
    }

    updateGroup(req: Gql.UpdateGroupRequest) {
        return this.updateGroupGql.mutate({ req }, this.options);
    }
    
    deleteGroup(req: Gql.DeleteGroupRequest) {
        return this.deleteGroupGql.mutate({ req }, this.options);
    }
}
