import { Prisma } from "@prisma/client"

export type ListSessionsCustomFilters = 'today'
export class ListSessionDto {
    readonly filters: Prisma.ExerciseOnTrainingSessionsTempFindManyArgs['where']
    readonly customFilters?: ListSessionsCustomFilters

    constructor({filters, customFilters}: {filters: string, customFilters?: ListSessionsCustomFilters}) {
        this.filters = JSON.parse(filters ?? "{}");
        this.customFilters = customFilters
    }
}