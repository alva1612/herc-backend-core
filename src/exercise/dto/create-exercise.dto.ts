export class CreateExerciseDto {
    id: number
    uuid: string
    name: string
    description: string
    trainingPlanId?: string | number
}
