/**
 * ============================================================
 *  API REST de Libros — app.js
 *  Autor : Ricardo Castro node app.js
 *  Descripción: Servidor Express que gestiona un catálogo de
 *               libros almacenados en memoria (arreglo).
 * ============================================================
 */

// ── 1. IMPORTACIONES ─────────────────────────────────────────
/**
 * express : framework minimalista para crear servidores HTTP
 *           en Node.js. Se instala con: npm install express
 */
const express = require("express");

// ── 2. INICIALIZACIÓN DE LA APP ──────────────────────────────
/**
 * express() crea la instancia principal de la aplicación.
 * Sobre esta instancia registraremos rutas, middlewares, etc.
 * Se ejecuta una sola vez al arrancar el proceso.
 */
const app = express();

/**
 * express.json() es un middleware integrado que parsea
 * automáticamente el cuerpo de las peticiones cuyo
 * Content-Type sea "application/json".
 * Se invoca en CADA petición antes de llegar a la ruta.
 */
app.use(express.json());

// ── 3. BASE DE DATOS EN MEMORIA ──────────────────────────────
/**
 * libros : arreglo de objetos que actúa como fuente de datos.
 * Campos obligatorios (según requisitos):
 *   - id            → número único identificador
 *   - nombre        → cadena con el título del libro
 *   - anioPublicacion → año de publicación (número)
 * Campos adicionales para enriquecer la respuesta:
 *   - autor         → nombre del autor
 *   - genero        → género literario
 */
const libros = [
  {
    id: 1,
    nombre: "Cien años de soledad",
    anioPublicacion: 1967,
    autor: "Gabriel García Márquez",
    genero: "Realismo mágico",
  },
  {
    id: 2,
    nombre: "Don Quijote de la Mancha",
    anioPublicacion: 1605,
    autor: "Miguel de Cervantes",
    genero: "Novela",
  },
  {
    id: 3,
    nombre: "El principito",
    anioPublicacion: 1943,
    autor: "Antoine de Saint-Exupéry",
    genero: "Fábula",
  },
  {
    id: 4,
    nombre: "1984",
    anioPublicacion: 1949,
    autor: "George Orwell",
    genero: "Distopía",
  },
  {
    id: 5,
    nombre: "El código Da Vinci",
    anioPublicacion: 2003,
    autor: "Dan Brown",
    genero: "Thriller",
  },
];

// ── 4. RUTAS ─────────────────────────────────────────────────

/**
 * GET /
 * Ruta raíz — bienvenida a la API.
 * Se invoca cuando el cliente hace GET a la URL base del servidor.
 * Responde con un JSON informativo (nombre, versión, rutas disponibles).
 */
app.get("/", (req, res) => {
  res.json({
    mensaje: "Bienvenido a la API de Libros",
    version: "1.0.0",
    endpoints: {
      listarTodos: "GET /api/libros",
      buscarPorNombre: "GET /api/libros?nombre=<texto>",
      obtenerPorId: "GET /api/libros/:id",
    },
  });
});

/**
 * GET /api/libros
 * ─────────────────────────────────────────────────────────────
 * RUTA ESTÁTICA con soporte de PARÁMETRO DE CONSULTA opcional.
 *
 * Caso 1 — Sin query param (?nombre):
 *   Devuelve el arreglo completo de libros.
 *   Ejemplo: GET /api/libros
 *
 * Caso 2 — Con query param ?nombre=<texto>:
 *   Filtra los libros cuyo nombre contenga el texto buscado
 *   (búsqueda insensible a mayúsculas/minúsculas).
 *   Ejemplo: GET /api/libros?nombre=quijote
 *
 * req.query  → objeto con los parámetros de la query string.
 * Se invoca cada vez que el cliente solicita el listado.
 */
app.get("/api/libros", (req, res) => {
  // Extraemos el parámetro ?nombre de la URL (puede ser undefined)
  const { nombre } = req.query;

  // Si se proporcionó el parámetro nombre, filtramos
  if (nombre) {
    const resultado = libros.filter((libro) =>
      libro.nombre.toLowerCase().includes(nombre.toLowerCase())
    );

    // Si no se encontró ningún libro con ese nombre, informamos
    if (resultado.length === 0) {
      return res.status(404).json({
        error: true,
        mensaje: `No se encontraron libros con el nombre: "${nombre}"`,
      });
    }

    // Retornamos los libros filtrados junto con el total encontrado
    return res.json({
      total: resultado.length,
      libros: resultado,
    });
  }

  // Sin filtro: devolvemos todos los libros
  res.json({
    total: libros.length,
    libros,
  });
});

/**
 * GET /api/libros/:id
 * ─────────────────────────────────────────────────────────────
 * RUTA DINÁMICA — el segmento :id es variable.
 *
 * Busca un libro cuyo campo `id` coincida con el valor numérico
 * recibido en la URL.
 * Ejemplo: GET /api/libros/3  → devuelve "El principito"
 *
 * req.params → objeto con los segmentos dinámicos de la ruta.
 *              req.params.id llega como STRING; usamos parseInt()
 *              para convertirlo a número antes de comparar.
 *
 * Errores manejados:
 *   - 400 Bad Request  → :id no es un número válido
 *   - 404 Not Found    → no existe un libro con ese id
 *
 * Se invoca cuando el cliente solicita un libro específico.
 */
app.get("/api/libros/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);

  // Validamos que el id sea un número entero válido
  if (isNaN(id)) {
    return res.status(400).json({
      error: true,
      mensaje: "El parámetro id debe ser un número entero válido.",
    });
  }

  // Buscamos el libro en el arreglo
  const libro = libros.find((l) => l.id === id);

  // Si no se encontró, respondemos 404
  if (!libro) {
    return res.status(404).json({
      error: true,
      mensaje: `No se encontró ningún libro con id: ${id}`,
    });
  }

  // Libro encontrado → 200 OK
  res.json(libro);
});

/**
 * Middleware para rutas no definidas (404 genérico).
 * Se invoca cuando ninguna ruta anterior coincidió con la petición.
 * Debe declararse DESPUÉS de todas las rutas válidas.
 */
app.use((req, res) => {
  res.status(404).json({
    error: true,
    mensaje: `La ruta "${req.method} ${req.originalUrl}" no existe en esta API.`,
  });
});

// ── 5. INICIO DEL SERVIDOR ───────────────────────────────────
/**
 * process.env.PORT : variable de entorno que Render (y otros
 *   servicios cloud) inyectan automáticamente en producción.
 * 3000              : puerto de respaldo para desarrollo local.
 *
 * app.listen() pone el servidor a escuchar peticiones entrantes.
 * El callback se ejecuta UNA sola vez, al arrancar el servidor.
 */
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📚 API de Libros lista — ${new Date().toLocaleString()}`);
});
