import fs from 'fs';
import path from 'path';
import {
  ensureConfigPins,
  getDashboardModulesFromExcel,
  getNewsFromExcel,
  getSistemaConfig,
  seedSistemaExcelIfEmpty,
} from '../src/services/sistemaExcel';
import { defaultModulesData, defaultNewsData } from '../src/data/defaultSistema';

const outDir = path.join(process.cwd(), 'public', 'data');
const functionsDataDir = path.join(process.cwd(), 'functions', '_data');

function writeJson(targetDir: string, fileName: string, data: unknown): void {
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, fileName), JSON.stringify(data, null, 2), 'utf-8');
}

seedSistemaExcelIfEmpty(defaultModulesData, defaultNewsData);
ensureConfigPins();

const modules = getDashboardModulesFromExcel();
const news = getNewsFromExcel();
const config = getSistemaConfig();
const sistemaInfo = {
  nombreApp: config.nombreApp,
  subtituloApp: config.subtituloApp,
  lemaApp: config.lemaApp,
};

for (const dir of [outDir, functionsDataDir]) {
  writeJson(dir, 'modules.json', modules);
  writeJson(dir, 'news.json', news);
  writeJson(dir, 'sistema-info.json', sistemaInfo);
}

console.log(`Datos exportados: ${modules.length} módulos, ${news.length} noticias → public/data/`);
