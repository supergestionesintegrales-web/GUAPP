export const GAS_CODE_GS = `// ============================================================
//  SISTEMA INSTITUCIONAL — Google Apps Script Backend
//  ID: 1KsBhRoDO1JkTpYH-Ff32ortwUgJP4DGFUzZOxZlQNA4
// ============================================================

function _generateRandomID() {
  var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  var id = '';
  for (var i = 0; i < 5; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

var SPREADSHEET_ID = '1KsBhRoDO1JkTpYH-Ff32ortwUgJP4DGFUzZOxZlQNA4';

var SHEETS = {
  MODULOS       : 'Modulos',
  SUBMODULOS    : 'Submodulos',
  SUBSUBMODULOS : 'SubSubModulos',
  NOTICIAS      : 'Noticias'
};

var HEADERS = {
  MODULOS       : ['ID', 'Nombre', 'Orden', 'UltimaModificacion'],
  SUBMODULOS    : ['ID', 'ModuloID', 'Nombre', 'Descripcion', 'URL', 'Color', 'Icono', 'Orden', 'UltimaModificacion'],
  SUBSUBMODULOS : ['ID', 'SubmoduloID', 'Nombre', 'URL', 'Orden', 'UltimaModificacion'],
  NOTICIAS      : ['ID', 'Tipo', 'Titulo', 'Descripcion', 'Fecha', 'ImagenURL', 'CreadoPor', 'FechaCreacion', 'UltimaModificacion']
};

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('GUAPP - Tu Guajira App')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function validateAndSyncSheets() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  _ensureSheet(ss, SHEETS.MODULOS,       HEADERS.MODULOS);
  _ensureSheet(ss, SHEETS.SUBMODULOS,    HEADERS.SUBMODULOS);
  _ensureSheet(ss, SHEETS.SUBSUBMODULOS, HEADERS.SUBSUBMODULOS);
  _ensureSheet(ss, SHEETS.NOTICIAS,      HEADERS.NOTICIAS);
  return true;
}

function _ensureSheet(ss, name, headers) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    _formatHeader(sheet, headers.length);
  }
  return sheet;
}

function _formatHeader(sheet, numCols) {
  sheet.getRange(1, 1, 1, numCols)
    .setFontWeight('bold')
    .setBackground('#1e293b')
    .setFontColor('#ffffff')
    .setHorizontalAlignment('center');
  sheet.setFrozenRows(1);
}

function validateAdminPIN(pin) {
  return pin === '9001';
}

function getDashboardModules() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheetMod = ss.getSheetByName(SHEETS.MODULOS);
    var sheetSub = ss.getSheetByName(SHEETS.SUBMODULOS);
    var sheetSubSub = ss.getSheetByName(SHEETS.SUBSUBMODULOS);

    if (!sheetMod || !sheetSub) {
      validateAndSyncSheets();
      return [];
    }

    var dataMod = sheetMod.getDataRange().getValues();
    var dataSub = sheetSub.getDataRange().getValues();
    var dataSubSub = sheetSubSub && sheetSubSub.getLastRow() > 1 ? sheetSubSub.getDataRange().getValues() : [];

    if (dataMod.length <= 1) return [];

    var modulos = dataMod.slice(1).map(function(r) {
      return { id: String(r[0]).trim(), nombre: String(r[1]).trim(), orden: r[2] ? Number(r[2]) : 999 };
    }).filter(function(m) { return m.id && m.nombre; });

    var submodulos = dataSub.length > 1 ? dataSub.slice(1).map(function(r) {
      return {
        id: String(r[0]).trim(), moduloId: String(r[1]).trim(),
        nombre: String(r[2]).trim(), desc: String(r[3] || ''),
        url: String(r[4] || ''), color: String(r[5] || 'blue'),
        icono: String(r[6] || 'package'), orden: r[7] ? Number(r[7]) : 999
      };
    }).filter(function(s) { return s.id && s.nombre; }) : [];

    var subsubmodulos = dataSubSub.length > 1 ? dataSubSub.slice(1).map(function(r) {
      return {
        id: String(r[0]).trim(), submoduloId: String(r[1]).trim(),
        nombre: String(r[2]).trim(), url: String(r[3] || ''),
        orden: r[4] ? Number(r[4]) : 999
      };
    }).filter(function(s) { return s.id && s.nombre; }) : [];

    modulos.sort(function(a, b) { return a.orden - b.orden; });

    return modulos.map(function(mod) {
      var subs = submodulos.filter(function(s) { return s.moduloId === mod.id; });
      subs.sort(function(a, b) { return a.orden - b.orden; });

      return {
        id: mod.id,
        nombre: mod.nombre,
        submodulos: subs.map(function(sub) {
          var links = subsubmodulos.filter(function(ss) { return ss.submoduloId === sub.id; });
          links.sort(function(a, b) { return a.orden - b.orden; });
          return {
            id: sub.id, nombre: sub.nombre, desc: sub.desc,
            url: sub.url, color: sub.color, icono: sub.icono,
            sublinks: links.map(function(l) { return { id: l.id, nombre: l.nombre, url: l.url }; })
          };
        })
      };
    });
  } catch(e) {
    Logger.log('Error getDashboardModules: ' + e.message);
    return [];
  }
}

function saveDashboardModules(modules) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var now = new Date().toISOString();
    var rowsMod = [], rowsSub = [], rowsSubSub = [];

    modules.forEach(function(mod, modIndex) {
      if (!mod.id || !mod.nombre) return;
      rowsMod.push([mod.id, mod.nombre, mod.orden || (modIndex + 1), now]);

      (mod.submodulos || []).forEach(function(sub, subIndex) {
        if (!sub.id || !sub.nombre) return;
        rowsSub.push([sub.id, mod.id, sub.nombre, sub.desc || '', sub.url || '', sub.color || '#3b82f6', sub.icono || 'package', sub.orden || (subIndex + 1), now]);

        (sub.sublinks || []).forEach(function(sl, slIndex) {
          if (!sl.nombre) return;
          var slId = sl.id || _generateRandomID();
          rowsSubSub.push([slId, sub.id, sl.nombre, sl.url || '', sl.orden || (slIndex + 1), now]);
        });
      });
    });

    var sheetMod = _ensureSheet(ss, SHEETS.MODULOS, HEADERS.MODULOS);
    var sheetSub = _ensureSheet(ss, SHEETS.SUBMODULOS, HEADERS.SUBMODULOS);
    var sheetSubSub = _ensureSheet(ss, SHEETS.SUBSUBMODULOS, HEADERS.SUBSUBMODULOS);

    sheetMod.clearContents(); sheetMod.appendRow(HEADERS.MODULOS);
    if (rowsMod.length) sheetMod.getRange(2, 1, rowsMod.length, HEADERS.MODULOS.length).setValues(rowsMod);

    sheetSub.clearContents(); sheetSub.appendRow(HEADERS.SUBMODULOS);
    if (rowsSub.length) sheetSub.getRange(2, 1, rowsSub.length, HEADERS.SUBMODULOS.length).setValues(rowsSub);

    sheetSubSub.clearContents(); sheetSubSub.appendRow(HEADERS.SUBSUBMODULOS);
    if (rowsSubSub.length) sheetSubSub.getRange(2, 1, rowsSubSub.length, HEADERS.SUBSUBMODULOS.length).setValues(rowsSubSub);

    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

function getNews() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheetNoticias = ss.getSheetByName(SHEETS.NOTICIAS);
    if (!sheetNoticias) return [];
    var data = sheetNoticias.getDataRange().getValues();
    if (data.length <= 1) return [];

    return data.slice(1).map(function(r) {
      return {
        id: String(r[0]).trim(),
        tipo: String(r[1] || ''),
        titulo: String(r[2] || ''),
        descripcion: String(r[3] || ''),
        fecha: String(r[4] || ''),
        imagenURL: String(r[5] || ''),
        creadoPor: String(r[6] || ''),
        fechaCreacion: String(r[7] || '')
      };
    }).filter(function(n) { return n.id && n.titulo; });
  } catch(e) {
    return [];
  }
}

function saveNews(noticias, usuarioActual) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(30000);
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheetNoticias = _ensureSheet(ss, SHEETS.NOTICIAS, HEADERS.NOTICIAS);
    var now = new Date().toISOString();
    var rows = [];

    noticias.forEach(function(n) {
      if (!n.id || !n.titulo) return;
      rows.push([n.id, n.tipo || '', n.titulo || '', n.descripcion || '', n.fecha || '', n.imagenURL || '', usuarioActual || 'Sistema', n.fechaCreacion || now, now]);
    });

    sheetNoticias.clearContents();
    sheetNoticias.appendRow(HEADERS.NOTICIAS);
    if (rows.length) sheetNoticias.getRange(2, 1, rows.length, HEADERS.NOTICIAS.length).setValues(rows);

    return { success: true };
  } catch(e) {
    return { success: false, error: e.message };
  } finally {
    lock.releaseLock();
  }
}

function uploadNewsImage(payload) {
  if (!payload || !payload.base64) throw new Error('No hay datos de imagen');
  var folderId = '12pG22nXAdg1GtyGFvTufn80HHSeMkwJ0';
  var folder = DriveApp.getFolderById(folderId);
  var match = String(payload.base64).match(/^data:(image\\/[a-zA-Z0-9.+-]+);base64,(.*)$/i);
  if (!match) throw new Error('Formato no válido');
  var bytes = Utilities.base64Decode(match[2]);
  var blob = Utilities.newBlob(bytes, match[1], payload.filename || 'news_image.png');
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { fileId: file.getId(), fileUrl: 'https://drive.google.com/uc?export=view&id=' + file.getId() };
}
`;
