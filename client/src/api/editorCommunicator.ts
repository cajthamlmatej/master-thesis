import Event from "@/utils/Event";
import Material, {Slide} from "@/models/Material";
import {generateUUID} from "@/utils/Generators";
import {EditorBlock} from "@/editor/block/EditorBlock";
import {communicator} from "@/api/websockets";
import {EditorAttendee} from "@/api/editorAttendee";

export class EditorCommunicator {
    public readonly EVENTS = {
        ATTENDEE_CHANGES: new Event<void>(),
        ATTENDEE_SLIDES_CHANGED: new Event<void>(),
        ATTENDEE_SELECTED_BLOCKS_CHANGED: new Event<void>(),

        BLOCK_CHANGED: new Event<void>(),
        // SYNCHRONIZE_BLOCK: new Event<string>(),
        // REMOVE_BLOCK: new Event<string>(),
    }
    private material: Material;
    private attendees: EditorAttendee[] = [];

    constructor(material: Material) {
        this.material = material;
        communicator.socket.emit("joinEditorMaterialRoom", material.id);

        this.EVENTS.ATTENDEE_CHANGES.emit();

        communicator.socket.on("newAttendee", (attendee: EditorAttendee) => {
            if (this.attendees.find((a) => a.id === attendee.id)) {
                return;
            }

            this.attendees.push(new EditorAttendee(attendee.id, attendee.name, attendee.color, attendee.slideId, attendee.selectedBlocks));
            this.EVENTS.ATTENDEE_CHANGES.emit();
        });
        communicator.socket.on("removeAttendee", ({id}: { id: string }) => {
            this.attendees = this.attendees.filter((a) => a.id !== id);
            this.EVENTS.ATTENDEE_CHANGES.emit();
        });
        communicator.socket.on("changeSlide", ({id, slideId}: { id: string, slideId: string }) => {
            const attendee = this.getAttendee(id);
            if (!attendee) return;
            attendee.slideId = slideId;
            attendee.selectedBlocks = [];
            this.EVENTS.ATTENDEE_SLIDES_CHANGED.emit();
        });
        communicator.socket.on("changeSelectedBlocks", ({id, selectedBlocks}) => {
            const attendeeObj = this.getAttendee(id);
            if (!attendeeObj) return;
            attendeeObj.selectedBlocks = selectedBlocks;
            this.EVENTS.ATTENDEE_SELECTED_BLOCKS_CHANGED.emit();
        });
        communicator.socket.on("synchronizeBlock", async ({slideId, author, block}) => {
            if (author === communicator.socket.id) return;
            if (this.getCurrent().slideId !== slideId) {
                const slide = this.material.slides.find((s) => s.id === slideId);

                if (!slide) {
                    return;
                }

                const newBlock = JSON.parse(block);
                const oldBlock = slide.data.blocks.find((s) => s.id === newBlock.id);

                if (oldBlock) {
                    slide.data.blocks = slide.data.blocks.map((b) => b.id === newBlock.id ? newBlock : b);
                } else {
                    slide.data.blocks.push(newBlock);
                }
                return;
            }

            const editor = (await import("@/stores/editor")).useEditorStore().getEditor();

            if (!editor) return;

            const parsed = JSON.parse(block);
            const oldBlock = editor.getBlockById(parsed.id);

            if (oldBlock) {
                for (let key in parsed) {
                    (oldBlock as any)[key] = parsed[key as any];
                }

                oldBlock.processDataChange(parsed);
            } else {
                const obj = editor.blockRegistry.deserializeEditor(parsed);

                if (!obj) return;

                editor.addBlock(obj);
            }

            this.EVENTS.BLOCK_CHANGED.emit();
        });
        communicator.socket.on("removeBlock", async ({slideId, author, blockId}) => {
            if (author === communicator.socket.id) {
                console.log("Author mismatch", author, communicator.socket.id);
                return;
            }

            if (this.getCurrent().slideId !== slideId) {
                const slide = this.material.slides.find((s) => s.id === slideId);

                if (!slide) {
                    return;
                }

                slide.data.blocks = slide.data.blocks.filter((b) => b !== blockId);
                return;
            }

            const editor = (await import("@/stores/editor")).useEditorStore().getEditor();

            if (!editor) {
                console.error("Editor is not loaded");
                return;
            }

            const block = editor.getBlockById(blockId);

            if (block) {
                editor.removeBlock(block);
            }
            this.EVENTS.BLOCK_CHANGED.emit();
        });
        communicator.socket.on("synchronizeMaterial", async ({
                                                                 plugins,
                                                                 name,
                                                                 method,
                                                                 automaticTime,
                                                                 sizing,
                                                                 visibility
                                                             }: {
            plugins: { plugin: string; release: string }[];
            name: string;
            method: "AUTOMATIC" | "MANUAL" | "INTERACTIVITY";
            automaticTime: number;
            sizing: "FIT_TO_SCREEN" | "MOVEMENT";
            visibility: "PUBLIC" | "PRIVATE"
        }) => {
            this.material.name = name;
            this.material.method = method;
            this.material.automaticTime = automaticTime;
            this.material.sizing = sizing;
            this.material.visibility = visibility;

            const pluginStore = (await import("@/stores/plugin")).usePluginStore();
            const pluginManager = pluginStore.manager;

            for (let pluginData of plugins) {
                const pluginContext = pluginManager.getPlugin(pluginData.plugin);

                if (!pluginContext) {
                    const plugin = await pluginStore.loadOne(pluginData.plugin);

                    if (!plugin) {
                        console.error("Failed to load plugin", pluginData.plugin);
                        continue;
                    }

                    await pluginStore.addPluginToMaterial(plugin);
                }

                // The plugin is already loaded
            }

            for (let plugin of pluginManager.getPlugins()) {
                if (plugins.find((p) => p.plugin === plugin.getId())) {
                    continue;
                }

                await pluginStore.removePluginFromMaterial(plugin);
            }
        });

        communicator.socket.on("synchronizeSlide", async ({position, slideId, size, color}: {
            slideId: string;
            size: { width: number; height: number };
            color: string;
            position: number;
        }) => {
            const editorStore = (await import("@/stores/editor")).useEditorStore();

            let slide = editorStore.getSlideById(slideId);

            if (!slide) {
                slide = new Slide(
                    generateUUID(),
                    {
                        editor: {
                            size,
                            color
                        },
                        blocks: []
                    },
                    undefined,
                    position
                );

                this.material.slides.push(slide);
            }

            slide.data.editor.size = size;
            slide.data.editor.color = color;
            slide.position = position;

            if (editorStore.getActiveSlide()?.id === slideId) {
                const editor = editorStore.getEditor();

                if (!editor) {
                    return;
                }

                (editor as any).size = size;
                (editor as any).color = color;

                editor.update();
            }

            editorStore.synchronizeMaterialSlides();
        });

        communicator.socket.on("removeSlide", async ({slideId}: { slideId: string }) => {
            const editorStore = (await import("@/stores/editor")).useEditorStore();

            this.material.slides = this.material.slides.filter((s) => s.id !== slideId);

            if (editorStore.getActiveSlide()?.id === slideId) {
                const slide = editorStore.getSlideById(this.material.slides[0].id);

                if (slide) {
                    editorStore.changeSlide(slide);
                }
            }

            editorStore.synchronizeMaterialSlides();
        });
    }

    public destroy() {
        communicator.socket.emit("leaveEditorMaterialRoom", this.material.id);
    }

    public getAttendee(id: string) {
        return this.attendees.find((a) => a.id === id);
    }

    public getAttendees() {
        return this.attendees;
    }

    public getAttendeesOnCurrentSlide() {
        const c = this.getCurrent();
        return this.attendees.filter((a) => a.slideId === c.slideId);
    }

    public getCurrent() {
        return this.attendees.find((a) => a.id === communicator.socket.id)!;
    }

    public changeSlide(slideId: string) {
        communicator.socket.emit("changeSlide", {slideId});
    }

    public changeSelectedBlocks(selectedBlocks: string[]) {
        communicator.socket.emit("changeSelectedBlocks", {selectedBlocks});
    }

    public synchronizeBlock(block: EditorBlock) {
        const editor = (block).getEditor();

        if (!editor) {
            console.error("Block is not attached to an editor");
            return;
        }

        if (!editor.getSelector().isSelected(block.id)) {
            console.error("Block is not selected and trying to synchronize");
            return;
        }

        communicator.socket.emit("synchronizeBlock", {block: JSON.stringify(block.serialize())});
    }

    public removeBlock(block: EditorBlock) {
        communicator.socket.emit("removeBlock", {blockId: block.id});
    }

    public synchronizeMaterial(data: {
        plugins: { plugin: string; release: string }[];
        name: string;
        method: "AUTOMATIC" | "MANUAL" | "INTERACTIVITY";
        automaticTime: number;
        sizing: "FIT_TO_SCREEN" | "MOVEMENT";
        visibility: "PUBLIC" | "PRIVATE"
    }) {
        communicator.socket.emit("synchronizeMaterial", data);
    }

    public synchronizeSlide(data: {
        slideId: string;
        size: { width: number; height: number };
        color: string;
        position: number;
    }) {
        communicator.socket.emit("synchronizeSlide", data);
    }

    public removeSlide(data: {
        slideId: string;
    }) {
        communicator.socket.emit("removeSlide", data);
    }

    public canSelectBlock(blockId: string) {
        const attendee = this.getAttendeesOnCurrentSlide().filter((a) => a !== this.getCurrent());

        if (attendee.length === 0) {
            return true;
        }

        return !attendee.some((a) => a.selectedBlocks.includes(blockId));
    }
}
