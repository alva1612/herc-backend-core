import { Exercise } from "@prisma/client"

export class CoreExercise implements Exercise {
    id: number
    uuid: string

    name: string
    description: string

}