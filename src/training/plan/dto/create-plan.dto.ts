export class CreatePlanDto {
    id: number
    uuid: string
    name: string
    description?: string
    exerciseIds?: string[] | number[]
}
