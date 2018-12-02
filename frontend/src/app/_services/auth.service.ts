import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as Api from '@public-api/v1';
// import * as Vts from 'vee-type-safe';



@Injectable({
    providedIn: 'root'
})
export class AuthService {

    constructor(
        private http:    HttpClient
    ) { }

    login(credentials: Api.Auth.Login.Post.Request) {
        return this.http.post<Api.Auth.Login.Post.Response.Success>(
            Api.Auth.Login.Post._,
            credentials
        );
    }
    
    register(credentials: Api.Auth.Register.Post.Request) {
        return this.http.post<Api.Auth.Register.Post.Response.Success>(
            Api.Auth.Register.Post._,
            credentials
        );
    }


}
