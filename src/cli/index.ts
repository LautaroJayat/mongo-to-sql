#!/usr/bin/env node
import yargs from 'yargs/yargs';
import figlet from 'figlet'
import fs from 'node:fs'
import { composeSQLQuery } from '../SQLGenerator';

const help = `Usage: $0 [mongo command]


Examples
    - $0 db.users.find({}) 
    - $0 --cool db.users.fund({ name: 'john' })
    - $0 --cool db.users.find({},{name: 1, id: 1}) 
`

const argv = yargs(process.argv.slice(2)).options('cool', { type: 'boolean', description: 'make a cool output' })
    .usage(help)
    .parseSync();

let input = argv._.join("");

if (argv.cool) {
    console.log("")
    console.log(figlet.textSync("Mongo To SQL!", "ANSI Shadow"))
    console.log("")
}

if (!input && !process.stdin.isTTY) {
    input = fs.readFileSync(0, 'utf8').toString().replace(/\n/g, "").replace(/\s+/gi, "")
    fs.close(0)
}

try {
    if (input) {
        console.log("IN:  ", input.substring(0, input.lastIndexOf(")") + 1))
        const parsedQuery = composeSQLQuery(`${input}`);
        console.log("OUT: ", parsedQuery);
        process.exit(0);
    } else {
        console.log(`Usage: ${argv.$0} [mongo command]`)
        console.log(`\nrun ${argv.$0} --help for more information`)
        process.exit(1);
    }
} catch (error) {
    console.error("There is an error in the provided command");
    console.error(error);
    process.exit(1);
}
