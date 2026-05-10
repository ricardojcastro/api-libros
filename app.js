/**
 * ============================================================
 *  API REST de Libros — app.js
 * ============================================================
 */

const express = require("express");
const path    = require("path");

const app = express();

app.use(express.json());

// Sirve index.html y archivos estáticos desde la misma carpeta
app.use(express.static(path.join(__dirname)));

// ── BASE DE DATOS EN MEMORIA ─────────────────────────────────
const libros = [
  { id: 1, nombre: "Cien años de soledad",     anioPublicacion: 1967, autor: "Gabriel García Márquez",    genero: "Realismo mágico" },
  { id: 2, nombre: "Don Quijote de la Mancha", anioPublicacion: 1605, autor: "Miguel de Cervantes",       genero: "Novela"          },
  { id: 3, nombre: "El principito",             anioPublicacion: 1943, autor: "Antoine de Saint-Exupéry", genero: "Fábula"          },
  { id: 4, nombre: "1984",                      anioPublicacion: 1949, autor: "George Orwell",             genero: "Distopía"        },
  { id: 5, nombre: "El código Da Vinci",        anioPublicacion: 2003, autor: "Dan Brown",                 genero: "Thriller"        },
];

// ── RUTAS ────────────────────────────────────────────────────

/**
 * GET /api/libros
 * ─────────────────────────────────────────────────────────────
 * Maneja CUATRO casos según los query params recibidos:
 *
 *  • Sin params        → devuelve TODOS los libros
 *  • ?nombre=texto     → filtra por nombre (case-insensitive)
 *  • ?id=numero        → busca por ID exacto
 *  • ?nombre=x&id=y   → aplica AMBOS filtros a la vez
 *
 * Ejemplos:
 *   GET /api/libros
 *   GET /api/libros?nombre=principito
 *   GET /api/libros?id=3
 *   GET /api/libros?nombre=el&id=3
 */
app.get("/api/libros", (req, res) => {
  const { nombre, id } = req.query;

  let resultado = [...libros]; // copia del arreglo para no modificar el original

  // ── Filtro por ID (query param ?id=) ──────────────────────
  if (id !== undefined) {
    const idNum = parseInt(id, 10);

    if (isNaN(idNum)) {
      return res.status(400).json({
        error: true,
        mensaje: "El parámetro 'id' debe ser un número entero válido.",
      });
    }

    resultado = resultado.filter((l) => l.id === idNum);
  }

  // ── Filtro por nombre (?nombre=) ──────────────────────────
  if (nombre) {
    resultado = resultado.filter((l) =>
      l.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
  }

  // ── Sin resultados ────────────────────────────────────────
  if ((id !== undefined || nombre) && resultado.length === 0) {
    return res.status(404).json({
      error: true,
      mensaje: "No se encontraron libros con los filtros indicados.",
      filtros: { id: id ?? null, nombre: nombre ?? null },
    });
  }

  return res.json({
    total: resultado.length,
    filtros: {
      id:     id     ?? null,
      nombre: nombre ?? null,
    },
    libros: resultado,
  });
});

/**
 * GET /api/libros/:id
 * ─────────────────────────────────────────────────────────────
 * Ruta DINÁMICA — obtiene un libro por ID en la URL.
 *   /api/libros/3  →  devuelve "El principito"
 *
 * Errores manejados:
 *   400 → :id no es un número
 *   404 → no existe un libro con ese ID
 */
app.get("/api/libros/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  if (isNaN(id)) {
    return res.status(400).json({
      error: true,
      mensaje: "El parámetro id debe ser un número entero válido.",
    });
  }

  const libro = libros.find((l) => l.id === id);

  if (!libro) {
    return res.status(404).json({
      error: true,
      mensaje: `No se encontró ningún libro con id: ${id}`,
    });
  }

  res.json(libro);
});

/**
 * GET /
 * Sirve la página de documentación (index.html)
 */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Middleware 404 para rutas no definidas
app.use((req, res) => {
  res.status(404).json({
    error: true,
    mensaje: `La ruta "${req.method} ${req.originalUrl}" no existe en esta API.`,
  });
});

// ── INICIO DEL SERVIDOR ──────────────────────────────────────
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("✅ Servidor corriendo en http://localhost:" + PORT);
  console.log("📚 Documentación en http://localhost:" + PORT);
});

