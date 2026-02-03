// tests/all.test.ts
import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {useTempProject} from "./helpers/use-temp-project";
import {generateBarrels} from "../src";

describe('all', () => {
    let cleanup: () => Promise<void>;
    let tmpDir: string;

    beforeEach(async () => {
        // useTempProject already handles cwd change and cleanup
        const temp = await useTempProject('basic-project', 'config');
        cleanup = temp.cleanup;
        tmpDir = temp.tmp;
    });

    afterEach(async () => {
        await cleanup();
    });

    describe('Leaves to root', () => {
        it('should aggregate child barrels into parent', async () => {
            const srcPath = path.join(tmpDir, 'src');
            await generateBarrels(srcPath, {all: true, force: false, filename: 'index.ts'});

            const rootBarrel = path.join(srcPath, 'index.ts');
            const featuresBarrel = path.join(srcPath, 'features', 'index.ts');

            expect(await fs.pathExists(featuresBarrel)).toBe(true);
            expect(await fs.pathExists(rootBarrel)).toBe(true);

            const rootContent = await fs.readFile(rootBarrel, 'utf-8');
            expect(rootContent).toContain("export * from './features'");
        });

        describe('Ignore with .lbbign', () => {
            it('should ignore folders with .lbbign and their children', async () => {
                const srcPath = path.join(tmpDir, 'src');
                const ignorePath = path.join(srcPath, 'features', 'ignore');
                const ignoreChildPath = path.join(ignorePath, 'child');

                // Create .lbbign marker file
                await fs.writeFile(path.join(ignorePath, '.lbbign'), '');

                await generateBarrels(srcPath, {all: true, force: false, filename: 'index.ts'});

                // No barrel should be created in ignored folder or its children
                expect(await fs.pathExists(path.join(ignorePath, 'index.ts'))).toBe(false);
                expect(await fs.pathExists(path.join(ignoreChildPath, 'index.ts'))).toBe(false);

                // Features barrel should not export from ignore
                const featuresBarrel = path.join(srcPath, 'features', 'index.ts');
                const featuresContent = await fs.readFile(featuresBarrel, 'utf-8');
                expect(featuresContent).not.toContain('ignore');
            });
        });
    });
});