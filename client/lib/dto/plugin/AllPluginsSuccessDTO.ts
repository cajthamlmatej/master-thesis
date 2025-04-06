import {PluginDTO} from "./PluginDTO";

export interface AllPluginsSuccessDTO {
    plugins: (Omit<PluginDTO, "releases"> & {
        lastReleaseDate: string;
        lastManifest: string
    })[] | PluginDTO[];
}