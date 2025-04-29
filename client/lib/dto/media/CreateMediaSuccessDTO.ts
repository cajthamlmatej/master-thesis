export interface CreateMediaSuccessDTO {
    media: {
        id: string;
        name: string;
        mimetype: string;
        size: number;
    }
}