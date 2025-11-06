export type CredentialsDTO = {
    username: string;
    password: string;
}

export type RoleEnum = "ROLE_ADMIN" | "ROLE_OPERATOR";

export type AccessTokenPayloadDTO = {

    username: string;
    exp: number;
    authorities: RoleEnum[];
}

