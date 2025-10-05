# Configuración adicional para GitHub Actions

## Variables de entorno globales
NODE_VERSION: '20'
CACHE_VERSION: v1

## Configuración de dependencias
- Cache de npm habilitado
- Instalación con `npm ci` para builds reproducibles
- Verificación de integridad de package-lock.json

## Configuración de seguridad
- Análisis de código con CodeQL
- Auditoría de dependencias con npm audit
- Escaneo de secretos con TruffleHog
- Verificación de licencias compatibles

## Configuración de despliegue
- Entornos: staging (main branch) y production (tags v*)
- Rollback automático en caso de fallo
- Health checks post-despliegue
- Creación automática de releases

## Configuración de notificaciones
- Notificaciones de éxito/fallo de workflows
- Limpieza automática de artefactos antiguos
- Reportes de métricas semanales










