import fs from 'fs-extra';
import path from 'path';

const PROJECT_ROOT = path.resolve(import.meta.dirname, '../..');
const TMP_DIR = path.join(PROJECT_ROOT, '.tmp');

export async function useTempProject(fixture: string, name?: string) {
    await fs.ensureDir(TMP_DIR);
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    const tmp = await fs.mkdtemp(path.join(TMP_DIR, `ts-barrels-${timestamp}-${name ? name + '-' : ''}`));
    await fs.copy(path.join(PROJECT_ROOT, 'tests/fixtures', fixture), tmp);

    const originalCwd = process.cwd();
    process.chdir(tmp);

    return {
        tmp,
        cleanup: async () => {
            process.chdir(originalCwd);
            if (await fs.pathExists(tmp)) {
                // await fs.remove(tmp);
            }
        }
    }
}