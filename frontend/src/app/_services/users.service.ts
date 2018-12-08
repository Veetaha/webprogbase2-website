import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as Api from '@public-api/v1';
import * as Vts from 'vee-type-safe';
import * as Gql from '@services/gql';

@Injectable({
    providedIn: 'root'
})
export class UsersService {
    constructor(
        private http:              HttpClient,
        private getUsersGql:       Gql.GetUsersGQL,
        private getUserGql:        Gql.GetUserGQL,
        private getUserForEditGql: Gql.GetUserForEditGQL,
        private updateUserGql:     Gql.UpdateUserGQL,
        private updateMeGql:       Gql.UpdateMeGQL
    ) { }

    private options = { fetchPolicy: 'no-cache' } as { fetchPolicy: 'no-cache' };

    getUsers(req: Gql.GetUsersRequest) {
        return this.getUsersGql.fetch({ req }, this.options);
    }

    getUserForEdit(req: Gql.GetUserRequest) {
        return this.getUserForEditGql.fetch({ req }, this.options);
    }

    getUser(req: Gql.GetUserRequest) {
        return this.getUserGql.fetch({ req }, this.options);
    }

    updateMe(req: Gql.UpdateMeRequest) {
        return this.updateMeGql.mutate({ req }, this.options);
    }

    updateUser(req: Gql.UpdateUserRequest) {
        return this.updateUserGql.mutate({ req }, this.options);
    }

    putUser(req: Api.V1.User.Put.Request) {
        return this.http.put<void>(
            Api.V1.User.Put._,
            Vts.takeFromKeys(req, Api.V1.User.Put.RequestTD)
        );
    }


    deleteUser(userId: string) {
        return this.http.delete<void>(
            Api.V1.User.Delete._(userId),
        );
    }

    getMe() {
        return this.http.get<Api.V1.Me.Get.Response>(
            Api.V1.Me.Get._
        );
    }

}
