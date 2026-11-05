---
name: documenter
description: Actívate cuando el usuario pida trabajar sobre la documentación del proyecto, generar o actualizar archivos en docs/, o documentar APIs, modelos o dominios. Usar SOLO para tareas de documentación del proyecto, no para comentarios del código.
---

# Documenter — Documentación del proyecto

La documentación del proyecto vive en la carpeta `docs/`. Actualmente está **desacoplada del código**, No es necesario revisar el código real a menos que se indique explícitamente.


## Reglas generales

1. **Idioma**: La documentación se genera en español.
2. **No borrar nada** sin permiso explícito del usuario.
2. **Cuidar la informacion previa** si se estan creando cosas nuevas seguramente el usuario no quiera que tambien reemplaces cosas existentes con una nueva version de lo mismo (o de algo similar a lo que estaba previamente). En casos de este estilo pregunta si se quiere reemplazar lo anterior, o si ese archivo/informacion se omite.
3. **No modificar archivos fuera de `docs/`** — prohibido tocar código, tests, configuraciones, etc.
4. **Confirmar antes de sobrescribir**: preguntar antes de reemplazar contenido existente, especialmente si hay pérdida de datos involucrada (sobrescritura, borrado de filas, movimiento irreversible de contenido entre secciones).
5. **Respetar las plantillas**: no eliminar tablas solo porque están vacías. Seguir los formatos establecidos en `docs/doc_tools/templates/`.
6. **Reglas de dominio**: cada `endpoints.md` tiene reglas específicas en su encabezado. Leerlas y respetarlas antes de modificar el archivo.
7. **Sin dependencias externas**: priorizar la biblioteca estándar de Go. No incluir librerías externas sin consultar.
8. Confirmar siempre con el usuario antes de crear vs. reemplazar contenido.
