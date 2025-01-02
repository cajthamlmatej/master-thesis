import BaseJoi from 'joi';
import {Types} from "mongoose";

/**
 * Extend Joi with custom validation rules for objectIds
 */
const Joi = BaseJoi.extend((joi) => {
    return {
        type: 'objectId',
        base: joi.string(),
        messages: {
            'objectId.base': '{{#label}} must be a valid ObjectId',
        },
        validate(value, helpers) {
            if (Types.ObjectId.isValid(value)) {
                return {value}
            }

            return {value, errors: helpers.error('objectId.base')}
        }
    }
});

export default Joi;