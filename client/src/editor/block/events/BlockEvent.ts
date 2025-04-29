export enum BlockEvent {
    /**
     * Called when the block is mounted to the editor.
     * Parameters: none
     */
    MOUNTED,
    /**
     * Called when the block is unmounted from the editor.
     * Parameters: none
     */
    UNMOUNTED,
    /**
     * Called when the block is clicked while it is selected.
     * Parameters:
     * - `event: MouseEvent` - The click event from DOM.
     */
    CLICKED,
    /**
     * Called when the block starts being rotated.
     * Parameters: none
     */
    ROTATION_STARTED,
    /**
     * Called when the block is done being rotated.
     * Parameters:
     * - `start: number` - The starting rotation of the block.
     */
    ROTATION_ENDED,
    /**
     * Called when the block starts being moved.
     * Parameters: none
     */
    MOVEMENT_STARTED,
    /**
     * Called when the block is done being moved.
     * Parameters:
     * - `start: { x: number, y: number }` - The starting position of the block.
     */
    MOVEMENT_ENDED,
    /**
     * Called when the block starts being resized.
     * Parameters: none
     */
    RESIZING_STARTED,
    /**
     * Called when the block is done being resized.
     * Parameters:
     * - `type: 'PROPORTIONAL' | 'NON_PROPORTIONAL'` - The type of resizing.
     * - `start: { width: number, height: number }` - The starting width and height of the block.
     */
    RESIZING_ENDED,
    /**
     * Called when the block starts being hovered.
     * Parameters: none
     */
    HOVER_STARTED,
    /**
     * Called when the block is done being hovered.
     * Parameters: none
     */
    HOVER_ENDED,
    /**
     * Called when the block is selected.
     * Parameters: none
     */
    SELECTED,
    /**
     * Called when the block is deselected.
     * Parameters: none
     */
    DESELECTED,
    /**
     * Called when the block received a message from the presenter or attendee.
     * Parameters:
     * - `message: string` - The message received.
     * - `clientId: string | undefined` - The id of the client that sent the message. `undefined` if the message was sent by the presenter.
     */
    MESSAGE
}
