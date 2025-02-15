import {defineStore} from "pinia";
import {ref, watch} from "vue";
import {useMaterialStore} from "@/stores/material";
import {Slide} from "@/models/Material";
import type Player from "@/editor/player/Player";
import {PlayerDeserializer} from "@/editor/player/PlayerDeserializer";


export const usePlayerStore = defineStore("player", () => {
    const materialStore = useMaterialStore();

    const player = ref<Player | undefined>(undefined);
    const playerElement = ref<HTMLElement | undefined>(undefined);

    const playerTime = ref<number>(0);
    const slideTime = ref<number>(0);

    const variables = ref<{ [key: string]: string }>({});

    const slides = ref<Slide[]>([]);
    const drawData = ref<{ slide: Slide, data: string }[]>([]);

    watch(() => materialStore.currentMaterial, (material) => {
        if (!material) return;

        slides.value = material.slides;
        drawData.value = [];
    });

    const activeSlide = ref<string | undefined>(undefined);

    const requestPlayer = async () => {
        if (!materialStore.currentMaterial) {
            throw new Error("No material loaded, cannot request player");
        }

        await changeSlide(getSlides()[0]);

        playerTime.value = Date.now();
        variables.value = {};

        return getPlayer();
    }

    const getPlayer = (): Player | undefined => {
        if (!player.value) {
            return undefined;
        }

        return player.value as Player;
    }

    const setPlayer = (playerInstance: Player) => {
        if(player.value) {
            player.value.destroy();
        }

        player.value = playerInstance;
    }

    const setPlayerElement = (element: HTMLElement) => {
        playerElement.value = element;

        if(player.value) {
            player.value.destroy();
            player.value = undefined;
        }

        drawData.value = [];
    }

    const saveDrawData = () => {
        if (!activeSlide.value) return;

        const slide = getSlideById(activeSlide.value);
        if (!slide) return;

        const player = getPlayer() as Player;

        if (!player) return;

        const data = player.getDraw().getData();

        let instance = drawData.value.find(d => d.slide.id === slide.id);

        if (!instance) {
            instance = {slide, data: ""};
            drawData.value.push(instance);
        }

        instance.data = data;
    }

    const changeSlide = async (slideOrId: Slide | string) => {
        if (!playerElement.value) return;
        const slide = typeof slideOrId === "string" ? getSlideById(slideOrId) : slideOrId;

        if (!slide) return;

        if (player.value) {
            saveDrawData();
            player.value.destroy();
        }

        const deserializer = new PlayerDeserializer();
        const newPlayer = deserializer.deserialize(slide.data, playerElement.value);

        setPlayer(newPlayer);
        activeSlide.value = slide.id;
        slideTime.value = Date.now();

        newPlayer.getDraw().applyData(drawData.value.find(d => d.slide.id === slide.id)?.data || "");
    }

    const getActiveSlide = () => {
        return getSlideById(activeSlide.value as string);
    }

    const getSlides = () => {
        return slides.value.sort((a, b) => a.position - b.position);
    }

    const getSlideById = (id: string) => {
        return slides.value.find(slide => slide.id === id);
    }

    return {
        requestPlayer,
        getPlayer,
        setPlayer,
        setPlayerElement,
        changeSlide,
        getActiveSlide,
        getSlides,
        getSlideById,
        playerTime,
        slideTime,
        variables,
    }
});
