# Proyecto de Conocimiento Personal con Flask y MongoDB

## Estructura del Proyecto

- **app.py**: Contiene la lógica principal de la aplicación Flask, conectándose a MongoDB para recuperar las entradas y renderizarlas en la página de inicio.
- **requirements.txt**: Lista de dependencias necesarias para el proyecto, incluyendo Flask, pymongo y Flask-Frozen.
- **templates/index.html**: Plantilla HTML para mostrar las entradas recuperadas de MongoDB.

## Configuración de MongoDB

- **Base de Datos**: `personal_knowledge_project`
- **Colección**: `entries`
  - **Campos**:
    - `type`: Tipo de contenido (Texto, Imagen, Audio).
    - `content`: El texto o descripción del contenido.
    - `tags`: Lista de etiquetas relacionadas con el contenido.
    - `media`: URLs opcionales para imágenes y grabaciones.
    - `word_fields`: Clasificación de palabras en 5 grandes grupos (0 a 4).
    - `conceptual_fields`: Categorías abstractas como “Arte”, “Filosofía”.
    - `context`: Ambientes o marcos conceptuales como “Reflexión matutina”.
    - `related_entries`: IDs de otros elementos relacionados.
    - `metadata`: Incluye `temperature`, `simplicity`, y `date_created`.

## Desarrollo y Despliegue

- **Desarrollo**: Ejecutar la aplicación Flask localmente con `app.run(debug=True)`.
- **Despliegue**: Utilizar Flask-Frozen para generar archivos estáticos para su despliegue en servidores estáticos.

## Dependencias

- Flask
- pymongo
- Flask-Frozen

## Pasos Siguientes

1. Instalar las dependencias con `pip install -r requirements.txt`.
2. Ejecutar la aplicación Flask para desarrollo.
3. Usar Flask-Frozen para generar archivos estáticos para despliegue.

Puedes reiniciar el proyecto en otro entorno o chat cuando estés listo.
