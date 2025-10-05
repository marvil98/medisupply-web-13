# GitHub Actions Workflows - Medisupply

Este documento describe los workflows de GitHub Actions configurados para el proyecto Medisupply.

## 📋 Resumen de Workflows

### 1. **CI - Build and Test** (`ci.yml`)
**Propósito**: Integración continua - build, test y verificación de calidad del código.

**Triggers**:
- Push a ramas `main` y `develop`
- Pull requests hacia `main` y `develop`

**Jobs**:
- **lint**: Verificación de ESLint y formato de código
- **test**: Ejecución de tests unitarios con cobertura
- **build**: Compilación de la aplicación
- **build-verification**: Verificación de que el build funciona

**Características**:
- ✅ Cache de dependencias npm
- ✅ Tests con Chrome Headless
- ✅ Reportes de cobertura con Codecov
- ✅ Verificación de accesibilidad
- ✅ Verificación de tamaño de bundle

### 2. **CD - Deploy** (`cd.yml`)
**Propósito**: Despliegue continuo a diferentes entornos.

**Triggers**:
- Push a rama `main` (staging)
- Tags con formato `v*` (producción)
- Ejecución manual con selección de entorno

**Jobs**:
- **deploy-staging**: Despliegue automático a staging
- **deploy-production**: Despliegue a producción (requiere tag)
- **rollback**: Rollback automático en caso de fallo

**Características**:
- ✅ Despliegue condicional por entorno
- ✅ Creación automática de releases
- ✅ Health checks post-despliegue
- ✅ Rollback automático
- ✅ Artefactos de producción

### 3. **Security and Dependencies** (`security.yml`)
**Propósito**: Auditoría de seguridad y gestión de dependencias.

**Triggers**:
- Ejecución diaria programada (2:00 AM UTC)
- Push y pull requests
- Ejecución manual

**Jobs**:
- **dependency-audit**: Auditoría de vulnerabilidades
- **codeql-analysis**: Análisis de código con CodeQL
- **secret-scanning**: Detección de secretos
- **license-check**: Verificación de licencias
- **dependency-update**: Actualizaciones de dependencias

**Características**:
- ✅ Auditoría de seguridad diaria
- ✅ Análisis estático de código
- ✅ Detección de secretos con TruffleHog
- ✅ Verificación de licencias compatibles
- ✅ Reportes de dependencias obsoletas

### 4. **Notifications and Cleanup** (`notifications.yml`)
**Propósito**: Notificaciones y mantenimiento del repositorio.

**Triggers**:
- Completación de workflows CI/CD
- Limpieza semanal programada (domingos 3:00 AM UTC)
- Ejecución manual

**Jobs**:
- **notify**: Notificaciones de estado de workflows
- **cleanup**: Limpieza de artefactos antiguos
- **metrics**: Generación de reportes de métricas

**Características**:
- ✅ Notificaciones de éxito/fallo
- ✅ Limpieza automática de artefactos (>30 días)
- ✅ Limpieza de workflow runs antiguos (>90 días)
- ✅ Reportes de métricas semanales

## 🚀 Configuración Inicial

### 1. Secrets Requeridos
Configura estos secrets en tu repositorio (`Settings > Secrets and variables > Actions`):

```bash
# Para notificaciones (opcional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Para despliegue (personalizar según tu infraestructura)
STAGING_SERVER_HOST=staging.medisupply.com
PRODUCTION_SERVER_HOST=medisupply.com
DEPLOY_KEY=tu-clave-privada-ssh
```

### 2. Environments
Configura estos environments en tu repositorio (`Settings > Environments`):

- **staging**: Entorno de pruebas
- **production**: Entorno de producción

### 3. Branch Protection Rules
Recomendado configurar en `Settings > Branches`:

- **main**: Requerir PR reviews, status checks (CI workflow)
- **develop**: Requerir status checks

## 📊 Monitoreo y Métricas

### Artefactos Generados
- `dist-files`: Build de la aplicación
- `production-build`: Build de producción
- `security-reports`: Reportes de seguridad
- `license-reports`: Reportes de licencias
- `dependency-updates`: Resumen de actualizaciones
- `metrics-report`: Métricas del repositorio

### Reportes Disponibles
- **Cobertura de código**: Integrado con Codecov
- **Vulnerabilidades**: Reportes diarios de seguridad
- **Dependencias**: Estado de actualizaciones
- **Métricas**: Estadísticas semanales

## 🔧 Personalización

### Modificar Entornos de Despliegue
Edita el archivo `cd.yml` para agregar tus comandos específicos:

```yaml
- name: Deploy to staging server
  run: |
    # Agregar tus comandos aquí
    rsync -avz dist/ user@staging-server:/var/www/medisupply/
    ssh user@staging-server "sudo systemctl reload nginx"
```

### Agregar Notificaciones
Modifica `notifications.yml` para integrar con tus sistemas:

```yaml
- name: Send Slack notification
  run: |
    curl -X POST -H 'Content-type: application/json' \
      --data '{"text":"Deployment successful!"}' \
      ${{ secrets.SLACK_WEBHOOK_URL }}
```

### Configurar Tests Adicionales
Agrega más jobs en `ci.yml`:

```yaml
e2e-tests:
  name: End-to-End Tests
  runs-on: ubuntu-latest
  steps:
    - name: Run E2E tests
      run: npm run e2e
```

## 🛠️ Comandos Útiles

### Ejecutar Workflows Manualmente
```bash
# Desde GitHub UI: Actions > [Workflow] > Run workflow
```

### Verificar Estado Local
```bash
# Ejecutar los mismos comandos que en CI
npm ci
npm run lint
npm run test
npm run build
```

### Debugging
```bash
# Activar debug en workflows
ACTIONS_STEP_DEBUG=true
ACTIONS_RUNNER_DEBUG=true
```

## 📈 Próximos Pasos

1. **Configurar secrets** según tu infraestructura
2. **Personalizar comandos de despliegue** en `cd.yml`
3. **Agregar notificaciones** a tus canales preferidos
4. **Configurar branch protection rules**
5. **Revisar reportes de seguridad** semanalmente
6. **Monitorear métricas** de CI/CD

## 🆘 Troubleshooting

### Problemas Comunes

**Build falla por dependencias**:
- Verificar `package-lock.json` está actualizado
- Ejecutar `npm ci` localmente para reproducir

**Tests fallan**:
- Verificar configuración de Karma
- Revisar logs detallados en GitHub Actions

**Despliegue falla**:
- Verificar secrets configurados
- Comprobar conectividad con servidores
- Revisar permisos de SSH

**Workflows no se ejecutan**:
- Verificar triggers en archivos YAML
- Comprobar permisos del repositorio
- Revisar branch protection rules

---

Para más información, consulta la [documentación oficial de GitHub Actions](https://docs.github.com/en/actions).










