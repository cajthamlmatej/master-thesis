import AllController from "../base/AllController";
import {IMaterial} from "../../database/model/MaterialModel";
import {AllMaterialSuccessDTO} from "../../../lib/dto/response/material/AllMaterialSuccessDTO";
import {MaterialDTO} from "../../../lib/dto/response/material/MaterialDTO";
import {Inject, Service} from "typedi";
import MaterialRepository from "../../database/repository/MaterialRepository";
import {Promise} from "mongoose-mock";
import OneController from "../base/OneController";
import {OneMaterialSuccessDTO} from "../../../lib/dto/response/material/OneMaterialSuccessDTO";

@Service()
export class OneMaterialController extends OneController<IMaterial, OneMaterialSuccessDTO, MaterialDTO> {
    constructor(
        @Inject(() => MaterialRepository) materialRepository: MaterialRepository
    ) {
        super({
            getOneById(id: string): Promise<IMaterial | null> {
                return materialRepository.getById(id)
            }
        }, "material");
    }
}