import { readFileSync } from "fs";
const parse = require('csv-parse/lib/sync')

export async function getFile(path: string) {
    const fileRead = await readFileSync(path);
    const data = await parse(fileRead, {columns: true})
    console.log(data)
    return data
}