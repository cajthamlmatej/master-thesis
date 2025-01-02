import type DataExportDTO from "../../../lib/dto/response/dataExport/DataExportDTO";
import DataExport from "@/models/DataExport";
import moment from "moment";

export default class DataExportMapper {

    public static fromDataExportDTO(dto: DataExportDTO): DataExport {
        return new DataExport(
            dto.id,
            dto.user,
            moment(dto.createdAt),
            dto.status,
            moment(dto.finishedAt),
            dto.file
        );
    }

}