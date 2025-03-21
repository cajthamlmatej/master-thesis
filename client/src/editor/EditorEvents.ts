import Event from "@/utils/Event";
import {EditorBlock} from "@/editor/block/EditorBlock";
import type {EditorMode} from "@/editor/EditorMode";

export default class EditorEvents {

    public EDITOR_DESTROYED = new Event<void>();
    public MODE_CHANGED = new Event<EditorMode>();
    public PREFERENCES_CHANGED = new Event<void>();
    public HISTORY = new Event<void>();
    public HISTORY_JUMP = new Event<void>();

    public BLOCK_ADDED = new Event<EditorBlock>();
    public BLOCK_REMOVED = new Event<EditorBlock>();
    public BLOCK_CONTENT_CHANGED = new Event<EditorBlock>();
    public BLOCK_GROUP_CHANGED = new Event<EditorBlock[]>();
    public BLOCK_LOCK_CHANGED = new Event<{ blocks: EditorBlock[], locked: boolean }>();
    public BLOCK_POSITION_CHANGED = new Event<{ block: EditorBlock, manual: boolean }>();
    public BLOCK_ROTATION_CHANGED = new Event<{ block: EditorBlock, manual: boolean }>();
    public BLOCK_SIZE_CHANGED = new Event<{ block: EditorBlock, manual: boolean }>();
    public BLOCK_OPACITY_CHANGED = new Event<{ block: EditorBlock, manual: boolean }>();
    public BLOCK_CHANGED = new Event<EditorBlock>();

    constructor() {
        [
            this.BLOCK_CONTENT_CHANGED,
            this.BLOCK_GROUP_CHANGED,
            this.BLOCK_LOCK_CHANGED,
            this.BLOCK_POSITION_CHANGED,
            this.BLOCK_ROTATION_CHANGED,
            this.BLOCK_SIZE_CHANGED,
            this.BLOCK_OPACITY_CHANGED,
        ].forEach((event) => {
            event.on((data) => {
                if(Array.isArray(data) || (data as any).blocks) {
                    const blocks = (Array.isArray(data) ? data : (data as any).blocks) as EditorBlock[];
                    for(const b of blocks) {
                        this.tryToEmit(b);
                    }
                } else {
                    if(data instanceof EditorBlock) {
                        this.tryToEmit(data);
                    } else {
                        const b = (data as any).block as EditorBlock;
                        this.tryToEmit(b);
                    }
                }
            })
        })
    }

    private blockDebounce: { [key: string]: number } = {}
    private tryToEmit(block: EditorBlock) {
        if(this.blockDebounce[block.id]) {
            clearTimeout(this.blockDebounce[block.id]);
        }

        this.blockDebounce[block.id] = setTimeout(() => {
            this.BLOCK_CHANGED.emit(block);
            delete this.blockDebounce[block.id];
        }, 250) as any;
    }
};
