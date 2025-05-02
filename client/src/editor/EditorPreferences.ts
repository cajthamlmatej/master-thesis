/**
 * Class representing the preferences and settings for the editor.
 */
export default class EditorPreferences {

    /**
     * Whether the editor should automatically fit to its parent container.
     */
    public KEEP_EDITOR_TO_FIT_PARENT = true;

    /**
     * Whether transformations should be applied per object.
     */
    public PER_OBJECT_TRANSFORMATION = true;

    /**
     * Number of snapping points for rotation.
     */
    public ROTATION_SNAPPING_COUNT = 24;

    // /**
    //  * Whether automatic saving is enabled.
    //  */
    // public AUTOMATIC_SAVING = true;

    // /**
    //  * Interval for automatic saving in milliseconds.
    //  */
    // public AUTOMATIC_SAVING_INTERVAL = 60000;

    /**
     * Maximum number of history actions stored.
     */
    public HISTORY_LIMIT = 100;

    /**
     * Distance for snapping during movement.
     */
    public MOVEMENT_SNAPPING_DISTANCE = 10;
}
