import {MaterialDTO} from "./MaterialDTO";

export interface OneMaterialSuccessDTO {
    material: Omit<MaterialDTO, "attendees"> & {
        attendees: {
            id: string;
            name: string;
        }[];
    }
}