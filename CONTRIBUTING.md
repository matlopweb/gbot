# 🤝 Contribuir a GBot

¡Gracias por tu interés en contribuir a GBot! Este documento proporciona pautas para contribuir al proyecto.

## 🚀 Cómo Empezar

1. **Fork el repositorio**
2. **Clona tu fork**
   ```bash
   git clone https://github.com/tu-usuario/gbot.git
   cd gbot
   ```
3. **Crea una rama para tu feature**
   ```bash
   git checkout -b feature/mi-nueva-funcionalidad
   ```
4. **Instala dependencias**
   ```bash
   npm run install:all
   ```

## 📝 Guías de Estilo

### JavaScript/JSX

- Usa ES6+ features
- Usa `const` por defecto, `let` cuando sea necesario
- Nombres descriptivos para variables y funciones
- Comentarios para lógica compleja
- Evita código duplicado

### Commits

Usa [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: agrega nueva funcionalidad
fix: corrige bug
docs: actualiza documentación
style: cambios de formato
refactor: refactorización de código
test: agrega o actualiza tests
chore: tareas de mantenimiento
```

Ejemplos:
```bash
git commit -m "feat: agrega soporte para múltiples idiomas"
git commit -m "fix: corrige error en autenticación OAuth"
git commit -m "docs: actualiza guía de instalación"
```

## 🧪 Testing

Antes de hacer un PR, asegúrate de que:

- [ ] El código funciona correctamente
- [ ] No hay errores en la consola
- [ ] El código sigue las guías de estilo
- [ ] La documentación está actualizada

## 📦 Pull Requests

1. **Actualiza tu rama con main**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Push a tu fork**
   ```bash
   git push origin feature/mi-nueva-funcionalidad
   ```

3. **Crea el Pull Request**
   - Título descriptivo
   - Descripción detallada de los cambios
   - Referencias a issues relacionados
   - Screenshots si aplica

### Template de PR

```markdown
## Descripción
Breve descripción de los cambios

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva funcionalidad
- [ ] Breaking change
- [ ] Documentación

## Checklist
- [ ] El código sigue las guías de estilo
- [ ] He realizado pruebas
- [ ] He actualizado la documentación
- [ ] No hay warnings en la consola
```

## 🐛 Reportar Bugs

Usa el template de issues para reportar bugs:

```markdown
**Descripción del bug**
Descripción clara del problema

**Pasos para reproducir**
1. Ir a '...'
2. Hacer clic en '...'
3. Ver error

**Comportamiento esperado**
Lo que debería suceder

**Screenshots**
Si aplica

**Entorno**
- OS: [e.g. Windows 11]
- Navegador: [e.g. Chrome 120]
- Versión de Node: [e.g. 18.17.0]
```

## 💡 Sugerir Funcionalidades

Para sugerir nuevas funcionalidades:

1. Verifica que no exista ya un issue similar
2. Crea un nuevo issue con el template de feature request
3. Describe claramente el caso de uso
4. Explica por qué sería útil

## 🎯 Áreas de Contribución

### Backend
- Nuevas integraciones (Gmail, Slack, etc.)
- Optimización de performance
- Mejoras en seguridad
- Tests unitarios

### Frontend
- Mejoras en UI/UX
- Nuevas animaciones
- Accesibilidad
- Responsive design

### Documentación
- Tutoriales
- Ejemplos de uso
- Traducciones
- Videos explicativos

### DevOps
- Scripts de deployment
- Docker improvements
- CI/CD pipelines
- Monitoring

## 🏆 Reconocimientos

Los contribuidores serán listados en el README.md

## 📄 Licencia

Al contribuir, aceptas que tus contribuciones serán licenciadas bajo la licencia MIT del proyecto.

## ❓ Preguntas

Si tienes preguntas, puedes:
- Abrir un issue de discusión
- Contactar a los maintainers
- Unirte a nuestro Discord (si aplica)

¡Gracias por contribuir a GBot! 🎉
