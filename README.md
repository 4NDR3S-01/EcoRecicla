# Aplicación de Reciclaje Inteligente

Una aplicación web completa para el seguimiento y gamificación del reciclaje, construida con Next.js 15 y Supabase.

## 🚀 Características

- **Dashboard personalizado** con estadísticas en tiempo real
- **Sistema de puntos** y niveles de gamificación
- **Seguimiento de actividades** de reciclaje por material
- **Estadísticas de impacto ambiental** (CO2, agua, energía ahorrada)
- **Comunidad** con rankings y logros compartidos
- **Registro de actividades** con cálculo automático de puntos
- **Autenticación completa** con perfiles de usuario

## 📋 Requisitos previos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Cuenta en [Supabase](https://supabase.com) (gratuita)

## ⚠️ Configuración importante

**La aplicación requiere una base de datos Supabase para funcionar correctamente.**

### 1. Configurar Supabase

**Ve al archivo `SUPABASE_SETUP.md` para instrucciones detalladas.**

Resumen rápido:
1. Crea un proyecto en [supabase.com](https://supabase.com)
2. Copia el **Project URL** y **anon public key**
3. Crea un archivo `.env.local` con:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-publica-anonima
```

4. Ejecuta el script SQL del archivo `SUPABASE_SETUP.md` en tu proyecto Supabase

### 2. Instalar dependencias

```bash
npm install
```

### 3. Ejecutar la aplicación

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🛠️ Tecnologías utilizadas

- **Frontend**: Next.js 15, React 19, TypeScript
- **Estilos**: Tailwind CSS
- **Base de datos**: Supabase (PostgreSQL)
- **Autenticación**: Supabase Auth
- **Iconos**: Lucide React

## 📁 Estructura del proyecto

```
src/
├── app/                    # App Router de Next.js 15
│   ├── dashboard/         # Panel principal del usuario
│   ├── estadisticas/      # Análisis de impacto ambiental
│   ├── comunidad/         # Rankings y logros
│   ├── registro/          # Registro de usuarios
│   └── login/             # Inicio de sesión
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes de UI base
│   └── auth/             # Componentes de autenticación
└── lib/                  # Utilidades y configuración
    ├── supabaseClient.ts # Cliente de Supabase
    └── utils.ts          # Funciones de utilidad
```

## 🔧 Funcionalidades implementadas

### ✅ Completamente funcionales
- **Dashboard**: Estadísticas reales del usuario, actividades recientes
- **Estadísticas**: Cálculos de impacto ambiental con datos reales
- **Comunidad**: Rankings en tiempo real de usuarios
- **Registro de actividades**: Modal para añadir reciclaje con cálculo de puntos
- **Autenticación**: Registro, login, perfiles completos

### 🎯 Características principales
- **Datos reales**: Toda la información proviene de Supabase, no hay datos simulados
- **Gamificación**: Sistema de puntos, niveles y logros
- **Tiempo real**: Las estadísticas se actualizan automáticamente
- **Seguridad**: Row Level Security (RLS) configurado
- **Responsive**: Optimizado para móvil y escritorio

## 🐛 Solución de problemas

### "No puedo registrar usuarios"
- Verifica que Supabase esté configurado correctamente
- Revisa el archivo `SUPABASE_SETUP.md`
- Asegúrate de que el archivo `.env.local` exista y tenga las credenciales correctas

### "Error de conexión a la base de datos"
- Verifica las credenciales en `.env.local`
- Asegúrate de que las tablas estén creadas en Supabase
- Verifica que las políticas RLS estén configuradas

### "Datos no aparecen"
- Comprueba que el usuario esté autenticado
- Verifica los permisos RLS en Supabase
- Revisa la consola del navegador para errores

## 📚 Recursos adicionales

- [Documentación de Next.js](https://nextjs.org/docs)
- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de Tailwind CSS](https://tailwindcss.com/docs)

## 🚀 Despliegue

Para desplegar en producción:

1. Configura las variables de entorno en tu plataforma de hosting
2. Asegúrate de que la configuración de Supabase incluya tu dominio de producción
3. Ejecuta el build: `npm run build`

**Plataformas recomendadas**: Vercel, Netlify, Railway

---

Para configuración detallada de la base de datos, consulta el archivo `SUPABASE_SETUP.md`.
