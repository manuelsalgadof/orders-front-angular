// API_URL se inyecta vía build-arg de Docker (sed reemplaza el placeholder)
// Para producción real: usar build-arg con URL del dominio productivo
export const environment = {
  production: true,
  apiUrl: 'DOCKER_API_URL_PLACEHOLDER'
};
