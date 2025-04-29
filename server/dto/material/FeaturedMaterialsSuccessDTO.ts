export default interface FeaturedMaterialsSuccessDTO {
    materials: {
        id: string,
        user: string,
        thumbnail: string | undefined,
        name: string
    }[]
}