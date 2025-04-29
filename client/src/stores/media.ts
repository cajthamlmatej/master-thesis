import {defineStore} from "pinia";
import {ref} from "vue";
import {api} from "@/api/api";
import {useUserStore} from "@/stores/user";

export const useMediaStore = defineStore("media", () => {
    const media = ref([] as { id: string, name: string, mimetype: string, size: number }[]);
    const userStore = useUserStore();

    const load = async () => {
        if (userStore.user === undefined) {
            return;
        }

        const response = await api.media.forUser(userStore.user.id);

        if (response === undefined) {
            return;
        }

        media.value = response.media;
    };

    const linkToMedia = (param: string | { id: string }) => {
        const mediaId = typeof param === "string" ? param : param.id;
        return `${api.base}media/${mediaId}`;
    }

    const upload = async (file: File) => {
        return await api.media.create(file);
    }

    return {
        media,
        load,
        linkToMedia,
        upload
    }
});
