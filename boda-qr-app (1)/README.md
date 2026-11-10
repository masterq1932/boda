# Boda QR - App de Fotos y Videos Compartidos

Esta es una aplicación web full-stack construida con **Next.js 15**, **Tailwind CSS**, **SQLite** (base de datos local en archivo sin servidores ni suscripciones) y **Cloudflare R2** para el almacenamiento de archivos pesados de imágenes y videos.

---

## 🛠️ Requisitos Previos

1. **Node.js**: Versión 18.0 o superior.
2. **Cuenta de Cloudflare**: Para configurar el bucket R2 y obtener las llaves API.

---

## ⚙️ Pasos de Configuración

### 1. Clonar o Descomprimir el Proyecto
Extrae los archivos del proyecto en una carpeta de tu preferencia y entra en ella desde la terminal:
```bash
cd boda-qr-app
npm install
```

---

### 2. Configurar Cloudflare R2

1. Entra a tu panel de **Cloudflare** > **R2 Object Storage**.
2. Crea un bucket llamado por ejemplo `boda-fotos-videos`.
3. Ve a **Settings (Configuración)** del bucket y activa el acceso público (**Public Access** -> **R2 dev domain**).
4. Copia tu dominio público dev de Cloudflare. En tu caso es:
   `https://pub-58e20fe2189e4e7cafc5fcf61578a8e7.r2.dev`
5. Configura las Reglas **CORS** en el bucket para permitir subidas desde tu web:
   ```json
   [
     {
       "AllowedOrigins": ["*"],
       "AllowedMethods": ["GET", "PUT", "POST", "HEAD", "DELETE"],
       "AllowedHeaders": ["*"]
     }
   ]
   ```
6. Ve a la sección **R2** > **Manage R2 API Tokens** y crea un token con permisos de **Edit (Lectura y Escritura)**. Copia el **Access Key ID** y **Secret Access Key**.

---

### 3. Variables de Entorno (`.env.local`)

Crea un archivo `.env.local` en la raíz del proyecto copiando el archivo `.env.example`:

```bash
cp .env.example .env.local
```

Rellena las variables con tus credenciales:

```env
CLOUDFLARE_ACCOUNT_ID=tu_account_id_de_cloudflare
R2_ACCESS_KEY_ID=tu_access_key_id
R2_SECRET_ACCESS_KEY=tu_secret_access_key
R2_BUCKET_NAME=boda-fotos-videos
NEXT_PUBLIC_R2_PUBLIC_DOMAIN=https://pub-58e20fe2189e4e7cafc5fcf61578a8e7.r2.dev
```

---

### 4. Ejecución en Desarrollo

Para probar el proyecto en tu máquina local:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador. El archivo de base de datos SQLite (`boda.db`) se creará automáticamente en la raíz en la primera petición.

---

### 5. Despliegue en Producción (Vercel)

1. Sube tu proyecto a un repositorio de **GitHub**.
2. Importa el repositorio en **Vercel**.
3. En la sección **Environment Variables**, agrega las 5 variables configuradas en tu `.env.local`.
4. Haz clic en **Deploy**.

---

### 6. Generación del Código QR

Una vez que obtengas la URL de tu app en Vercel (por ejemplo `https://boda-carlos-y-maria.vercel.app`), ejecuta en la terminal:

```bash
npm run qr https://boda-carlos-y-maria.vercel.app
```

Se mostrará el código QR listo para verificar y compartir en la señalética o mesas de la boda.
