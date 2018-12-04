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
        private http:          HttpClient,
        private getUsersGql:   Gql.GetUsersGQL,
        private getUserGql:    Gql.GetUserGQL,
        private updateUserGql: Gql.UpdateUserGQL,
        private updateMeGql:   Gql.UpdateMeGQL
    ) { }

    private options = { fetchPolicy: 'no-cache' } as { fetchPolicy: 'no-cache' };

    getUsers({ page, limit, search }: Api.PaginationArgs) {
        return this.getUsersGql.fetch({ req: {
            page, limit, search: {
                login: search
            },
        }}, this.options);
        // return this.http.get<Api.V1.Users.Get.Response>(
        //     Api.V1.Users.Get._, {
        //         params: Api.mapPageArgsToNgParams(pageArgs)
        //     }
        // );
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
