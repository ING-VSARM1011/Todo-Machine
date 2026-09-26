# Todo Machine

Aplicación de tareas con React, Vite y guardado local. Permite crear, editar,
completar, reabrir, eliminar y buscar tareas.

## Requisitos e instalación

Usa **Node.js 24 LTS, versión 24.15 o superior dentro de la rama 24**.
La versión de referencia está en `.nvmrc`. Node 22.2 no es compatible con
las herramientas actuales de este proyecto.

```sh
npm ci
npm run dev
```

Abre la dirección que Vite indique en la terminal. `npm start` es un alias de
`npm run dev`.

## Comandos

| Comando | Función |
| --- | --- |
| `npm run dev` | Servidor de desarrollo |
| `npm run lint` | Revisión de JavaScript, JSX y reglas de React |
| `npm test` | Pruebas unitarias y de componentes, una ejecución |
| `npm run test:watch` | Pruebas durante el desarrollo |
| `npm run test:coverage` | Pruebas con reporte de cobertura |
| `npm run build` | Compilación optimizada en `dist/` |
| `npm run preview` | Vista previa local de la compilación |
| `npm run check` | Lint, pruebas con cobertura y compilación |
| `npm run audit:security` | Auditoría de dependencias de desarrollo y ejecución |

La cobertura HTML queda en `coverage/index.html`. Se exige al menos 90 % de
sentencias, funciones y líneas, y 85 % de ramas. El punto de montaje
`main.jsx` se comprueba con la compilación; no se incluye en la cobertura.

## Datos y comportamiento

- Las tareas se guardan en `localStorage`, con la clave `todo-machine.todos.v1`.
- No se transmiten a un servidor. Borrar los datos del navegador elimina las tareas.
- No hay cuentas, respaldo remoto ni sincronización entre dispositivos o pestañas.
  Si editas desde varias pestañas, prevalece el último guardado.
- Las tareas tienen identificadores únicos; dos textos iguales son tareas distintas.
- Se rechazan textos vacíos y se limita cada tarea a 200 caracteres.
- La búsqueda ignora mayúsculas y espacios exteriores; el contador siempre refleja
  todas las tareas, incluso cuando hay un filtro.
- Si el almacenamiento está bloqueado o lleno, la aplicación muestra un aviso y
  mantiene los cambios en memoria durante esa sesión.
- Si el contenido guardado es inválido, se informa del problema. No se sobrescribe
  hasta que el usuario haga un cambio.

## Pruebas

Vitest y React Testing Library comprueban las transiciones de tareas, validación
de datos, búsqueda, persistencia, edición y cancelación, nombres duplicados,
errores de lectura/escritura y representación segura del texto.
Las pruebas usan jsdom: no sustituyen pruebas en navegadores reales.

## Preparación para despliegue

```sh
npm ci
npm run audit:security
npm run check
```

Publica únicamente el contenido de `dist/` en un alojamiento estático con HTTPS,
por ejemplo Netlify, Cloudflare Pages o un servidor web. Usa `npm run build`
como comando de compilación y `dist` como directorio de publicación.
`vite preview` es una herramienta de comprobación local, no el servidor de despliegue.

Para publicar bajo una subcarpeta, configura la base al compilar:

```sh
npm run build -- --base=/Todo-Machine/
```

`public/_headers` se copia a la compilación e incluye CSP, protección contra
iframes, política de referencias y caché para assets con hash. Netlify y
Cloudflare Pages interpretan ese archivo. En otros servidores debes configurar
cabeceras equivalentes y verificar su respuesta HTTP.

El workflow de GitHub Actions instala con `npm ci`, audita dependencias,
ejecuta lint y pruebas con cobertura, compila y publica `dist/` como artefacto
descargable del workflow. **No despliega automáticamente** ni necesita secretos.
Dependabot revisa npm y GitHub Actions semanalmente.

No guardes claves ni contraseñas en el frontend: las variables `VITE_*` se incluyen
en el JavaScript público. Los archivos `.env*` están ignorados salvo `.env.example`.

## Migración

Se eliminó Create React App (`react-scripts`) y `web-vitals`, que no se utilizaba.
El punto de entrada HTML está ahora en la raíz y el JSX usa extensión `.jsx`.
Se regeneró `package-lock.json` con npm, sin forzar conflictos de dependencias.

Referencias:
[Vite](https://vite.dev/guide/),
[Vitest](https://vitest.dev/guide/),
[React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## Verificación realizada

La auditoría inicial detectó 67 vulnerabilidades en el árbol de Create React App.
Tras la migración, `npm ci` instaló el bloqueo correctamente y la auditoría de npm
no detectó vulnerabilidades en los 223 paquetes auditados.

Pasaron ESLint, 36 pruebas y la compilación de producción. La cobertura medida
fue 96,2 % de sentencias, 93,87 % de ramas y 100 % de funciones y líneas.
También se comprobó la compilación en Edge: creación, finalización y persistencia
tras recargar, sin errores de ejecución y sin desbordamiento horizontal a 390 px.

Estas comprobaciones fueron locales. El workflow remoto y las cabeceras del
alojamiento deberán verificarse al subir y desplegar el proyecto.
