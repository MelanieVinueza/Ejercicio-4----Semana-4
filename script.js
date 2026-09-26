class ServicioError extends Error {
  constructor(mensaje) {
    super(mensaje);
    this.name = "ServicioError";
  }
}

function obtenerDatosUsuario() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const exito = Math.random() > 0.3;
      if (exito) {
        resolve({ usuario: "Mela", rol: "estudiante" });
      } else {
        reject(new ServicioError("No se pudo conectar con el servicio"));
      }
    }, 800);
  });
}

const boton = document.getElementById("btnCargar");
const resultado = document.getElementById("resultado");

boton.addEventListener("click", async () => {
  resultado.textContent = "Cargando...";
  try {
    const datos = await obtenerDatosUsuario();
    resultado.textContent = `Bienvenido, ${datos.usuario} (${datos.rol})`;
  } catch (error) {
    resultado.textContent = `Error: ${error.message}`;
  } finally {
    console.log("Intento de carga finalizado");
  }
});
