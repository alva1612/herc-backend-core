export class CreateMuscleDto {
    name: string
    description?: string

    muscleExercises: CreateMuscleExerciseDto[]
}

export class CreateMuscleExerciseDto {
    muscleSectionId?: number | string
    exerciseId?: number | string

    effort: number
    description?: string
}
