/**
 * Base interface for block interactivity events.
 */
interface BlockInteractivityEventsBase {
    /**
     * The type of event.
     */
    event: 'CLICKED' | 'HOVER_START' | 'HOVER_END' | 'SLIDE_LOAD';
}

/**
 * Base interface for timer-related block interactivity events.
 */
interface BlockInteractivityEventsTimerBase {
    /**
     * The type of event.
     */
    event: 'TIMER';
    /**
     * The time associated with the timer event.
     */
    timerTime: number;
}

/**
 * Interface for timer events with a timeout type.
 */
interface BlockInteractivityEventsTimerTimeout {
    /**
     * The type of timer.
     */
    timerType: 'TIMEOUT';
}

/**
 * Interface for timer events with a repeat type.
 */
interface BlockInteractivityEventsTimerRepeat {
    /**
     * The type of timer.
     */
    timerType: 'REPEAT';
}

/**
 * Interface for timer events with a now-repeat type.
 */
interface BlockInteractivityEventsTimerNowRepeat {
    /**
     * The type of timer.
     */
    timerType: 'NOW-REPEAT';
}

/**
 * Union type for all timer-related block interactivity events.
 */
type BlockInteractivityEventsTimer =
    BlockInteractivityEventsTimerBase
    & (BlockInteractivityEventsTimerTimeout | BlockInteractivityEventsTimerRepeat | BlockInteractivityEventsTimerNowRepeat);

/**
 * Union type for all block interactivity events.
 */
type BlockInteractivityEvents = BlockInteractivityEventsBase | BlockInteractivityEventsTimer;

/**
 * Base interface for block interactivity conditions.
 */
interface BlockInteractivityConditionsBase {
    /**
     * The type of condition.
     */
    condition: 'ALWAYS';
}

/**
 * Interface for time-passed conditions.
 */
interface BlockInteractivityConditionsTimePassed {
    /**
     * The type of condition.
     */
    condition: 'TIME_PASSED';
    /**
     * The reference point for the time condition.
     */
    timeFrom: 'OPEN' | 'SLIDE';
    /**
     * The time value for the condition.
     */
    time: number;
}

/**
 * Interface for variable-based conditions.
 */
interface BlockInteractivityConditionsVariable {
    /**
     * The type of condition.
     */
    condition: 'VARIABLE';
    /**
     * The variable to check.
     */
    ifVariable: string;
    /**
     * The value of the variable to compare.
     */
    ifVariableValue: string;
    /**
     * The operator to use for the comparison.
     */
    ifVariableOperator: 'EQUALS' | 'NOT_EQUALS';
}

/**
 * Union type for all block interactivity conditions.
 */
type BlockInteractivityConditions =
    BlockInteractivityConditionsBase
    | BlockInteractivityConditionsTimePassed
    | BlockInteractivityConditionsVariable;

/**
 * Easing functions available for animations.
 */
export const BlockInteractivityEasings = {
    LINEAR: 'linear',
    EASE: 'ease',
    EASE_IN: 'ease-in',
    EASE_OUT: 'ease-out',
    EASE_IN_OUT: 'ease-in-out',
    STEPS_4: 'steps(4, jump-end)',
    STEPS_6: 'steps(6, jump-end)',
    STEPS_8: 'steps(8, jump-end)',
    STEPS_10: 'steps(10, jump-end)'
};

/**
 * Type representing the keys of the easing functions.
 */
type Easing = keyof typeof BlockInteractivityEasings;

/**
 * Interface for actions that change a property of a block.
 */
interface BlockInteractivityActionChangeProperty {
    /**
     * The type of action.
     */
    action: 'CHANGE_PROPERTY';
    /**
     * The property to change.
     */
    property: string;
    /**
     * The new value for the property.
     */
    value: string;
    /**
     * Whether the change is relative to the current value.
     */
    relative: boolean;
    /**
     * The target of the action.
     */
    on: 'SELF' | 'ALL' | 'SELECTED';
    /**
     * Specific blocks to target (optional).
     */
    blocks?: string[];
    /**
     * Whether the change should be animated.
     */
    animate: boolean;
    /**
     * The duration of the animation in milliseconds.
     */
    duration: number;
    /**
     * The easing function to use for the animation.
     */
    easing: Easing;
}

/**
 * Interface for actions that reset a property of a block.
 */
interface BlockInteractivityActionResetProperty {
    /**
     * The type of action.
     */
    action: 'RESET_PROPERTY';
    /**
     * The property to reset.
     */
    property: string | 'ALL';
    /**
     * The target of the action.
     */
    on: 'SELF' | 'ALL' | 'SELECTED';
    /**
     * Specific blocks to target (optional).
     */
    blocks?: string[];
    /**
     * Whether the reset should be animated.
     */
    animate: boolean;
    /**
     * The duration of the animation in milliseconds.
     */
    duration: number;
    /**
     * The easing function to use for the animation.
     */
    easing: Easing;
}

/**
 * Interface for actions that change the slide relatively.
 */
interface BlockInteractivityActionChangeSlideRelative {
    /**
     * The type of action.
     */
    action: 'CHANGE_SLIDE';
    /**
     * The type of slide change.
     */
    slideType: 'NEXT' | 'PREVIOUS' | 'FIRST' | 'LAST' | 'RANDOM';
}

/**
 * Interface for actions that change the slide absolutely.
 */
interface BlockInteractivityActionChangeSlideAbsolute {
    /**
     * The type of action.
     */
    action: 'CHANGE_SLIDE';
    /**
     * The type of slide change.
     */
    slideType: 'SLIDE';
    /**
     * The index of the slide to change to.
     */
    slideIndex: number;
}

/**
 * Interface for actions that change a variable.
 */
interface BlockInteractivityActionChangeVariable {
    /**
     * The type of action.
     */
    action: 'CHANGE_VARIABLE';
    /**
     * The variable to change.
     */
    changeVariable: string;
    /**
     * The new value for the variable.
     */
    changeVariableValue: string;
}

/**
 * Interface for actions that open a link.
 */
interface BlockInteractivityActionOpenLink {
    /**
     * The type of action.
     */
    action: 'OPEN_LINK';
    /**
     * The URL of the link to open.
     */
    link: string;
}

/**
 * Base interface for all block interactivity actions.
 */
interface BlockInteractivityActionBase {
    /**
     * The unique identifier of the action.
     */
    id: string;
}

/**
 * Union type for all block interactivity actions.
 */
export type BlockInteractivityAction =
    BlockInteractivityActionBase & (
    BlockInteractivityActionChangeProperty
    | BlockInteractivityActionResetProperty
    | BlockInteractivityActionChangeSlideRelative
    | BlockInteractivityActionChangeSlideAbsolute
    | BlockInteractivityActionChangeVariable
    | BlockInteractivityActionOpenLink);

/**
 * Interface representing a collection of actions.
 */
type BlockInteractivityActions = {
    /**
     * The list of actions.
     */
    actions: BlockInteractivityAction[];
};

/**
 * Base interface for block interactivity.
 */
interface BlockInteractivityBase {
    /**
     * The unique identifier of the block interactivity.
     */
    id: string;
}

/**
 * Union type for all block interactivity configurations.
 */
export type BlockInteractivity =
    BlockInteractivityBase
    & BlockInteractivityEvents
    & BlockInteractivityConditions
    & BlockInteractivityActions;

/**
 * Represents a property of a block that can be interacted with.
 */
export interface BlockInteractiveProperty {
    /**
     * The label of the property.
     */
    label: string;

    /**
     * Retrieves the base value of the property.
     * @returns The base value of the property.
     */
    getBaseValue: () => any;

    /**
     * Changes the value of the property.
     * @param value - The new value to set.
     * @param relative - Whether the change is relative to the current value.
     * @param options - Animation options for the change.
     * @param options.animate - Whether the change should be animated.
     * @param options.duration - The duration of the animation in milliseconds.
     * @param options.easing - The easing function to use for the animation.
     */
    change: (value: any, relative: boolean, {animate, duration, easing}: {
        animate: boolean,
        duration: number,
        easing: string
    }) => void;
}
