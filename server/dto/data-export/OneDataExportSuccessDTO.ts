export default interface OneDataExportSuccessDTO {
    dataExport: {
        id: string;
        expiresAt: Date;
        completedAt: Date | undefined;
        requestedAt: Date | undefined;
    }
}