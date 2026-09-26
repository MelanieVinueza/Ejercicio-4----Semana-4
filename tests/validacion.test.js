/**
 * Pruebas del sitio estático.
 *
 * Solo validan los tres archivos del proyecto (index.html, script.js y
 * styles.css), así que no necesitan instalar nada: usan el runner nativo
 * de Node.js (`node --test`).
 */

const { test } = require("node:test");
const assert = require("node:assert/strict");
const { existsSync, readFileSync } = require("node:fs");
const { join, resolve } = require("node:path");

const RAIZ = resolve(__dirname, "..");
const leer = (archivo) => readFileSync(join(RAIZ, archivo), "utf8");

const html = leer("index.html");
const js = leer("script.js");
const css = leer("styles.css");

test("los tres archivos del proyecto existen y no están vacíos", () => {
  for (const archivo of ["index.html", "script.js", "styles.css"]) {
    assert.ok(existsSync(join(RAIZ, archivo)), `falta ${archivo}`);
    assert.ok(leer(archivo).trim().length > 0, `${archivo} está vacío`);
  }
});

test("index.html: es HTML válido en español y responsive", () => {
  assert.match(html, /^<!DOCTYPE html>/i, "debe declarar el DOCTYPE");
  assert.match(html, /<html\s+lang="es"/, "debe declarar lang=\"es\"");
  assert.match(html, /<meta\s+charset="UTF-8">/i, "falta la codificación UTF-8");
  assert.match(html, /name="viewport"[^>]*width=device-width/, "falta la etiqueta viewport");
  assert.match(html, /<title>[^<]+<\/title>/, "falta el título");
  assert.match(html, /<h1>[^<]+<\/h1>/, "falta el encabezado principal");
});

test("index.html: enlaza la hoja de estilos y el script", () => {
  assert.match(html, /<link[^>]*rel="stylesheet"[^>]*href="styles\.css"/, "no enlaza styles.css");
  assert.match(html, /<script[^>]*src="script\.js"/, "no carga script.js");
  assert.match(html, /<script[^>]*defer/, "el script debería cargarse con defer");
});

test("index.html: el botón y el mensaje de resultado son los que espera el JS", () => {
  const boton = html.match(/<button[^>]*id="btnCargar"[^>]*>/)?.[0] || "";
  assert.match(boton, /type="button"/, "el botón debe declarar type=\"button\"");

  const mensaje = html.match(/<p[^>]*id="resultado"[^>]*>/)?.[0] || "";
  assert.match(mensaje, /aria-live="polite"/, "el mensaje debe ser una región viva para accesibilidad");
});

test("index.html: todos los recursos locales referenciados existen", () => {
  const referenciados = [...html.matchAll(/(?:src|href)="([^"]+)"/g)]
    .map((m) => m[1])
    .filter((r) => !/^(https?:)?\/\//i.test(r) && !r.startsWith("#") && !r.startsWith("data:"));

  assert.ok(referenciados.length > 0, "el HTML no referencia ningún recurso local");
  for (const recurso of referenciados) {
    assert.ok(existsSync(join(RAIZ, recurso)), `falta el recurso referenciado: ${recurso}`);
  }
});

test("script.js: implementa el servicio asíncrono con manejo de errores", () => {
  assert.match(js, /class\s+ServicioError\s+extends\s+Error/, "debe definir el error ServicioError");
  assert.match(js, /new\s+Promise\(/, "debe usar una Promise");
  assert.match(js, /setTimeout\(/, "debe simular la demora de red con setTimeout");
  assert.match(js, /resolve\(/, "debe resolver la Promise");
  assert.match(js, /reject\(/, "debe rechazar la Promise");
  assert.match(js, /async\s*\(/, "el manejador del clic debe ser async");
  assert.match(js, /await\s+obtenerDatosUsuario\(/, "debe esperar la respuesta del servicio");
  assert.match(js, /try\s*{/, "debe manejar los errores con try/catch");
  assert.match(js, /catch\s*\(/, "debe manejar los errores con try/catch");
  assert.match(js, /finally\s*{/, "debe usar finally para cerrar el intento");
});

test("script.js: los ids que consulta existen en el HTML", () => {
  const idsUsados = [...js.matchAll(/getElementById\(\s*["']([^"']+)["']\s*\)/g)].map((m) => m[1]);

  assert.ok(idsUsados.length > 0, "script.js debería consultar elementos por id");
  for (const id of idsUsados) {
    assert.ok(html.includes(`id="${id}"`), `el HTML no define el id "${id}" que usa script.js`);
  }
});

test("index.html: no quedaron elementos sin usar en el JS", () => {
  const idsHtml = [...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);

  assert.ok(idsHtml.length > 0, "el HTML no define ningún id");
  for (const id of idsHtml) {
    assert.ok(js.includes(`"${id}"`), `el id "${id}" del HTML no se usa en script.js`);
  }
});

test("script.js: muestra estados de carga, éxito y error", () => {
  assert.match(js, /"Cargando\.\.\."/, "debe indicar la carga en curso");
  assert.match(js, /`Bienvenido,/, "debe saludar al usuario cuando el servicio responde");
  assert.match(js, /`Error: \$\{error\.message\}`/, "debe mostrar el mensaje del error");
  assert.match(js, /addEventListener\(\s*"click"/, "debe reaccionar al clic del botón");
});

test("styles.css: estiliza los elementos que usa el HTML", () => {
  assert.match(css, /body\s*{/, "debe aplicar estilos al body");
  assert.match(css, /button\s*{/, "debe aplicar estilos al botón");
  assert.match(css, /button:hover\s*{/, "debe Dar efecto hover al botón");
  assert.match(css, /#resultado\s*{/, "debe aplicar estilos al mensaje de resultado");
  assert.ok(/font-family\s*:/.test(css), "debe definir la tipografía");
});
