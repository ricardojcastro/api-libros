/**
 * ============================================================
 *  API REST de Libros — app.js
 *  Autor : Ricardo Castro
 * ============================================================
 */

const express = require("express");
const path    = require("path");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const libros = [
  { id: 1, nombre: "Cien años de soledad",     anioPublicacion: 1967, autor: "Gabriel García Márquez",    genero: "Realismo mágico" },
  { id: 2, nombre: "Don Quijote de la Mancha", anioPublicacion: 1605, autor: "Miguel de Cervantes",       genero: "Novela"          },
  { id: 3, nombre: "El principito",             anioPublicacion: 1943, autor: "Antoine de Saint-Exupéry", genero: "Fábula"          },
  { id: 4, nombre: "1984",                      anioPublicacion: 1949, autor: "George Orwell",             genero: "Distopía"        },
  { id: 5, nombre: "El código Da Vinci",        anioPublicacion: 2003, autor: "Dan Brown",                 genero: "Thriller"        },
];

// Lista todos / busca por nombre
app.get("/api/libros", (req, res) => {
  const { nombre } = req.query;
  if (nombre) {
    const resultado = libros.filter((l) =>
      l.nombre.toLowerCase().includes(nombre.toLowerCase())
    );
    if (resultado.length === 0)
      return res.status(404).json({ error: true, mensaje: `No se encontraron libros con el nombre: "${nombre}"` });
    return res.json({ total: resultado.length, libros: resultado });
  }
  res.json({ total: libros.length, libros });
});

// Obtiene un libro por ID
app.get("/api/libros/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id))
    return res.status(400).json({ error: true, mensaje: "El parámetro id debe ser un número entero válido." });
  const libro = libros.find((l) => l.id === id);
  if (!libro)
    return res.status(404).json({ error: true, mensaje: `No se encontró ningún libro con id: ${id}` });
  res.json(libro);
});

// Sirve index.html en la raíz
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));

// 404 genérico
app.use((req, res) => res.status(404).json({ error: true, mensaje: `Ruta no encontrada: ${req.originalUrl}` }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Servidor en http://localhost:${PORT}`);
  console.log(`📚 Documentación en http://localhost:${PORT}`);
});
