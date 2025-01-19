import AllController from "../base/AllController";
import {IMaterial} from "../../database/model/MaterialModel";
import {AllMaterialSuccessDTO} from "../../../lib/dto/response/material/AllMaterialSuccessDTO";
import {MaterialDTO} from "../../../lib/dto/response/material/MaterialDTO";
import {Inject, Service} from "typedi";
import MaterialRepository from "../../database/repository/MaterialRepository";
import {Promise} from "mongoose-mock";

@Service()
export class AllMaterialController extends AllController<IMaterial, AllMaterialSuccessDTO, MaterialDTO> {
    constructor(
        @Inject(() => MaterialRepository) materialRepository: MaterialRepository
    ) {
        super({
            getAll(req): Promise<IMaterial[]> {
                return materialRepository.getForUser(req.user!.id);
            }
        });
    }
}