import { Prisma } from "@prisma/client"

export type ListSessionsCustomFilters = 'today'
export class ListSetDto {
    readonly filters: Prisma.ExerciseOnTrainingSessionsTempFindManyArgs['where']
    readonly customFilters?: ListSessionsCustomFilters

    constructor({filters, customFilters}: {filters: string, customFilters?: ListSessionsCustomFilters}) {
        this.filters = JSON.parse(filters ?? "{}");
        this.customFilters = customFilters
    }
}

export class ListSessionDto {
    readonly filters: Prisma.TrainingSessionGroupTempFindManyArgs['where']
    readonly customFilters?: ListSessionsCustomFilters

    constructor({filters, customFilters}: {filters: string, customFilters?: ListSessionsCustomFilters}) {
        this.filters = JSON.parse(filters ?? "{}");
        this.customFilters = customFilters
    }
}