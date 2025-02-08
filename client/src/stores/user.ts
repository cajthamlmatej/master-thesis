import {defineStore} from "pinia";
import {ref, watch} from "vue";
import {useAuthenticationStore} from "@/stores/authentication";
import type User from "@/models/User";
import {api} from "@/api/api";
import UserMapper from "@/models/mappers/UserMapper";

export const useUserStore = defineStore("user", () => {
    const authenticationStore = useAuthenticationStore();
    const user = ref<User | undefined>(undefined);

    watch(() => authenticationStore.isLogged, (value) => {
        if (!value) {
            // Reset the user store when the user logs out.
            user.value = undefined;
        } else {
            // Fetch the user when the user logs in.
            load();
        }
    });

    watch(() => authenticationStore.token, (value) => {
        load();
    });

    /**
     * Fetches the user from the API.
     */
    const fetchUser = async () => {
        if (!authenticationStore.isLogged) {
            return;
        }

        const response = await api.user.get(authenticationStore.parsed?.id ?? "")

        if (response === undefined) {
            return;
        }

        user.value = UserMapper.fromUserDTO(response.user);
    };


    let resolveLoaded: (value: boolean) => void = () => {
    };
    const userLoaded = new Promise((res) => resolveLoaded = res);

    const loaded = ref(false);

    /**
     * Loads the user, groups and permissions.
     */
    const load = async () => {
        loaded.value = false;
        await fetchUser();
        loaded.value = true;
        resolveLoaded(true);
    };


    // const changePassword = async (newPassword: string) => {
    //     if (!authenticationStore.isLogged) return;
    //
    //     const response = await api.user.changePassword(authenticationStore.parsed?.id ?? "", newPassword);
    //
    //     if (response === undefined) return;
    //
    //     return response;
    // }
    //
    // const deleteAccount = async (password: string) => {
    //     if (!authenticationStore.isLogged) return false;
    //
    //     const response = await api.user.delete(authenticationStore.parsed?.id ?? "", {password: password});
    //
    //     if (response === undefined) return false;
    //
    //     return response;
    // }

    return {
        user,
        loaded,
        load,
        // changePassword,
        // deleteAccount,
        userLoaded
    }
});
