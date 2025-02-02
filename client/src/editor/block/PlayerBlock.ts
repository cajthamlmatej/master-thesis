import type Player from "@/editor/player/Player";
import {BlockInteractiveProperty, BlockInteractivity} from "@/editor/interactivity/BlockInteractivity";

export abstract class PlayerBlock {
    public id: string;
    public type: string;
    public position: {
        x: number;
        y: number;
    }
    public size: {
        width: number;
        height: number;
    }
    public rotation: number = 0;
    public zIndex: number = 0;

    public element!: HTMLElement;
    public player!: Player;
    public interactivity: BlockInteractivity[] = [];

    public readonly baseValues: {
        position: {
            x: number;
            y: number;
        }
        size: {
            width: number;
            height: number;
        }
        rotation: number;
        zIndex: number;
    }

    protected constructor(id: string, type: string, position: { x: number, y: number }, size: { width: number, height: number }, rotation: number, zIndex: number) {
        this.id = id;
        this.type = type;
        this.position = position;
        this.size = size;
        this.rotation = rotation;
        this.zIndex = zIndex;

        this.baseValues = {
            position: {
                x: position.x,
                y: position.y
            },
            size: {
                width: size.width,
                height: size.height
            },
            rotation: rotation,
            zIndex: zIndex
        }
    }

    /**
     * Renders the block element for the first time for the editor in the DOM.
     */
    public abstract render(): HTMLElement;

    public synchronize() {
        if (!this.element) return;

        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";

        this.element.style.width = this.size.width + "px";
        this.element.style.height = this.size.height + "px";

        this.element.style.transform = `rotate(${this.rotation}deg)`;
        this.element.style.zIndex = this.zIndex.toString();

        if(this.interactivity && this.interactivity.length > 0) {
            this.element.classList.add("block--interactive");
        }
    }

    public setPlayer(player: Player) {
        if (this.player) {
            throw new Error("Block already has an player.");
        }

        this.player = player;
    }

    public getInteractivityProperties(): BlockInteractiveProperty[] {
        return [
            {
                label: "Position X",
                change: (value: string): boolean => {
                    this.position.x = parseInt(value);
                    this.synchronize();
                    return true;
                },
                reset: () => {
                    this.position.x = this.baseValues.position.x;
                    this.synchronize();
                    return true;
                }
            },
            {
                label: "Position Y",
                change: (value: string): boolean => {
                    this.position.y = parseInt(value);
                    this.synchronize();
                    return true;
                },
                reset: () => {
                    this.position.y = this.baseValues.position.y;
                    this.synchronize();
                    return true;
                }
            },
            {
                label: "Width",
                change: (value: string): boolean => {
                    this.size.width = parseInt(value);
                    this.synchronize();
                    return true;
                },
                reset: () => {
                    this.size.width = this.baseValues.size.width;
                    this.synchronize();
                    return true;
                }
            },
            {
                label: "Height",
                change: (value: string): boolean => {
                    this.size.height = parseInt(value);
                    this.synchronize();
                    return true;
                },
                reset: () => {
                    this.size.height = this.baseValues.size.height;
                    this.synchronize();
                    return true;
                }
            },
            {
                label: "Rotation",
                change: (value: string): boolean => {
                    this.rotation = parseInt(value);
                    this.synchronize();
                    return true;
                },
                reset: () => {
                    this.rotation = this.baseValues.rotation;
                    this.synchronize();
                    return true;
                }
            },
            {
                label: "Z-Index",
                change: (value: string): boolean => {
                    this.zIndex = parseInt(value);
                    this.synchronize();
                    return true;
                },
                reset: () => {
                    this.zIndex = this.baseValues.zIndex;
                    this.synchronize();
                    return true;
                }
            }
        ]
    }

    /**
     * Called after the block has been rendered in the DOM. May be recalled after updates.
     */
    public afterRender() {
        this.element.addEventListener("click", this.handleClick.bind(this));
        this.element.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
        this.element.addEventListener("mouseleave", this.handleMouseLeave.bind(this));
    }

    private async handleClick(event: MouseEvent) {
        this.tryProcessInteractivity("CLICKED", event);
        event.stopPropagation();
    }

    private async handleMouseEnter(event: MouseEvent) {
        this.tryProcessInteractivity("HOVER_START", event);
        event.stopPropagation();
    }

    private async handleMouseLeave(event: MouseEvent) {
        this.tryProcessInteractivity("HOVER_END", event);
        event.stopPropagation();
    }

    private async tryProcessInteractivity(event: "CLICKED" | "HOVER_START" | "HOVER_END" | "DRAG_START" | "DRAG_END", eventObject: Event) {
        let anyCompleted = false;
        for(const interactivity of this.interactivity) {
            if(interactivity.event === event) {
                let canContinue = false;

                switch (interactivity.condition) {
                    case "ALWAYS":
                        canContinue = true;
                        break;
                    case "TIME_PASSED":
                        const { usePlayerStore } = await import("@/stores/player");
                        const playerStore = usePlayerStore();

                        const timeFrom = interactivity.timeFrom === "OPEN" ? playerStore.playerTime : playerStore.slideTime;
                        const time = Number(interactivity.time.toString()) * 1000;

                        if(Date.now() - timeFrom >= time) {
                            canContinue = true;
                        }
                        break;
                }

                if(!canContinue) continue;

                await this.processInteractivity(interactivity);
                anyCompleted = true;
            }
        }

        return anyCompleted;
    }

    private async processInteractivity(interactivity: BlockInteractivity) {
        switch (interactivity.action) {
            case "CHANGE_PROPERTY": {
                const { usePlayerStore } = await import("@/stores/player");

                let blocks = [] as PlayerBlock[];

                switch (interactivity.on) {
                    case "ALL":
                        blocks = this.player.getBlocks();
                        break;
                    case "SELF":
                        blocks = [this];
                        break;
                    case "SELECTED":
                        blocks = this.player.getBlocks().filter(b => interactivity.blocks?.includes(b.id));
                        break;
                }

                for(const block of blocks) {
                    const property = block.getInteractivityProperties().find(p => p.label === interactivity.property);

                    if(!property) continue;

                    property.change(interactivity.value);
                }
                break;
            }
            case "RESET_PROPERTY": {
                const { usePlayerStore } = await import("@/stores/player");

                let blocks = [] as PlayerBlock[];

                switch (interactivity.on) {
                    case "ALL":
                        blocks = this.player.getBlocks();
                        break;
                    case "SELF":
                        blocks = [this];
                        break;
                    case "SELECTED":
                        blocks = this.player.getBlocks().filter(b => interactivity.blocks?.includes(b.id));
                        break;
                }


                for(const block of blocks) {
                    if(interactivity.property === "ALL") {
                        for(const property of block.getInteractivityProperties()) {
                            property.reset();
                        }
                        continue;
                    }

                    const property = block.getInteractivityProperties().find(p => p.label === interactivity.property);

                    if(!property) continue;

                    property.reset();
                }
                break;
            }
            case "CHANGE_SLIDE": {
                // note(Matej): Lazy import to prevent circular dependencies
                const { usePlayerStore } = await import("@/stores/player");
                const playerStore = usePlayerStore();
                let slide: string | undefined = undefined;

                const current = playerStore.getActiveSlide();
                switch (interactivity.slideType) {
                    case "NEXT":
                        const next = playerStore.getSlides().find(s => s.position > current!.position);

                        if(!next) break;

                        slide = next.id;
                        break;
                    case "PREVIOUS":
                        const prev = playerStore.getSlides().reverse().find(s => s.position < current!.position);

                        if(!prev) return;

                        slide = prev.id;
                        break;
                    case "FIRST":
                        slide = playerStore.getSlides()[0].id;
                        break;
                    case "LAST":
                        slide = playerStore.getSlides()[playerStore.getSlides().length - 1].id;
                        break;
                    case "SLIDE":
                        const slideIndex = Number(interactivity.slideIndex);

                        if(isNaN(slideIndex)) break;

                        slide = playerStore.getSlides().sort((a, b) => a.position - b.position)[slideIndex].id;
                        break;
                    case "RANDOM":
                        slide = playerStore.getSlides()[Math.floor(Math.random() * playerStore.getSlides().length)].id;
                        break;
                }

                if(!slide) break;

                await playerStore.changeSlide(slide);
                break;
            }
        }
    }
}
