import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";
import { Modulo, Noticia } from "../types";
import { deleteNewsImage } from "./newsImages";

export const SISTEMA_FILE_NAME = "sistema.xlsx";

export const SHEETS = {
  MODULOS: "Modulos",
  SUBMODULOS: "Submodulos",
  SUBSUBMODULOS: "SubSubModulos",
  NOTICIAS: "Noticias",
  CONFIGURACION: "Configuracion",
} as const;

const HEADERS = {
  MODULOS: ["ID", "Nombre", "Orden", "UltimaModificacion"],
  SUBMODULOS: ["ID", "ModuloID", "Nombre", "Descripcion", "URL", "Color", "Icono", "Orden", "UltimaModificacion"],
  SUBSUBMODULOS: ["ID", "SubmoduloID", "Nombre", "URL", "Orden", "UltimaModificacion"],
  NOTICIAS: ["ID", "Tipo", "Titulo", "Descripcion", "Fecha", "ImagenURL", "CreadoPor", "FechaCreacion", "UltimaModificacion"],
  CONFIGURACION: ["Clave", "Valor", "Descripcion"],
} as const;

export interface SistemaConfig {
  adminPin: string;
  publisherPin: string;
  nombreApp: string;
  subtituloApp: string;
  lemaApp: string;
}

const DEFAULT_CONFIG: SistemaConfig = {
  adminPin: "SIG900.1",
  publisherPin: "9001",
  nombreApp: "GUAPP",
  subtituloApp: "Tu Guajira App",
  lemaApp: "Simpre cerca de ti",
};

function resolveSistemaPath(customPath?: string): string {
  return customPath || path.join(process.cwd(), "data", SISTEMA_FILE_NAME);
}

function ensureWorkbook(filePath: string): XLSX.WorkBook {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(filePath)) {
    return XLSX.readFile(filePath);
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([Array.from(HEADERS.MODULOS)]), SHEETS.MODULOS);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([Array.from(HEADERS.SUBMODULOS)]), SHEETS.SUBMODULOS);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([Array.from(HEADERS.SUBSUBMODULOS)]), SHEETS.SUBSUBMODULOS);
  XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet([Array.from(HEADERS.NOTICIAS)]), SHEETS.NOTICIAS);
  XLSX.utils.book_append_sheet(
    workbook,
    XLSX.utils.aoa_to_sheet([
      Array.from(HEADERS.CONFIGURACION),
      ["admin_pin", DEFAULT_CONFIG.adminPin, "PIN de acceso administrador"],
      ["publisher_pin", DEFAULT_CONFIG.publisherPin, "PIN de publicación de noticias y comunicados"],
      ["nombre_app", DEFAULT_CONFIG.nombreApp, "Nombre principal de la aplicación"],
      ["subtitulo_app", DEFAULT_CONFIG.subtituloApp, "Subtítulo del portal"],
      ["lema_app", DEFAULT_CONFIG.lemaApp, "Lema institucional"],
    ]),
    SHEETS.CONFIGURACION
  );

  XLSX.writeFile(workbook, filePath);
  return workbook;
}

function writeWorkbook(filePath: string, workbook: XLSX.WorkBook): void {
  XLSX.writeFile(workbook, filePath);
}

function sheetToRows<T extends unknown[]>(workbook: XLSX.WorkBook, sheetName: string): T[] {
  const sheet = workbook.Sheets[sheetName];
  if (!sheet) return [];
  const rows = XLSX.utils.sheet_to_json<T>(sheet, { header: 1, defval: "" }) as T[];
  return rows.length > 1 ? rows.slice(1) : [];
}

function setSheetData(workbook: XLSX.WorkBook, sheetName: string, headers: readonly string[], rows: unknown[][]): void {
  const data: unknown[][] = [Array.from(headers), ...rows];
  workbook.Sheets[sheetName] = XLSX.utils.aoa_to_sheet(data);
  if (!workbook.SheetNames.includes(sheetName)) {
    XLSX.utils.book_append_sheet(workbook, workbook.Sheets[sheetName], sheetName);
  }
}

export function getSistemaConfig(filePath?: string): SistemaConfig {
  const resolvedPath = resolveSistemaPath(filePath);
  const workbook = ensureWorkbook(resolvedPath);
  const rows = sheetToRows<[string, string]>(workbook, SHEETS.CONFIGURACION);
  const map = new Map(rows.map(([key, value]) => [String(key).trim(), String(value).trim()]));

  return {
    adminPin: map.get("admin_pin") || DEFAULT_CONFIG.adminPin,
    publisherPin: map.get("publisher_pin") || DEFAULT_CONFIG.publisherPin,
    nombreApp: map.get("nombre_app") || DEFAULT_CONFIG.nombreApp,
    subtituloApp: map.get("subtitulo_app") || DEFAULT_CONFIG.subtituloApp,
    lemaApp: map.get("lema_app") || DEFAULT_CONFIG.lemaApp,
  };
}

export function ensureConfigPins(filePath?: string): SistemaConfig {
  const resolvedPath = resolveSistemaPath(filePath);
  const workbook = ensureWorkbook(resolvedPath);
  const rows = sheetToRows<[string, string, string?]>(workbook, SHEETS.CONFIGURACION);
  const configMap = new Map(rows.map(([key, value, desc]) => [String(key).trim(), { value: String(value).trim(), desc }]));

  let changed = false;

  const upsert = (key: string, value: string, desc: string) => {
    const current = configMap.get(key);
    if (!current || current.value !== value) {
      configMap.set(key, { value, desc });
      changed = true;
    }
  };

  upsert("admin_pin", DEFAULT_CONFIG.adminPin, "PIN de acceso administrador");
  upsert("publisher_pin", DEFAULT_CONFIG.publisherPin, "PIN de publicación de noticias y comunicados");

  if (changed) {
    const configRows = Array.from(configMap.entries()).map(([key, { value, desc }]) => [key, value, desc || ""]);
    setSheetData(workbook, SHEETS.CONFIGURACION, HEADERS.CONFIGURACION, configRows);
    writeWorkbook(resolvedPath, workbook);
  }

  return getSistemaConfig(resolvedPath);
}

export function validateAdminPin(pin: string, filePath?: string): boolean {
  const config = getSistemaConfig(filePath);
  return pin === config.adminPin;
}

export function validatePublisherPin(pin: string, filePath?: string): boolean {
  const config = getSistemaConfig(filePath);
  return pin === config.publisherPin;
}

export type AccessRole = "ADMIN" | "PUBLISHER";

export function resolveAccessRole(pin: string, filePath?: string): AccessRole | null {
  if (validateAdminPin(pin, filePath)) return "ADMIN";
  if (validatePublisherPin(pin, filePath)) return "PUBLISHER";
  return null;
}

export function validatePublishPin(pin: string, filePath?: string): boolean {
  return resolveAccessRole(pin, filePath) !== null;
}

export function getDashboardModulesFromExcel(filePath?: string): Modulo[] {
  const resolvedPath = resolveSistemaPath(filePath);
  const workbook = ensureWorkbook(resolvedPath);

  const modRows = sheetToRows<[string, string, number | string]>(workbook, SHEETS.MODULOS);
  if (modRows.length === 0) return [];

  const subRows = sheetToRows<[string, string, string, string, string, string, string, number | string]>(
    workbook,
    SHEETS.SUBMODULOS
  );
  const subSubRows = sheetToRows<[string, string, string, string, number | string]>(workbook, SHEETS.SUBSUBMODULOS);

  const modulos = modRows
    .map((row) => ({
      id: String(row[0]).trim(),
      nombre: String(row[1]).trim(),
      orden: row[2] ? Number(row[2]) : 999,
    }))
    .filter((mod) => mod.id && mod.nombre);

  const submodulos = subRows
    .map((row) => ({
      id: String(row[0]).trim(),
      moduloId: String(row[1]).trim(),
      nombre: String(row[2]).trim(),
      desc: String(row[3] || ""),
      url: String(row[4] || ""),
      color: String(row[5] || "#3b82f6"),
      icono: String(row[6] || "package"),
      orden: row[7] ? Number(row[7]) : 999,
    }))
    .filter((sub) => sub.id && sub.nombre);

  const subsubmodulos = subSubRows
    .map((row) => ({
      id: String(row[0]).trim(),
      submoduloId: String(row[1]).trim(),
      nombre: String(row[2]).trim(),
      url: String(row[3] || ""),
      orden: row[4] ? Number(row[4]) : 999,
    }))
    .filter((item) => item.id && item.nombre);

  modulos.sort((a, b) => a.orden - b.orden);

  return modulos.map((mod) => {
    const subs = submodulos.filter((sub) => sub.moduloId === mod.id);
    subs.sort((a, b) => a.orden - b.orden);

    return {
      id: mod.id,
      nombre: mod.nombre,
      orden: mod.orden,
      submodulos: subs.map((sub) => {
        const links = subsubmodulos.filter((link) => link.submoduloId === sub.id);
        links.sort((a, b) => a.orden - b.orden);
        return {
          id: sub.id,
          moduloId: sub.moduloId,
          nombre: sub.nombre,
          desc: sub.desc,
          url: sub.url,
          color: sub.color,
          icono: sub.icono,
          orden: sub.orden,
          sublinks: links.map((link) => ({
            id: link.id,
            nombre: link.nombre,
            url: link.url,
            orden: link.orden,
          })),
        };
      }),
    };
  });
}

export function saveDashboardModulesToExcel(modules: Modulo[], filePath?: string): { success: boolean; count: number } {
  const resolvedPath = resolveSistemaPath(filePath);
  const workbook = ensureWorkbook(resolvedPath);
  const now = new Date().toISOString();

  const rowsMod: unknown[][] = [];
  const rowsSub: unknown[][] = [];
  const rowsSubSub: unknown[][] = [];

  modules.forEach((mod, modIndex) => {
    if (!mod.id || !mod.nombre) return;
    rowsMod.push([mod.id, mod.nombre, mod.orden ?? modIndex + 1, now]);

    (mod.submodulos || []).forEach((sub, subIndex) => {
      if (!sub.id || !sub.nombre) return;
      rowsSub.push([
        sub.id,
        mod.id,
        sub.nombre,
        sub.desc || "",
        sub.url || "",
        sub.color || "#3b82f6",
        sub.icono || "package",
        sub.orden ?? subIndex + 1,
        now,
      ]);

      (sub.sublinks || []).forEach((sl, slIndex) => {
        if (!sl.nombre) return;
        rowsSubSub.push([
          sl.id || `sl_${Date.now()}_${slIndex}`,
          sub.id,
          sl.nombre,
          sl.url || "",
          sl.orden ?? slIndex + 1,
          now,
        ]);
      });
    });
  });

  setSheetData(workbook, SHEETS.MODULOS, HEADERS.MODULOS, rowsMod);
  setSheetData(workbook, SHEETS.SUBMODULOS, HEADERS.SUBMODULOS, rowsSub);
  setSheetData(workbook, SHEETS.SUBSUBMODULOS, HEADERS.SUBSUBMODULOS, rowsSubSub);
  writeWorkbook(resolvedPath, workbook);

  return { success: true, count: modules.length };
}

export function getNewsFromExcel(filePath?: string): Noticia[] {
  const resolvedPath = resolveSistemaPath(filePath);
  const workbook = ensureWorkbook(resolvedPath);
  const rows = sheetToRows<[string, string, string, string, string, string, string, string]>(workbook, SHEETS.NOTICIAS);

  return rows
    .map((row) => ({
      id: String(row[0]).trim(),
      tipo: String(row[1] || ""),
      titulo: String(row[2] || ""),
      descripcion: String(row[3] || ""),
      fecha: String(row[4] || ""),
      imagenURL: String(row[5] || ""),
      creadoPor: String(row[6] || ""),
      fechaCreacion: String(row[7] || ""),
    }))
    .filter((item) => item.id && item.titulo);
}

export function saveNewsToExcel(
  noticias: Noticia[],
  usuarioActual?: string,
  filePath?: string
): { success: boolean; count: number } {
  const resolvedPath = resolveSistemaPath(filePath);
  const oldNews = getNewsFromExcel(resolvedPath);
  const newById = new Map(noticias.map((n) => [n.id, n]));

  for (const old of oldNews) {
    const updated = newById.get(old.id);
    if (!updated) {
      deleteNewsImage(old.imagenURL);
      continue;
    }
    if (old.imagenURL && old.imagenURL !== updated.imagenURL) {
      deleteNewsImage(old.imagenURL);
    }
  }

  const workbook = ensureWorkbook(resolvedPath);
  const now = new Date().toISOString();

  const rows = noticias
    .filter((n) => n.id && n.titulo)
    .map((n) => [
      n.id,
      n.tipo || "",
      n.titulo || "",
      n.descripcion || "",
      n.fecha || "",
      n.imagenURL || "",
      n.creadoPor || usuarioActual || "Sistema",
      n.fechaCreacion || now,
      now,
    ]);

  setSheetData(workbook, SHEETS.NOTICIAS, HEADERS.NOTICIAS, rows);
  writeWorkbook(resolvedPath, workbook);

  return { success: true, count: rows.length };
}

export function seedSistemaExcelIfEmpty(
  defaultModules: Modulo[],
  defaultNews: Noticia[],
  filePath?: string
): void {
  const resolvedPath = resolveSistemaPath(filePath);
  ensureWorkbook(resolvedPath);

  const modules = getDashboardModulesFromExcel(resolvedPath);
  const news = getNewsFromExcel(resolvedPath);

  if (modules.length === 0) {
    saveDashboardModulesToExcel(defaultModules, resolvedPath);
  }
  if (news.length === 0) {
    saveNewsToExcel(defaultNews, "Sistema", resolvedPath);
  }
}

export function getSistemaFilePath(): string {
  return resolveSistemaPath();
}
