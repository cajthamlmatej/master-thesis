import {IMaterial} from "../../database/model/MaterialModel";
import {MaterialDTO} from "../../../lib/dto/response/material/MaterialDTO";
import {Inject, Service} from "typedi";
import MaterialRepository from "../../database/repository/MaterialRepository";
import CreateController from "../base/CreateController";
import {CreateMaterialSuccessDTO} from "../../../lib/dto/response/material/CreateMaterialSuccessDTO";
import {CreateMaterialDTO} from "../../../lib/dto/request/material/CreateMaterialDTO";
import Joi from "joi";

@Service()
export class CreateMaterialController extends CreateController<IMaterial, CreateMaterialSuccessDTO, MaterialDTO, CreateMaterialDTO> {
    constructor(
        @Inject(() => MaterialRepository) materialRepository: MaterialRepository
    ) {
        super(
            materialRepository,
            Joi.object({
                name: Joi.string().required().max(255),
                slides: Joi.array().items(Joi.object({
                    id: Joi.string().required().min(36).max(36),
                    data: Joi.string().required(),
                    thumbnail: Joi.string().optional(),
                    position: Joi.number().required()
                })).required()//.min(1),
            }),
            undefined,
            async (req, data) => {
                return {
                    ...data,
                    user: req.user!.id
                }
            });
    }
}