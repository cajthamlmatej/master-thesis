import Event from "@/utils/Event";
import type {EditorBlock} from "@/editor/block/EditorBlock";
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

};
