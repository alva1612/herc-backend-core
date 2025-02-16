import { readFileSync } from "fs";
import { join } from "path/win32";
const parse = require('csv-parse/lib/sync')

const name = 'v1Tov2'; 

export async function getFile() {
    const fileRead = await readFileSync(join(__dirname, '..','..','migrations', 'csv',`${name}.csv`));
    const data = await parse(fileRead, {columns: true})
    console.log(data)
    return data
}