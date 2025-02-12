import {useAuthenticationStore} from "@/stores/authentication";
import {AuthenticationRepository} from "./repository/authentication"
import {UserRepository} from "@/api/repository/user";
import {MaterialRepository} from "@/api/repository/material";
import {PreferencesRepository} from "@/api/repository/preferences";
import {MediaRepository} from "@/api/repository/media";


/**
 * Represents the API that manages repositories and the base URL.
 */
class Api {
    readonly base: string;

    public auth: AuthenticationRepository;
    public user: UserRepository;
    public material: MaterialRepository;
    public preferences: PreferencesRepository;
    public media: MediaRepository;

    constructor() {
        this.base = import.meta.env.VITE_API_BASE || 'https://api-masterthesis.cajthaml.dev/';

        this.auth = new AuthenticationRepository();
        this.user = new UserRepository();
        this.material = new MaterialRepository();
        this.preferences = new PreferencesRepository();
        this.media = new MediaRepository();
    }

    /**
     * Generates the headers for the API.
     */
    public generateHeaders() {
        const store = useAuthenticationStore();

        if (!store.isLogged || store.getToken() === undefined)
            return {}

        return {
            'Authorization': 'Bearer ' + store.getToken()
        }
    }
}

export const api = new Api();
