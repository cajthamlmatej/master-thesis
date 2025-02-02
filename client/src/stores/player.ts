import {defineStore} from "pinia";
import {computed, ref, toRaw, watch} from "vue";
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

    const slides = ref<Slide[]>([]);

    watch(() => materialStore.currentMaterial, (material) => {
        if (!material) return;

        slides.value = material.slides;
    });

    const activeSlide = ref<string | undefined>(undefined);

    const requestPlayer = async() => {
        if(!materialStore.currentMaterial) {
            throw new Error("No material loaded, cannot request player");
        }

        await changeSlide(getSlides()[0]);

        playerTime.value = Date.now();

        return getPlayer();
    }

    const getPlayer = (): Player | undefined => {
        if (!player.value) {
            return undefined;
        }

        return player.value as Player;
    }

    const setPlayer = (playerInstance: Player) => {
        player.value = playerInstance;
    }

    const setPlayerElement = (element: HTMLElement) => {
        playerElement.value = element;
    }

    const changeSlide = async (slideOrId: Slide | string) => {
        if (!playerElement.value) return;
        const slide = typeof slideOrId === "string" ? getSlideById(slideOrId) : slideOrId;

        if (!slide) return;

        if (player.value) {
            // player.value.destroy(); TODO: Implement destroy method
        }

        const deserializer = new PlayerDeserializer();
        const newPlayer = deserializer.deserialize(slide.data, playerElement.value);

        setPlayer(newPlayer);
        activeSlide.value = slide.id;
        slideTime.value = Date.now();
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
    }
});
