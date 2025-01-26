interface BlockInteractivityEvents {
    event: 'CLICKED' | 'HOVERING' | 'DRAG_START' | 'DRAG_END';
}

interface BlockInteractivityConditionsBase {
    condition: 'ALWAYS';
}

interface BlockInteractivityConditionsTimePassed {
    condition: 'TIME_PASSED';
    time: number;
}

type BlockInteractivityConditions = BlockInteractivityConditionsBase | BlockInteractivityConditionsTimePassed;

interface BlockInteractivityActionChangeProperty {
    action: 'CHANGE_PROPERTY';
    property: string;
    value: string;
    on: 'SELF' | 'ALL' | 'SELECTED';
    blocks?: string[];
}

interface BlockInteractivityActionResetProperty {
    action: 'RESET_PROPERTY';
    property: string | 'ALL';
    on: 'SELF' | 'ALL' | 'SELECTED';
    blocks?: string[];
}

interface BlockInteractivityActionChangeSlideRelative {
    action: 'CHANGE_SLIDE';
    slideType: 'NEXT' | 'PREVIOUS' | 'FIRST' | 'LAST';
}

interface BlockInteractivityActionChangeSlideAbsolute {
    action: 'CHANGE_SLIDE';
    slideType: 'ABSOLUTE';
    slideIndex: number;
}

type BlockInteractivityAction =
    BlockInteractivityActionChangeProperty
    | BlockInteractivityActionResetProperty
    | BlockInteractivityActionChangeSlideRelative
    | BlockInteractivityActionChangeSlideAbsolute;

export type BlockInteractivity = BlockInteractivityEvents & BlockInteractivityConditions & BlockInteractivityAction;
