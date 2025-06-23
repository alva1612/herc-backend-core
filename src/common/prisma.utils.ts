function getEitherUniqueField<T extends { uuid?: string, id: number, [x: string]: string | number }>(entity: T): { uuid: string } | { id: number } {
    if (entity.uuid) {
        return {
            uuid: entity.uuid
        }
    }
    if (entity.id) return {
        id: entity.id
    }
}

function getEitherUniqueFieldFromValue(identifer: string | number) {
    if (typeof identifer === 'string') {
        return {
            uuid: identifer
        }
    }
    return {
        id: identifer
    }
}

export const PrismaUtils = {
    getEitherUniqueField,
    getEitherUniqueFieldFromValue
};