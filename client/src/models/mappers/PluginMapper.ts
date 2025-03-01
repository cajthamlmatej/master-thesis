import {PluginDTO} from "../../../lib/dto/plugin/PluginDTO";
import Plugin from "@/models/Plugin";
import moment from "moment";

export default class PluginMapper {

    public static fromPluginDTO(dto: PluginDTO | Omit<PluginDTO, "releases">): Plugin {
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
            }))
        )
    }

}
