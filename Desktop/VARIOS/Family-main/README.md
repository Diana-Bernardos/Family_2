# 📅 Family Calendar - Aplicación de Organización Familiar

Aplicación web completa para gestionar eventos, miembros y documentos familiares con asistente AI integrado.

## 🚀 Características

- ✅ **Calendario de Eventos**: Visualiza y gestiona todos los eventos familiares
- 👥 **Gestión de Miembros**: Administra información de los miembros de la familia
- 📎 **Documentos**: Almacena y gestiona documentos por miembro
- 🤖 **Asistente AI**: Chatbot inteligente para consultas sobre la familia
- 💾 **Persistencia SQLite**: Todos los datos se guardan localmente en SQLite
- 🎨 **Diseño Moderno**: Interfaz limpia y responsive

## 🛠️ Tecnologías

### Backend
- Node.js + Express
- SQLite3
- Multer (subida de archivos)
- Axios (para Ollama AI)

### Frontend
- React 18
- React Router v6
- FullCalendar
- CSS3

## 📦 Instalación

### Backend

```bash
cd backend
npm install
npm start
# o para desarrollo:
npm run dev
```

El servidor se iniciará en `http://localhost:3001`

### Frontend

```bash
cd frontend
npm install
npm start
```

La aplicación se abrirá en `http://localhost:3000`

## 📁 Estructura del Proyecto

```
Family-main/
├── backend/
│   ├── config/
│   │   ├── config.js          # Configuración
│   │   └── database.js        # Conexión SQLite
│   ├── routes/
│   │   ├── events.js          # Rutas de eventos
│   │   ├── members.js         # Rutas de miembros
│   │   ├── documents.js       # Rutas de documentos
│   │   └── ai.js              # Rutas del asistente AI
│   ├── data/
│   │   └── family.db          # Base de datos SQLite (se crea automáticamente)
│   └── server.js              # Servidor Express
│
└── frontend/
    ├── src/
    │   ├── components/         # Componentes React
    │   ├── services/           # Servicios API
    │   └── App.jsx            # Componente principal
    └── public/                # Archivos estáticos
```

## 🗄️ Base de Datos

La base de datos SQLite se crea automáticamente al iniciar el servidor en `backend/data/family.db`.

### Tablas:
- `members` - Miembros de la familia
- `events` - Eventos del calendario
- `event_members` - Relación eventos-miembros
- `documents` - Documentos de miembros
- `chat_interactions` - Historial del chat

## 🎯 Uso

1. **Iniciar Backend**: `cd backend && npm start`
2. **Iniciar Frontend**: `cd frontend && npm start`
3. **Acceder**: Abre `http://localhost:3000` en tu navegador

### Funcionalidades:

- **Calendario**: Ve todos los eventos en vista mensual
- **Eventos**: Crea, edita y elimina eventos
- **Miembros**: Gestiona información de familiares
- **Documentos**: Sube y descarga documentos por miembro
- **Asistente**: Haz preguntas sobre eventos y miembros

## ⚙️ Configuración

Puedes configurar las siguientes variables de entorno en `backend/.env`:

```env
PORT=3001
DB_FILE=backend/data/family.db
OLLAMA_API_URL=http://localhost:11434/api
MODEL_NAME=llama3.2:1b-instruct-fp16
```

## 📝 Notas

- La aplicación **no requiere autenticación** - acceso directo
- Todos los datos se guardan en SQLite localmente
- El asistente AI requiere Ollama instalado (opcional)
- Los archivos se almacenan como BLOB en la base de datos

## 🐛 Solución de Problemas

Si encuentras errores:
1. Asegúrate de que el backend esté corriendo en el puerto 3001
2. Verifica que SQLite esté instalado: `npm install sqlite3`
3. Revisa la consola del navegador para errores del frontend
4. Revisa los logs del servidor para errores del backend

## 📄 Licencia

Este proyecto es de uso personal/familiar.
