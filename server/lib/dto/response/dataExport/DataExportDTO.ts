export default interface DataExportDTO {
    id: string;
    user: string;
    createdAt: Date;
    finishedAt?: Date;
    status: 'PENDING' | 'FINISHED' | 'ARCHIVED';
    file?: string;
}