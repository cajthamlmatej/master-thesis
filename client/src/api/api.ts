import {useAuthenticationStore} from "@/stores/authentication";
import {AuthenticationRepository} from "./repository/authentication"
import {UserRepository} from "@/api/repository/user";
import {DataExportRepository} from "@/api/repository/dataExport";


/**
 * Represents the API that manages repositories and the base URL.
 */
class Api {
    readonly base: string;

    public auth: AuthenticationRepository;
    public user: UserRepository;
    public dataExport: DataExportRepository;

    constructor() {
        this.base = import.meta.env.VITE_API_BASE || 'http://localhost:3000/';

        this.auth = new AuthenticationRepository();
        this.user = new UserRepository();
        this.dataExport = new DataExportRepository();
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
