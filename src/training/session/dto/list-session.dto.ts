import { Prisma } from "@prisma/client"

export type ListSessionsCustomFilters = 'today'
export class ListSetDto {
    readonly filters: Prisma.ExerciseOnTrainingSessionsFindManyArgs['where']
    readonly customFilters?: ListSessionsCustomFilters

    constructor({filters, customFilters}: {filters: string, customFilters?: ListSessionsCustomFilters}) {
        this.filters = JSON.parse(filters ?? "{}");
        this.customFilters = customFilters
    }
}

export class ListSessionDto {
    readonly filters: Prisma.TrainingSessionGroupFindManyArgs['where']
    readonly customFilters?: ListSessionsCustomFilters

    constructor({filters, customFilters}: {filters: string, customFilters?: ListSessionsCustomFilters}) {
        this.filters = JSON.parse(filters ?? "{}");
        this.customFilters = customFilters
    }
}