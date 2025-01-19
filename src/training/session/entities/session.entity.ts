import { Exercise } from "src/exercise/entities/exercise.entity"

export class Session {}

export class ExercixeOnTrainingSessionTemp {
    id: number
    uuid: string

    repetitions: number
    weight: number

    exerciseId: number
    exercise: Exercise
}