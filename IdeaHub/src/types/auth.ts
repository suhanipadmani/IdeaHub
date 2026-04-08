import type { IUser } from './index';

export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    name: string;
    email: string;
    password: string;
    role?: 'founder' | 'admin';
}

export interface AuthResponse {
    token: string;
    user: IUser;
}
