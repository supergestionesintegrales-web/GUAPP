import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { Modulo, Noticia } from "./src/types";
import { GAS_CODE_GS } from "./src/gasCode";
import {
  getDashboardModulesFromExcel,
  getNewsFromExcel,
  getSistemaConfig,
  getSistemaFilePath,
  saveDashboardModulesToExcel,
  saveNewsToExcel,
  seedSistemaExcelIfEmpty,
  validateAdminPin,
} from "./src/services/sistemaExcel";
import {
  ensureNewsImagesDir,
  NEWS_IMAGES_DIR,
  resolveNewsImageUrl,
  saveNewsImage,
  toStoredImageRef,
} from "./src/services/newsImages";

// In-memory persistent database store (with default baseline values)
const defaultModulesData: Modulo[] = [
  {
    id: "mod1",
    nombre: "Servicios Ciudadanos",
    orden: 1,
    submodulos: [
      {
        id: "s1",
        nombre: "Peticiones y Quejas",
        desc: "Radica tus PQRS de forma rápida y realiza seguimiento",
        url: "https://example.com/pqrs",
        color: "#3b82f6",
        icono: "file-text",
        orden: 1,
        sublinks: [
          { id: "l1", nombre: "Radicar nueva PQRS", url: "https://example.com/pqrs/radicar" },
          { id: "l2", nombre: "Consultar estado de solicitud", url: "https://example.com/pqrs/estado" }
        ]
      },
      {
        id: "s2",
        nombre: "Consulta de Impuestos",
        desc: "Verifica tu estado de cuenta predial e ICA",
        url: "https://example.com/impuestos",
        color: "#10b981",
        icono: "dollar-sign",
        orden: 2,
        sublinks: [
          { id: "l3", nombre: "Impuesto Predial Unificado", url: "https://example.com/impuestos/predial" },
          { id: "l4", nombre: "Industria y Comercio (ICA)", url: "https://example.com/impuestos/ica" }
        ]
      },
      {
        id: "s3",
        nombre: "Sistema SASRA - Solicitudes y Respuestas",
        desc: "Sistema de Atención, Solicitudes, Respuestas y Acompañamiento Institucional",
        url: "https://example.com/sasra",
        color: "#0284c7",
        icono: "shield-check",
        orden: 3,
        sublinks: [
          { id: "sasra_1", nombre: "Radicación de Solicitud SASRA", url: "https://example.com/sasra/radicar" },
          { id: "sasra_2", nombre: "Consulta de Estado de Solicitud SASRA", url: "https://example.com/sasra/estado" },
          { id: "sasra_3", nombre: "Guía del Usuario y Acompañamiento SASRA", url: "https://example.com/sasra/guia" }
        ]
      }
    ]
  },
  {
    id: "mod2",
    nombre: "Gestión Institucional",
    orden: 2,
    submodulos: [
      {
        id: "g1",
        nombre: "Recursos Humanos",
        desc: "Sistemas internos de personal, nómina y certificaciones",
        url: "",
        color: "#8b5cf6",
        icono: "users",
        orden: 1,
        sublinks: [
          { id: "g1-1", nombre: "Nómina Electrónica", url: "https://example.com/nomina" },
          { id: "g1-2", nombre: "Permisos y Ausentismos", url: "https://example.com/permisos" },
          { id: "g1-3", nombre: "Generar Certificado Laboral", url: "https://example.com/certs" }
        ]
      },
      {
        id: "g2",
        nombre: "Gestión Documental",
        desc: "Acceso al archivo digital y correspondencia oficial",
        url: "https://example.com/orfeo",
        color: "#ec4899",
        icono: "folder-archive",
        orden: 2,
        sublinks: []
      }
    ]
  },
  {
    id: "mod3",
    nombre: "Transparencia y Control",
    orden: 3,
    submodulos: [
      {
        id: "t1",
        nombre: "Rendición de Cuentas",
        desc: "Informes de gestión, presupuestos e indicadores",
        url: "https://example.com/transparencia",
        color: "#f59e0b",
        icono: "pie-chart",
        orden: 1,
        sublinks: []
      },
      {
        id: "t2",
        nombre: "Contratación Pública",
        desc: "Procesos en SECOP II y licitaciones abiertas",
        url: "https://example.com/secop",
        color: "#06b6d4",
        icono: "briefcase",
        orden: 2,
        sublinks: []
      }
    ]
  }
];

const defaultNewsData: Noticia[] = [
  {
    id: "news_sasra",
    tipo: "noticia",
    titulo: "Sistema SASRA: Guía Completa de Atención, Solicitudes y Acompañamiento",
    descripcion: "El Sistema SASRA (Sistema de Atención, Solicitudes, Respuestas y Acompañamiento) es la plataforma oficial diseñada para canalizar y resolver todos los trámites, requerimientos y consultas institucionales con máxima transparencia y velocidad.\n\n📌 ¿Qué puedes realizar en SASRA?\n• Radicación digital centralizada con número de radicado único e inalterable.\n• Seguimiento en tiempo real del estado de tu trámite y funcionario asignado.\n• Recepción de notificaciones automáticas por correo electrónico e integración con GUAPP.\n• Acompañamiento guiado paso a paso para trámites de ciudadanos y dependencias.\n• Tiempos de respuesta optimizados bajo estrictos Acuerdos de Nivel de Servicio (SLA).\n\n💡 ¿Cómo utilizarlo?\nPuedes radicar tus solicitudes directamente ingresando a la sección de Trámites en GUAPP o accediendo al submódulo SASRA dentro de Servicios Ciudadanos.",
    fecha: new Date().toISOString().split("T")[0],
    creadoPor: "Dirección de Calidad y SASRA",
    fechaCreacion: new Date().toISOString(),
    imagenURL: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "news_1",
    tipo: "noticia",
    titulo: "Bienvenida al Sistema GUAPP",
    descripcion: "Iniciamos la puesta en marcha del nuevo portal institucional integrado para agilizar trámites y servicios institucionales de manera segura y eficiente.",
    fecha: new Date().toISOString().split("T")[0],
    creadoPor: "Administración",
    fechaCreacion: new Date().toISOString(),
    imagenURL: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "news_2",
    tipo: "novedad",
    titulo: "Sincronización en Tiempo Real activada",
    descripcion: "Ahora todos los módulos, submódulos y enlaces se actualizan instantáneamente en la base de datos central sin requerir recargas de página.",
    fecha: new Date().toISOString().split("T")[0],
    creadoPor: "Sistemas",
    fechaCreacion: new Date().toISOString(),
    imagenURL: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=800&auto=format&fit=crop"
  },
  {
    id: "news_3",
    tipo: "evento",
    titulo: "Taller de Inducción y Capacitación SIG & SASRA",
    descripcion: "Próxima sesión técnica virtual este viernes a las 10:00 AM para la gestión de nuevos trámites y operación de la plataforma SASRA.",
    fecha: "2026-08-15",
    creadoPor: "Recursos Humanos",
    fechaCreacion: new Date().toISOString(),
    imagenURL: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=800&auto=format&fit=crop"
  }
];

seedSistemaExcelIfEmpty(defaultModulesData, defaultNewsData);

async function startServer() {
  const app = express();
  const PORT = 3000;

  ensureNewsImagesDir();
  app.use(express.json({ limit: "20mb" }));
  app.use("/api/gas/news-images", express.static(NEWS_IMAGES_DIR));

  // API Endpoints — fuente de datos: data/sistema.xlsx (libro Excel del sistema)
  app.get("/api/gas/getSistemaInfo", (_req, res) => {
    const config = getSistemaConfig();
    res.json({
      ...config,
      archivo: getSistemaFilePath(),
      descripcion: "Base de datos Excel administrada por Calidad",
    });
  });

  app.post("/api/gas/validateAdminPIN", (req, res) => {
    const { pin } = req.body;
    const isValid = validateAdminPin(String(pin || ""));
    res.json({ isValid });
  });

  app.get("/api/gas/getDashboardModules", (_req, res) => {
    res.json(getDashboardModulesFromExcel());
  });

  app.post("/api/gas/saveDashboardModules", (req, res) => {
    try {
      const { modules } = req.body;
      if (Array.isArray(modules)) {
        const result = saveDashboardModulesToExcel(modules);
        res.json({ success: true, count: result.count });
      } else {
        res.status(400).json({ success: false, error: "Formato de módulos inválido" });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.get("/api/gas/getNews", (_req, res) => {
    const news = getNewsFromExcel().map((n) => ({
      ...n,
      imagenURL: resolveNewsImageUrl(n.imagenURL) || "",
    }));
    res.json(news);
  });

  app.post("/api/gas/saveNews", (req, res) => {
    try {
      const { noticias, usuarioActual } = req.body;
      if (Array.isArray(noticias)) {
        const normalized = noticias.map((n: Noticia) => ({
          ...n,
          imagenURL: n.imagenURL ? toStoredImageRef(n.imagenURL) : "",
          creadoPor: n.creadoPor || usuarioActual || "Sistema",
          fechaCreacion: n.fechaCreacion || new Date().toISOString(),
        }));
        const result = saveNewsToExcel(normalized, usuarioActual);
        res.json({ success: true, count: result.count });
      } else {
        res.status(400).json({ success: false, error: "Formato de noticias inválido" });
      }
    } catch (e: any) {
      res.status(500).json({ success: false, error: e.message });
    }
  });

  app.post("/api/gas/uploadNewsImage", (req, res) => {
    try {
      const { base64, newsId } = req.body;
      if (!base64) {
        return res.status(400).json({ error: "No image data provided" });
      }
      const saved = saveNewsImage(base64, newsId);
      res.json(saved);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/gas/code", (req, res) => {
    res.json({
      codeGs: GAS_CODE_GS
    });
  });

  // Serve Vite in dev or static in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Base de datos Excel: ${getSistemaFilePath()}`);
    console.log(`Imágenes de noticias: ${NEWS_IMAGES_DIR}`);
  });
}

startServer();
