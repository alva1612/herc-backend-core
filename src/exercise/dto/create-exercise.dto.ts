import { CreateMuscleExerciseDto } from "src/muscle/dto/create-muscle.dto"

export class CreateExerciseDto {
    name: string
    description?: string
    trainingPlanId?: string | number

    muscleSectionExercises: CreateMuscleExerciseDto[]
}
