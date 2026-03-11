// usuario.models.ts
export interface AuthUser {
    username: string,
    password: string
}

export interface TokenCustom {
    access: string,
    refresh: string
}

export interface Persona {
    ci: string;
    nombres: string;
    apellido_paterno: string | null;
    apellido_materno: string | null;
    cargo: string;
    telefono: string | null;
    correo: string | null;
    unidad: string | null;
}

export interface RolInfo {
    id: number;
    nombre: string;
}

export interface Usuario {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    nombre_completo: string;
    persona: Persona | null;
    roles: RolInfo[];
    is_active: boolean;
    date_joined: string;
    last_login: string | null;
}

// Interfaz para la respuesta del login
export interface LoginResponse {
    message: string;
    data: {
        access: string;
        refresh: string;
        user: Usuario;
    }
}