// tests/no-all.test.ts
import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {useTempProject} from "./helpers/use-temp-project";
import {generateBarrels} from "../src";

describe('no-all', () => {
    let cleanup: () => Promise<void>;
    let tmpDir: string;

    beforeEach(async () => {
        const temp = await useTempProject('basic-project', 'no-all');
        cleanup = temp.cleanup;
        tmpDir = temp.tmp;
    });

    afterEach(async () => {
        await cleanup();
    });

    it('should generate barrel in features folder and export it from src without --all', async () => {
        const srcPath = path.join(tmpDir, 'src');
        const featuresPath = path.join(srcPath, 'features');

        // First, generate barrel in features folder (without --all)
        await generateBarrels(featuresPath, {all: false, force: true, filename: 'index.ts'});

        const featuresBarrel = path.join(featuresPath, 'index.ts');
        expect(await fs.pathExists(featuresBarrel)).toBe(true);

        // Features barrel should export local files only
        const featuresContent = await fs.readFile(featuresBarrel, 'utf-8');
        expect(featuresContent).toContain("export * from './a'");
        expect(featuresContent).toContain("export * from './b'");
        // skip folder should NOT be in features barrel (since no --all and skip has no barrel)
        expect(featuresContent).not.toContain('skip');

        // Then, generate barrel in src folder (without --all)
        await generateBarrels(srcPath, {all: false, force: true, filename: 'index.ts'});

        const rootBarrel = path.join(srcPath, 'index.ts');
        expect(await fs.pathExists(rootBarrel)).toBe(true);

        // Src barrel should export root.ts and the features/ barrel
        const rootContent = await fs.readFile(rootBarrel, 'utf-8');
        expect(rootContent).toContain("export * from './root'");
        expect(rootContent).toContain("export * from './features'");
    });

    it('should NOT generate barrels in subdirectories without --all', async () => {
        const srcPath = path.join(tmpDir, 'src');

        // Generate barrel in src without --all
        await generateBarrels(srcPath, {all: false, force: true, filename: 'index.ts'});

        // Only src barrel should be created
        const rootBarrel = path.join(srcPath, 'index.ts');
        expect(await fs.pathExists(rootBarrel)).toBe(true);

        // Features barrel should NOT be created
        const featuresBarrel = path.join(srcPath, 'features', 'index.ts');
        expect(await fs.pathExists(featuresBarrel)).toBe(false);

        // Src barrel should only export root.ts (no features export since features has no barrel)
        const rootContent = await fs.readFile(rootBarrel, 'utf-8');
        expect(rootContent).toContain("export * from './root'");
        expect(rootContent).not.toContain('features');
    });
});