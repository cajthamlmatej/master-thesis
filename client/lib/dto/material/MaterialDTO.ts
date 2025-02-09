export interface MaterialDTO {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    visibility: string;
    method: string;
    automaticTime: number;
    sizing: string;
    user: string;
    slides: {
        id: string;
        data: string;
        thumbnail: string | undefined;
        position: number;
    }[];
}