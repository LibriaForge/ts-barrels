#!/usr/bin/env node
import path from 'path';

import { Command } from 'commander';

import {generateBarrels, generateIgnoreFile} from './core';

const program = new Command();

program
    .name('ts-barrels')
    .description('Generate TypeScript barrel files recursively')
    .argument('[root]', 'Root folder to generate barrels in', '.')
    .option('--all', 'Generate barrels recursively from leaves to root', false)
    .option('--force', 'Force override existing barrels', false)
    .option('--name <filename>', 'Barrel filename', 'index.ts')
    .action(async (root: string, options: { all: boolean; force: boolean; name: string }) => {
        const rootPath = path.resolve(root);
        await generateBarrels(rootPath, {
            all: !!options.all,
            force: !!options.force,
            filename: options.name,
        });
    });

program.command('ignore')
    .description('Generate a .lbbign that prevents the generation of barrel files')
    .argument('[root]', 'Root folder to generate barrels in', '.')
    .action(async (root: string) => {
        const rootPath = path.resolve(root);
        await generateIgnoreFile(rootPath);
    })
program.parse();
