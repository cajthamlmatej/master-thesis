import type Player from "@/editor/player/Player";
import {
    BlockInteractiveProperty,
    BlockInteractivity,
    BlockInteractivityEasings
} from "@/editor/interactivity/BlockInteractivity";
import {BlockConstructor} from "@/editor/block/BlockConstructor";
import {BlockEvent} from "@/editor/block/events/BlockEvent";
import {LISTENER_METADATA_KEY} from "@/editor/block/events/BlockListener";
import {
    BLOCK_API_FEATURE_METADATA_KEY,
    PlayerBlockApiFeatureEntry
} from "@/editor/plugin/player/RegisterPlayerBlockApiFeature";
import {
    BlockSerialize,
    SerializeEntry,
    SERIALIZER_METADATA_KEY
} from "@/editor/block/serialization/BlockPropertySerialize";
import {communicator} from "@/api/websockets";

/**
 * Represents a block in the player environment. This abstract class provides
 * the base functionality for rendering, synchronizing, and interacting with blocks
 * in the player.
 */
export abstract class PlayerBlock {
    @BlockSerialize("id")
    public id: string;
    @BlockSerialize("type")
    public type: string;
    @BlockSerialize("position")
    public position: {
        x: number;
        y: number;
    }
    @BlockSerialize("size")
    public size: {
        width: number;
        height: number;
    }
    @BlockSerialize("opacity")
    public opacity: number = 1;
    @BlockSerialize("rotation")
    public rotation: number = 0;
    @BlockSerialize("zIndex")
    public zIndex: number = 0;
    @BlockSerialize("group")
    public group?: string;

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
        opacity: number;
        group?: string;
    }

    // note(Matej): sadly this has to be any type because it would cause circular dependency issues
    public playerStore: any;

    public loaded: Promise<void>;
    private repeats: { timeouts: NodeJS.Timeout[], intervals: NodeJS.Timeout[] } = {timeouts: [], intervals: []};
    private resolveLoaded: () => void;

    protected constructor(base: BlockConstructor) {
        this.id = base.id;
        this.type = base.type;
        this.position = base.position;
        this.size = base.size;
        this.rotation = base.rotation;
        this.zIndex = base.zIndex;
        this.group = base.group;
        this.interactivity = base.interactivity || [];
        this.opacity = base.opacity === undefined ? 1 : base.opacity;

        this.baseValues = {
            position: {
                x: this.position.x,
                y: this.position.y
            },
            size: {
                width: this.size.width,
                height: this.size.height
            },
            rotation: this.rotation,
            zIndex: this.zIndex,
            opacity: this.opacity * 100,
            group: this.group
        };

        this.loadPlayerStore();
        this.loaded = new Promise((res) => this.resolveLoaded = res);
    }

    /**
     * Renders the block element for the first time for the editor in the DOM.
     * @returns The rendered HTMLElement.
     */
    public abstract render(): HTMLElement;

    /**
     * Synchronizes the block's DOM element with its properties.
     */
    public synchronize() {
        if (!this.element) return;

        this.element.style.left = this.position.x + "px";
        this.element.style.top = this.position.y + "px";

        this.element.style.width = this.size.width + "px";
        this.element.style.height = this.size.height + "px";

        this.element.style.transform = `rotate(${this.rotation}deg)`;
        this.element.style.opacity = this.opacity.toString();
        this.element.style.zIndex = this.zIndex.toString();

        if (this.interactivity && this.interactivity.filter(a => a.event == "CLICKED" || a.event === "HOVER_START").length > 0) {
            this.element.classList.add("block--interactive");
        }
    }

    /**
     * Sets the player instance for the block.
     * @param player The player instance to associate with the block.
     * @throws Error if the block already has a player.
     */
    public setPlayer(player: Player) {
        if (this.player) {
            throw new Error("Block already has an player.");
        }

        this.player = player;
    }

    /**
     * Retrieves the interactivity properties of the block.
     * @returns An array of interactivity properties.
     */
    public getInteractivityProperties(): BlockInteractiveProperty[] {
        return [
            {
                label: "position-x",
                getBaseValue: () => this.baseValues.position.x,
                change: (value: any, relative: boolean, {animate, duration, easing}) => {
                    let target = parseInt(value);

                    if (relative) {
                        target += this.position.x;
                    }

                    if (animate) {
                        this.element.animate([
                            {left: this.position.x + "px"},
                            {left: target + "px"}
                        ], {
                            duration: duration,
                            easing: BlockInteractivityEasings[easing as keyof typeof BlockInteractivityEasings]
                        }).addEventListener("finish", () => {
                            this.position.x = target;
                            this.synchronize();
                        });
                    } else {
                        this.position.x = target;
                        this.synchronize();
                    }
                    return true;
                }
            },
            {
                label: "position-y",
                getBaseValue: () => this.baseValues.position.y,
                change: (value: any, relative: boolean, {animate, duration, easing}) => {
                    let target = parseInt(value);

                    if (relative) {
                        target += this.position.y;
                    }

                    if (animate) {
                        this.element.animate([
                            {top: this.position.y + "px"},
                            {top: target + "px"}
                        ], {
                            duration: duration,
                            easing: BlockInteractivityEasings[easing as keyof typeof BlockInteractivityEasings]
                        }).addEventListener("finish", () => {
                            this.position.y = target;
                            this.synchronize();
                        });
                    } else {
                        this.position.y = target;
                        this.synchronize();
                    }
                    return true;
                }
            },
            {
                label: "width",
                getBaseValue: () => this.baseValues.size.width,
                change: (value: any, relative: boolean, {animate, duration, easing}) => {
                    let target = parseInt(value);

                    if (relative) {
                        target += this.size.width;
                    }

                    if (animate) {
                        this.element.animate([
                            {width: this.size.width + "px"},
                            {width: target + "px"}
                        ], {
                            duration: duration,
                            easing: BlockInteractivityEasings[easing as keyof typeof BlockInteractivityEasings]
                        }).addEventListener("finish", () => {
                            this.size.width = target;
                            this.synchronize();
                        });
                    } else {
                        this.size.width = target;
                        this.synchronize();
                    }
                    return true;
                }
            },
            {
                label: "height",
                getBaseValue: () => this.baseValues.size.height,
                change: (value: any, relative: boolean, {animate, duration, easing}) => {
                    let target = parseInt(value);

                    if (relative) {
                        target += this.size.height;
                    }

                    if (animate) {
                        this.element.animate([
                            {height: this.size.height + "px"},
                            {height: target + "px"}
                        ], {
                            duration: duration,
                            easing: BlockInteractivityEasings[easing as keyof typeof BlockInteractivityEasings]
                        }).addEventListener("finish", () => {
                            this.size.height = target;
                            this.synchronize();
                        });
                    } else {
                        this.size.height = target;
                        this.synchronize();
                    }
                    return true;
                }
            },
            {
                label: "rotation",
                getBaseValue: () => this.baseValues.rotation,
                change: (value: any, relative: boolean, {animate, duration, easing}) => {
                    let target = parseInt(value);

                    if (relative) {
                        target += this.rotation;
                    }

                    if (animate) {
                        this.element.animate([
                            {transform: `rotate(${this.rotation}deg)`},
                            {transform: `rotate(${target}deg)`}
                        ], {
                            duration: duration,
                            easing: BlockInteractivityEasings[easing as keyof typeof BlockInteractivityEasings]
                        }).addEventListener("finish", () => {
                            this.rotation = target;
                            this.synchronize();
                        });
                    } else {
                        this.rotation = target;
                        this.synchronize();
                    }
                    return true;
                }
            },
            {
                label: "z-index",
                getBaseValue: () => this.baseValues.zIndex,
                change: (value: any, relative: boolean) => {
                    let target = parseInt(value);

                    if (relative) {
                        target += this.zIndex;
                    }

                    this.zIndex = target;
                    this.synchronize();
                    return true;
                }
            },
            {
                label: "opacity",
                getBaseValue: () => this.baseValues.opacity,
                change: (value: any, relative: boolean, {animate, duration, easing}) => {
                    let target = parseFloat(value) / 100; // 0-100 to 0-1

                    if (relative) {
                        target += this.opacity;
                    }

                    target = Math.min(1, Math.max(0, target));

                    if (animate) {
                        this.element.animate([
                            {opacity: this.opacity},
                            {opacity: target}
                        ], {
                            duration: duration,
                            easing: BlockInteractivityEasings[easing as keyof typeof BlockInteractivityEasings]
                        }).addEventListener("finish", () => {
                            this.opacity = target;
                            this.synchronize();
                        });
                    } else {
                        this.opacity = target;
                        this.synchronize();
                    }
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

        for (let interactivity of this.interactivity.filter(i => i.event === "TIMER")) {
            if (interactivity.timerType === "REPEAT") {
                this.repeats.intervals.push(setInterval(async () => {
                    await this.loaded;

                    const canContinue = this.checkInteractivityConditions(interactivity);

                    if (!canContinue) return;

                    this.processInteractivity(interactivity);
                }, interactivity.timerTime));
            } else if (interactivity.timerType === "TIMEOUT") {
                this.repeats.timeouts.push(setTimeout(async () => {
                    await this.loaded;

                    const canContinue = this.checkInteractivityConditions(interactivity);

                    if (!canContinue) return;

                    this.processInteractivity(interactivity);
                }, interactivity.timerTime));
            } else if (interactivity.timerType === "NOW-REPEAT") {
                this.repeats.intervals.push(setInterval(async () => {
                    await this.loaded;

                    const canContinue = this.checkInteractivityConditions(interactivity);

                    if (!canContinue) return;

                    this.processInteractivity(interactivity);
                }, interactivity.timerTime));

                (async () => {
                    await this.loaded;

                    const canContinue = this.checkInteractivityConditions(interactivity);

                    if (!canContinue) return;

                    this.processInteractivity(interactivity);
                })();
            }
        }

        this.player.events.LOADED.on(() => {
            this.tryProcessInteractivity("SLIDE_LOAD");
        });
    }

    /**
     * Serializes the block properties to an object for saving.
     * @returns A serialized object representing the block.
     */
    public serialize(): Object {
        let serialized: any = {};

        const instance = this as any;
        const keys = Reflect.getMetadataKeys(this);

        for (const key of keys) {
            if (!key.startsWith(SERIALIZER_METADATA_KEY)) continue;

            const metadata = Reflect.getMetadata(key, this);

            if (!metadata) continue;

            const serializers = metadata as Set<SerializeEntry>;

            for (const serializer of serializers) {
                if (!(serializer.propertyKey in instance)) {
                    console.error(`Property ${serializer.propertyKey} does not exist on block ${this.id} (${this.type}).`);
                    continue;
                }

                if (serializer.key in serialized) {
                    console.error(`Key ${serializer.key} already exists on block ${this.id} (${this.type}).`);
                    continue;
                }

                serialized[serializer.key] = instance[serializer.propertyKey];
            }
        }

        // note(Matej): deep clone the object to avoid circular references and other issues
        serialized = JSON.parse(JSON.stringify(serialized));

        return serialized;
    }
    
    /**
     * Processes an event by calling all registered listeners for the event.
     * @param event The event to process.
     * @param args Arguments to pass to the event listeners.
     */
    public processEvent(event: BlockEvent, ...args: any[]) {
        const instance = this as any;
        const keys = Reflect.getMetadataKeys(this);

        for (const key of keys) {
            if (!key.startsWith(LISTENER_METADATA_KEY)) continue;

            const metadata = Reflect.getMetadata(key, this);

            if (!metadata) continue;

            const listeners = metadata.get(event);

            if (!listeners) continue;

            for (const listener of listeners) {
                if (!instance[listener]) {
                    console.error(`Listener ${listener} for event ${event} does not exist on block ${this.id} (${this.type}).`);
                    continue
                }

                instance[listener](...args);
            }
        }
    }

    /**
     * Retrieves the API features available for the block.
     * @returns An array of API feature entries.
     */
    public getApiFeatures(): PlayerBlockApiFeatureEntry[] {
        const target = Object.getPrototypeOf(this).constructor;
        const keys = Reflect.getMetadataKeys(target);
        const apiFeatures: PlayerBlockApiFeatureEntry[] = [];

        for (const key of keys) {
            if (!key.startsWith(BLOCK_API_FEATURE_METADATA_KEY)) continue;

            const metadata = Reflect.getMetadata(key, target);

            if (!metadata) continue;

            const metadataFeatures = metadata as Set<PlayerBlockApiFeatureEntry>;

            for (const feature of metadataFeatures) {
                apiFeatures.push(feature);
            }
        }

        return apiFeatures;
    }

    /**
     * Sends a message to the player room associated with the block.
     * @param message The message to send.
     */
    public sendMessage(message: string) {
        const room = communicator.getPlayerRoom();

        if (!room) return;

        room.sendBlockMessage(message, this.id);
    }

    /**
     * Checks if the block is in the player room.
     * @returns A promise that resolves to a boolean indicating if the block is in the player room.
     */
    public async isInPlayerRoom() {
        await this.loaded;
        await communicator.readyPromise;
        const room = communicator.getPlayerRoom();

        console.log("isInPlayerRoom", room);
        if (!room) return false;

        await room.joined;
        return true;
    }

    /**
     * Checks if the current user is the presenter in the player room.
     * @returns A boolean indicating if the user is the presenter.
     */
    public isPresenter() {
        const room = communicator.getPlayerRoom();

        if (!room) return false

        return room.isPresenter;
    }

    /**
     * Loads the player store and resolves the `loaded` promise.
     */
    private async loadPlayerStore() {
        const {usePlayerStore} = await import("@/stores/player");
        this.playerStore = usePlayerStore();
        this.resolveLoaded();
    }

    /**
     * Handles the click event on the block element.
     * @param event The mouse event.
     */
    private async handleClick(event: MouseEvent) {
        const result = this.tryProcessInteractivity("CLICKED");
        if (result) event.stopPropagation();
    }

    /**
     * Handles the mouse enter event on the block element.
     * @param event The mouse event.
     */
    private async handleMouseEnter(event: MouseEvent) {
        const result = this.tryProcessInteractivity("HOVER_START");
        if (result) event.stopPropagation();
    }

    /**
     * Handles the mouse leave event on the block element.
     * @param event The mouse event.
     */
    private async handleMouseLeave(event: MouseEvent) {
        const result = this.tryProcessInteractivity("HOVER_END");
        if (result) event.stopPropagation();
    }

    /**
     * Attempts to process interactivity for a specific event.
     * @param event The event to process interactivity for.
     * @returns A boolean indicating if any interactivity was processed.
     */
    private tryProcessInteractivity(event: "CLICKED" | "HOVER_START" | "HOVER_END" | "SLIDE_LOAD") {
        let anyCompleted = false;
        for (const interactivity of this.interactivity) {
            if (interactivity.event === event) {
                const canContinue = this.checkInteractivityConditions(interactivity);

                if (!canContinue) continue;

                this.processInteractivity(interactivity);
                anyCompleted = true;
            }
        }

        return anyCompleted;
    }

    /**
     * Checks if the conditions for a specific interactivity are met.
     * @param interactivity The interactivity to check.
     * @returns A boolean indicating if the conditions are met.
     */
    private checkInteractivityConditions(interactivity: BlockInteractivity) {
        let canContinue = false;

        switch (interactivity.condition) {
            case "ALWAYS":
                canContinue = true;
                break;
            case "TIME_PASSED": {
                const timeFrom = interactivity.timeFrom === "OPEN" ? this.playerStore.playerTime : this.playerStore.slideTime;
                const time = Number(interactivity.time.toString());

                if (Date.now() - timeFrom >= time) {
                    canContinue = true;
                }
                break;
            }
            case "VARIABLE": {
                const variable = this.playerStore.variables[interactivity.ifVariable];

                const type = interactivity.ifVariableOperator;

                if (type === "EQUALS") {
                    if (variable === interactivity.ifVariableValue) {
                        canContinue = true;
                    }
                } else if (type === "NOT_EQUALS") {
                    if (variable !== interactivity.ifVariableValue) {
                        canContinue = true;
                    }
                }
                break;
            }
        }

        return canContinue;
    }

    /**
     * Processes the actions associated with a specific interactivity.
     * @param interactivity The interactivity to process.
     */
    private processInteractivity(interactivity: BlockInteractivity) {
        for (let action of interactivity.actions) {
            switch (action.action) {
                case "CHANGE_PROPERTY": {
                    let blocks = [] as PlayerBlock[];

                    switch (action.on) {
                        case "ALL":
                            blocks = this.player.getBlocks();
                            break;
                        case "SELF":
                            blocks = [this];
                            break;
                        case "SELECTED":
                            blocks = this.player.getBlocks().filter(b => action.blocks?.includes(b.id));
                            break;
                    }

                    for (const block of blocks) {
                        const property = block.getInteractivityProperties().find(p => p.label === action.property);

                        if (!property) continue;

                        property.change(action.value, action.relative, {
                            animate: action.animate,
                            duration: Number(action.duration),
                            easing: action.easing
                        });
                    }
                    break;
                }
                case "RESET_PROPERTY": {
                    let blocks = [] as PlayerBlock[];

                    switch (action.on) {
                        case "ALL":
                            blocks = this.player.getBlocks();
                            break;
                        case "SELF":
                            blocks = [this];
                            break;
                        case "SELECTED":
                            blocks = this.player.getBlocks().filter(b => action.blocks?.includes(b.id));
                            break;
                    }


                    for (const block of blocks) {
                        if (action.property === "ALL") {
                            for (const property of block.getInteractivityProperties()) {
                                property.change(property.getBaseValue(), false, {
                                    animate: action.animate,
                                    duration: Number(action.duration),
                                    easing: action.easing
                                });
                            }
                            continue;
                        }

                        const property = block.getInteractivityProperties().find(p => p.label === action.property);

                        if (!property) continue;

                        property.change(property.getBaseValue(), false, {
                            animate: action.animate,
                            duration: Number(action.duration),
                            easing: action.easing
                        });
                    }
                    break;
                }
                case "CHANGE_SLIDE": {
                    let slide: string | undefined = undefined;

                    const current = this.playerStore.getActiveSlide();
                    switch (action.slideType) {
                        case "NEXT":
                            const next = this.playerStore.getSlides().find((s: any) => s.position > current!.position);

                            if (!next) break;

                            slide = next.id;
                            break;
                        case "PREVIOUS":
                            const prev = this.playerStore.getSlides().reverse().find((s: any) => s.position < current!.position);

                            if (!prev) return;

                            slide = prev.id;
                            break;
                        case "FIRST":
                            slide = this.playerStore.getSlides()[0].id;
                            break;
                        case "LAST":
                            slide = this.playerStore.getSlides()[this.playerStore.getSlides().length - 1].id;
                            break;
                        case "SLIDE":
                            const slideIndex = Number(action.slideIndex);

                            if (isNaN(slideIndex)) break;

                            slide = this.playerStore.getSlides().sort((a: any, b: any) => a.position - b.position)[slideIndex].id;
                            break;
                        case "RANDOM":
                            slide = this.playerStore.getSlides()[Math.floor(Math.random() * this.playerStore.getSlides().length)].id;
                            break;
                    }

                    if (!slide) break;

                    this.playerStore.changeSlide(slide);
                    break;
                }
                case "CHANGE_VARIABLE": {
                    const variableBefore = this.playerStore.variables[action.changeVariable];

                    if (!!variableBefore) {
                        console.log("[Player] Changing variable", action.changeVariable, "from", variableBefore, "to", action.changeVariableValue);
                    }

                    this.playerStore.variables[action.changeVariable] = action.changeVariableValue;
                    break;
                }
                case "OPEN_LINK": {
                    const link = action.link;

                    if (!link) break;

                    window.open(link, "_blank");
                    break;
                }
            }
        }
    }
}
