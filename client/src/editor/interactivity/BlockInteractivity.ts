interface BlockInteractivityEventsBase {
    event: 'CLICKED' | 'HOVER_START' | 'HOVER_END' | 'SLIDE_LOAD';
}

interface BlockInteractivityEventsTimerBase {
    event: 'TIMER';
    timerTime: number;
}

interface BlockInteractivityEventsTimerTimeout {
    timerType: 'TIMEOUT';
}

interface BlockInteractivityEventsTimerRepeat {
    timerType: 'REPEAT';
}

interface BlockInteractivityEventsTimerNowRepeat {
    timerType: 'NOW-REPEAT';
}


type BlockInteractivityEventsTimer =
    BlockInteractivityEventsTimerBase
    & (BlockInteractivityEventsTimerTimeout | BlockInteractivityEventsTimerRepeat | BlockInteractivityEventsTimerNowRepeat);

type BlockInteractivityEvents = BlockInteractivityEventsBase | BlockInteractivityEventsTimer;

interface BlockInteractivityConditionsBase {
    condition: 'ALWAYS';
}

interface BlockInteractivityConditionsTimePassed {
    condition: 'TIME_PASSED';
    timeFrom: 'OPEN' | 'SLIDE';
    time: number;
}

interface BlockInteractivityConditionsVariable {
    condition: 'VARIABLE';
    ifVariable: string;
    ifVariableValue: string;
    ifVariableOperator: 'EQUALS' | 'NOT_EQUALS';
}

type BlockInteractivityConditions =
    BlockInteractivityConditionsBase
    | BlockInteractivityConditionsTimePassed
    | BlockInteractivityConditionsVariable;

// note(Matej): When changing this, dont forget that some blocks implement these easings in their code (for example Shape)
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
}

type Easing = keyof typeof BlockInteractivityEasings;

interface BlockInteractivityActionChangeProperty {
    action: 'CHANGE_PROPERTY';
    property: string;
    value: string;
    relative: boolean;
    on: 'SELF' | 'ALL' | 'SELECTED';
    blocks?: string[];
    animate: boolean;
    duration: number;
    easing: Easing;
}

interface BlockInteractivityActionResetProperty {
    action: 'RESET_PROPERTY';
    property: string | 'ALL';
    on: 'SELF' | 'ALL' | 'SELECTED';
    blocks?: string[];
    animate: boolean;
    duration: number;
    easing: Easing;
}

interface BlockInteractivityActionChangeSlideRelative {
    action: 'CHANGE_SLIDE';
    slideType: 'NEXT' | 'PREVIOUS' | 'FIRST' | 'LAST' | 'RANDOM';
}

interface BlockInteractivityActionChangeSlideAbsolute {
    action: 'CHANGE_SLIDE';
    slideType: 'SLIDE';
    slideIndex: number;
}

interface BlockInteractivityActionChangeVariable {
    action: 'CHANGE_VARIABLE';
    changeVariable: string;
    changeVariableValue: string;
}

interface BlockInteractivityActionBase {
    id: string;
}

export type BlockInteractivityAction =
    BlockInteractivityActionBase & (
        BlockInteractivityActionChangeProperty
        | BlockInteractivityActionResetProperty
        | BlockInteractivityActionChangeSlideRelative
        | BlockInteractivityActionChangeSlideAbsolute
        | BlockInteractivityActionChangeVariable);

type BlockInteractivityActions = {
    actions: BlockInteractivityAction[];
}

interface BlockInteractivityBase {
    id: string;
}

export type BlockInteractivity =
    BlockInteractivityBase
    & BlockInteractivityEvents
    & BlockInteractivityConditions
    & BlockInteractivityActions;

export interface BlockInteractiveProperty {
    label: string,
    getBaseValue: () => any,
    change: (value: any, relative: boolean, {animate, duration, easing}: {
        animate: boolean,
        duration: number,
        easing: string
    }) => void;
}
