import {IMaterial} from "../../database/model/MaterialModel";
import {MaterialDTO} from "../../../lib/dto/response/material/MaterialDTO";
import {Inject, Service} from "typedi";
import MaterialRepository from "../../database/repository/MaterialRepository";
import CreateController from "../base/CreateController";
import {CreateMaterialSuccessDTO} from "../../../lib/dto/response/material/CreateMaterialSuccessDTO";
import {CreateMaterialDTO} from "../../../lib/dto/request/material/CreateMaterialDTO";
import Joi from "joi";
import UpdateController from "../base/UpdateController";
import {UpdateMaterialDTO} from "../../../lib/dto/request/material/UpdateMaterialDTO";

@Service()
export class UpdateMaterialController extends UpdateController<IMaterial, UpdateMaterialDTO> {
    constructor(
        @Inject(() => MaterialRepository) materialRepository: MaterialRepository
    ) {
        super(
            materialRepository,
            Joi.object({
                name: Joi.string().max(255).optional(),
                slides: Joi.array().items(Joi.object({
                    id: Joi.string().required().min(36).max(36),
                    data: Joi.string().required(),
                    thumbnail: Joi.string().optional(),
                    position: Joi.number().required()
                })).optional()//.min(1),
            }), 'material');
    }
}