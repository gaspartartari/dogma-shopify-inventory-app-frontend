import QueryString from "qs";
import type { AccessTokenPayloadDTO, CredentialsDTO, RoleEnum } from "../models/auth";
import { CLIENT_ID, CLIENT_SECRET } from "../utils/system";
import { requestBackend } from "../utils/requests";
import * as accessTokenRepository from '../repositories/access-token-repository';
import { jwtDecode } from "jwt-decode";

export function loginRequest(loginData: CredentialsDTO) {

    const headers = {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: "Basic " + window.btoa(CLIENT_ID + ":" + CLIENT_SECRET),
    };

    const requestBody = QueryString.stringify({ ...loginData, grant_type: "password" });

    const config = {
        method: "POST",
        url: "/oauth2/token",
        data: requestBody,
        headers

    };

    return requestBackend(config);

}

export function logout() {
    accessTokenRepository.remove();
}

export function saveAccessToken(token: string) {
    accessTokenRepository.save(token);
}

export function getAccessToken(): string | null {
    const token = accessTokenRepository.get();
    return token;
}

export function getAccessTokenPayload(): AccessTokenPayloadDTO | undefined {
    try {
        const token = accessTokenRepository.get();
        return token == null ? undefined : (jwtDecode(token) as AccessTokenPayloadDTO);
    } catch {
        return undefined;
    }
}
export function isAuthenticated(): boolean {
    // eslint-disable-next-line prefer-const
    let tokenPayload = getAccessTokenPayload();
    return tokenPayload && tokenPayload.exp * 1000 > Date.now() ? true : false;
}

export function hasAnyRoles(roles: RoleEnum[]): boolean {
    if (roles.length === 0) {
        return true;
    }
    const tokenPayload = getAccessTokenPayload();

    if (tokenPayload) {
        return roles.some(role => tokenPayload.authorities.includes(role));
    }
    return false;
}


