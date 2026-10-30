import path from 'node:path';
import { buildPot, collectMessages, projectRoot, writeCatalog } from './shared.mjs';

const outputPath = path.join(projectRoot, 'languages', 'folioblocks.pot');
const pot = buildPot(collectMessages());

writeCatalog(outputPath, pot);
console.log(`Generated ${path.relative(projectRoot, outputPath)}`);
