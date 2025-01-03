import {computed, ref, watch} from "vue";
import {defineStore} from "pinia";
import * as jwt from "jsonwebtoken";
import {api} from "@/api/api";
import {useRoute, useRouter} from "vue-router";

export const useAuthenticationStore = defineStore("authentication", () => {
    const token = ref(localStorage.getItem("token") as string | undefined);

    // Watch for changes in the token and update the local storage so we dont lose it on refresh
    watch(token, (value) => {
        if (value === undefined) {
            localStorage.removeItem("token");
        } else {
            localStorage.setItem("token", value);
        }
    }, {
        immediate: true,
    });

    // Parse the token.
    const parsed = computed(() => {
        if (token.value === undefined) {
            return undefined;
        }

        try {
            return jwt.decode(token.value) as {
                exp: number;
                iat: number;

                id: string;
                name: string;
            }
        } catch (e) {
            return undefined;
        }
    });

    // Checks if the token is expired.
    const expired = computed(() => {
        if (parsed.value === null || parsed.value === undefined) {
            return true;
        }

        return parsed.value.exp < Date.now() / 1000;
    });

    // Checks if the user is logged in.
    const isLogged = computed(() => {
        return token.value !== undefined && !expired.value;
    });

    // Tries to login with provided email and password. Returns true if successful.
    const loginEmailAndPassword = async (email: string, password: string) => {
        const response = await api.auth.requestEmailPassword(email, password);
        if (response === undefined) {
            return false;
        }

        token.value = response.token;
        return true;
    }

    // Tries to login with provided email and/or code. Returns true when email is sent, false when login failed. With provided code it will return true if successful.
    const loginEmail = async (email: string, code: string | undefined) => {
        const response = await api.auth.requestEmail(email, code);
        if (response === undefined) {
            return false;
        }

        if (response.token === undefined) {
            return true;
        }

        token.value = response.token;
        return true;
    }

    const login = async (newToken: string) => {
        token.value = newToken;
    }

    /**
     * Tries to register a new user. Returns true if successful.
     * @param name The name of the user.
     * @param email The email of the user.
     * @param password The password of the user.
     */
    const register = async (name: string, email: string, password: string) => {
        const response = await api.auth.register({
            name,
            email,
            password,
        });
        return response !== undefined;
    };

    /**
     * Tries to activate a user. Returns true if successful.
     * @param token The token of the user.
     */
    const activate = async (token: string) => {
        const response = await api.auth.activate({
            token,
        });

        return response !== undefined;
    }

    const router = useRouter();
    const route = useRoute();

    // Logs out the user.
    const logout = async () => {
        token.value = undefined;

        // TODO: probably should be handled somewhere else
        await router.push({name: "Authentication"});
    }

    // Returns the token.
    const getToken = () => {
        return token.value;
    }

    return {
        isLogged,
        loginEmailAndPassword,
        loginEmail,
        login,
        logout,
        register,
        activate,
        getToken,
        token,
        parsed
    };
});
