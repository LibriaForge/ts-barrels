// tests/all.test.ts
import { describe, it, expect } from 'vitest';
import fs from 'fs-extra';
import path from 'path';
import {useTempProject} from "./helpers/use-temp-project";
import {generateBarrels} from "../src";

describe('Leaves to root', () => {
    it('should aggregate child barrels into parent', async () => {
        const tmp = await useTempProject('basic-project', '1');

        const srcPath = path.join(tmp, 'src');
        await generateBarrels(srcPath, { all: true, force: false, filename: 'index.ts' });

        const rootBarrel = path.join(srcPath, 'index.ts');
        const featuresBarrel = path.join(srcPath, 'features', 'index.ts');

        expect(await fs.pathExists(featuresBarrel)).toBe(true);
        expect(await fs.pathExists(rootBarrel)).toBe(true);

        const rootContent = await fs.readFile(rootBarrel, 'utf-8');
        expect(rootContent).toContain("export * from './features'");
    });
});
