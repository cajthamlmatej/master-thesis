import {type Ref, watch} from "vue";

export const useScrollReact = (reactFnc: (scrollAmount: number) => void, scrollRef?: Ref<HTMLElement | null> | HTMLElement) => {
    const getElement = () => {
        if (scrollRef) {
            let element = scrollRef instanceof HTMLElement ? scrollRef : scrollRef.value;

            if(!element) {
                return document.documentElement;
            }

            return element;
        }
        return document.documentElement;
    }

    const react = (event: Event) => {
        const element = getElement();
        reactFnc(element.scrollTop);
    };

    document.removeEventListener("scroll", react);
    document.addEventListener("scroll", react);
};