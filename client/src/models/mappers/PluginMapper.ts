import {PluginDTO} from "../../../lib/dto/plugin/PluginDTO";
import Plugin from "@/models/Plugin";
import moment from "moment";
import {AllPluginsSuccessDTO} from "../../../lib/dto/plugin/AllPluginsSuccessDTO";

export default class PluginMapper {

    public static fromPluginDTO(dto: PluginDTO | AllPluginsSuccessDTO["plugins"][0]): Plugin {
        return new Plugin(
            dto.author,
            dto.id,
            dto.name,
            dto.icon,
            dto.description,
            dto.tags,
            ("releases" in dto ? dto.releases : []).map((r) => ({
                version: r.version,
                date: moment(r.date),
                changelog: r.changelog,
                manifest: r.manifest,
                editorCode: r.editorCode,
                playerCode: r.playerCode
            })),
            "lastManifest" in dto ? dto.lastManifest : undefined,
            "lastReleaseDate" in dto ? dto.lastReleaseDate : undefined
        )
    }

}
