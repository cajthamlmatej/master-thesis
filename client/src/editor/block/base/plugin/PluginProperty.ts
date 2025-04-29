interface TextPluginProperty {
    type: 'text';
    label: string;
}

interface BooleanPluginProperty {
    type: 'boolean';
    label: string;
}

interface ColorPluginProperty {
    type: 'color';
    label: string;
}

interface NumberPluginProperty {
    type: 'number';
    label: string;
}

export interface SelectPluginProperty {
    type: 'select';
    label: string;
    options: { value: string; label: string }[];
}

export interface PluginPropertyBase {
    type: string;
    key: string;
}

export type PluginProperty = PluginPropertyBase & (
    | TextPluginProperty
    | BooleanPluginProperty
    | ColorPluginProperty
    | NumberPluginProperty
    | SelectPluginProperty
    );
