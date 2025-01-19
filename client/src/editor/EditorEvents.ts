import Event from "@/utils/Event";
import type {EditorBlock} from "@/editor/block/EditorBlock";
import type {EditorMode} from "@/editor/EditorMode";

export default class EditorEvents {

    public EDITOR_DESTROYED = new Event<void>();

    public BLOCK_CONTENT_CHANGED = new Event<EditorBlock>();
    public BLOCK_GROUP_CHANGED = new Event<EditorBlock[]>();
    public BLOCK_LOCK_CHANGED = new Event<{
        blocks: EditorBlock[],
        locked: boolean
    }>();
    public MODE_CHANGED = new Event<EditorMode>();
    public BLOCK_POSITION_CHANGED: Event<{ block: EditorBlock, manual: boolean }> = new Event<{ block: EditorBlock, manual: boolean }>();
    public BLOCK_ROTATION_CHANGED: Event<{ block: EditorBlock, manual: boolean }> = new Event<{ block: EditorBlock, manual: boolean }>();
    public BLOCK_SIZE_CHANGED: Event<{ block: EditorBlock, manual: boolean }> = new Event<{ block: EditorBlock, manual: boolean }>();
    public PREFERENCES_CHANGED: Event<void> = new Event<void>();

};
