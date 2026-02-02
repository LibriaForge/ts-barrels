#!/usr/bin/env node
import { Command } from 'commander';
import path from 'path';
import {generateBarrels} from "./core";

const program = new Command();

program
    .name('ts-barrels')
    .description('Generate TypeScript barrel files recursively')
    .argument('<root>', 'Root folder to generate barrels in')
    .option('--all', 'Generate barrels recursively from leaves to root', false)
    .option('--force', 'Force override existing barrels (ignores skip)', false)
    .option('--name <filename>', 'Barrel filename', 'index.ts')
    .action(async (root: string, options: { all: boolean; force: boolean; name: string; }) => {
        const rootPath = path.resolve(root);
        await generateBarrels(rootPath, {
            all: !!options.all,
            force: !!options.force,
            filename: options.name
        });
    });

program.parse();
