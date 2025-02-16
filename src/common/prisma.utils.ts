function getEitherUniqueField<T extends { uuid?: string, id: number, [x: string]: string | number }>(entity: T): { uuid: string } | { id: number } {
    console.log({entity})
    if (entity.uuid) {
        return {
            uuid: entity.uuid
        }
    }
    return {
        id: entity.id
    }
}

export const PrismaUtils = {
    getEitherUniqueField
};