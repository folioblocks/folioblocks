import path from 'node:path';
import { buildPot, collectMessages, projectRoot, writeFile } from './shared.mjs';

const outputPath = path.join(projectRoot, 'languages', 'folioblocks.pot');
const pot = buildPot(collectMessages());

writeFile(outputPath, pot);
console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
