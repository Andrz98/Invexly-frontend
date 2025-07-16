# Invexly Frontend

Este repositorio implementa el frontend de Invexly, una aplicación web desarrollada con React y Vite. Su propósito es proporcionar una interfaz de usuario sencilla, moderna y segura para la autenticación y la gestión de perfiles de usuario, integrándose directamente con el backend de Invexly.

## Descripción general

- Inicio de sesión y registro: El componente `AuthCard` centraliza ambos procesos, gestionando la validación de credenciales y mostrando mensajes claros sobre el resultado de cada acción.
- Edición de perfil: La página `ProfilePage` permite actualizar datos personales (nombre, correo, contraseña) y gestionar el avatar del usuario, utilizando Cloudinary para el almacenamiento de imágenes.
- Navegación protegida: El contexto de autenticación (`AuthProvider`) controla el estado de sesión y garantiza que las rutas sensibles (como `/dashboard` y `/profile`) solo sean accesibles para usuarios autenticados mediante el componente `PrivateRoute`.
- Diseño responsive: Los estilos se gestionan con Tailwind CSS y DaisyUI, incorporando fuentes locales y utilidades para una experiencia visual adaptable en cualquier dispositivo.
- Despliegue en Netlify: La configuración con `netlify.toml` y `_redirects` permite el correcto funcionamiento de la aplicación como SPA en producción.

## Arquitectura y prácticas

- Se ha implementado la arquitectura **Atomic Design** en la organización de componentes, facilitando la reutilización y la escalabilidad de la interfaz.
- El flujo de autenticación prioriza la seguridad y la privacidad del usuario:  
  - La gestión de tokens y sesiones se realiza mediante cookies seguras y Context API.
  - No se exponen datos privados o sensibles en el cliente ni en la consola del navegador. Los mensajes mostrados al usuario son controlados y no revelan información interna del sistema.
  - El propósito es asegurar un inicio de sesión robusto, mantener la sesión activa durante el tiempo previsto y permitir al usuario reloguear correctamente, en sincronía con la lógica del backend.
- El código y la estructura de carpetas están organizados para favorecer la legibilidad y el mantenimiento.

## Estructura relevante
src/
├── Components/ # Componentes organizados según Atomic Design (átomos, moléculas, organismos)

├── context/ # Contexto global de autenticación y sesión

├── pages/ # Vistas principales de la aplicación (Dashboard, Profile)

├── services/ # Llamadas a la API y lógica de comunicación con el backend

└── assets/ # Recursos estáticos (imágenes, fuentes)

public/
├── avatars/ # Avatares de ejemplo para selección de usuario

└── fonts/ # Fuentes locales utilizadas en la UI



## Mantenimiento del formato y control de calidad

El proyecto utiliza ESLint y Prettier para asegurar la consistencia del código y el cumplimiento de estándares definidos:

- `"lint": "eslint ."` analiza el código y detecta incumplimientos de las reglas configuradas.
- `"lint:fix": "eslint . --fix"` corrige automáticamente los errores identificados por ESLint.
- `"format": "prettier --write ."` aplica el formato definido en las reglas de Prettier a todos los archivos.

Estos scripts, definidos en `package.json`, permiten mantener la calidad y legibilidad del código a lo largo del ciclo de desarrollo, minimizando errores comunes y facilitando la colaboración.

## Scripts principales

- `"dev"`: inicia el entorno de desarrollo con Vite
- `"build"`: compila la aplicación para producción
- `"preview"`: sirve una versión estática del build
- `"lint"`: revisa el código con ESLint y Prettier

## Dependencias destacadas

- React 18
- React Router DOM
- Axios
- React Toastify
- Lucide React
- Headless UI
- DaisyUI y Tailwind CSS
- Vite Plugin Static Copy

## Notas de despliegue

La configuración de Netlify incluye:

- Un archivo `netlify.toml` que redirige todas las rutas (`/*`) a `index.html`, asegurando el correcto funcionamiento de la SPA en producción.
- El archivo `_redirects` se copia automáticamente a la carpeta de distribución durante el proceso de build mediante `vite-plugin-static-copy`.

## Consideraciones

Este frontend está diseñado para ofrecer una experiencia de usuario segura, modular y eficiente, demostrando integración efectiva con el backend de Invexly, adopción de prácticas modernas de organización del código y un enfoque estricto en la privacidad y seguridad de la información del usuario.


