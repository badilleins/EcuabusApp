
# EcuabusApp: Gestión de Rutas y Venta de Boletos para Cooperativa de Autobuses

**EcuabusApp** es una solución integral diseñada para optimizar la gestión de rutas, conductores y la venta de boletos en cooperativas de autobuses. Esta aplicación combina la potencia de un servidor centralizado con una aplicación móvil distribuida en formato APK para ofrecer una experiencia fluida y eficiente a administradores, oficinistas y clientes.


## Comenzando 🚀
## Instalación y Configuración

## Pre-requisitos 📋

- **Node.js** (versión 14 o superior).
- **Ionic CLI** (instalar con `npm install -g @ionic/cli`).
- **Firebase Console**: Configurar un proyecto con Authentication y Firestore.


### Configuración del Servidor

1. **Clonar el repositorio**:
   ```bash
   git clone https://github.com/badilleins/EcuabusApp.git
   ```

2. **Navegar al directorio del proyecto**:
   ```bash
   cd EcuabusApp
   ```

3. **Instalar dependencias**:
   ```bash
   npm install
   ```

4. **Configurar Firebase**:
   - Descarga el archivo `google-services.json` desde Firebase Console.
   - Coloca este archivo en el directorio `src/environments`.

5. **Iniciar el servidor**:
   ```bash
   ionic serve
   ```

### Compilación de la Aplicación Móvil (APK)

1. **Construir el APK**:
   ```bash
   ionic cordova build android --prod --release
   ```

2. **Ubicación del APK**:
   El archivo APK generado estará en:
   ```
   platforms/android/app/build/outputs/apk/release/
   ```

3. **Distribuir el APK**:
   Comparte este archivo con los usuarios para su instalación en dispositivos Android.

---

---

## Características Principales

- **Gestión de Rutas y Frecuencias**: Organización y planificación de rutas con horarios definidos.
- **Venta de Boletos**: Compra rápida con selección de asientos y generación de boletos con códigos QR.
- **Perfiles Personalizados**: Funcionalidades específicas para:
  - **Administradores**: Control total del sistema.
  - **Oficinistas**: Validación y venta en taquillas.
  - **Clientes**: Compra y consulta de boletos.
- **Historial de Transacciones**: Seguimiento detallado de las ventas y pagos.
- **Autenticación Segura**: Manejo de usuarios y roles mediante Firebase Authentication.
- **Base de Datos en Tiempo Real**: Soporte de Firebase Firestore para un acceso rápido y seguro a los datos.

---

## Arquitectura del Proyecto

EcuabusApp consta de dos componentes principales:

1. **Servidor**:
   - Gestiona la lógica del negocio.
   - Expone servicios API para la comunicación con la aplicación móvil.
   - Se ejecuta en un entorno centralizado (servidor local o nube).

2. **Aplicación Móvil**:
   - Desarrollada en **Ionic Framework** y empaquetada como APK para Android.
   - Consume los servicios API del servidor.
   - Diseñada para uso directo por clientes y oficinistas.

---

## Tecnologías Utilizadas

- **Frontend**:
  - Ionic Framework
  - Angular
  - SCSS (para personalización de estilos)
  
- **Backend**:
  - Firebase (Authentication, Firestore, Storage)
  
- **Herramientas de Desarrollo**:
  - Ionic CLI
  - Android Studio

---

## Estructura del Proyecto

El proyecto está organizado de la siguiente manera:

```
src
├── app
│   ├── guards       # Protección de rutas según el rol del usuario.
│   ├── models       # Definición de interfaces y tipos de datos.
│   ├── pages        # Páginas principales.
│   ├── services     # Lógica del negocio e interacción con Firebase.
│   ├── shared       # Componentes reutilizables (botones, modales, etc.).
├── assets           # Recursos estáticos como imágenes e íconos.
├── environments     # Configuraciones para desarrollo y producción.
├── theme            # Archivos SCSS para personalización de estilos.
```

---

## Estructura de Firebase

La base de datos Firebase está organizada en las siguientes colecciones:

- **clients**: Información de los clientes registrados.
- **cooperatives**:
  - **Rutas**: Información de las rutas disponibles.
  - **Transacciones**: Historial de ventas y pagos.
  - **boletos**: Datos de boletos vendidos (asientos, horarios, cliente, etc.).
  - **buses**: Detalles de los autobuses (capacidad, estado).
  - **clerks**: Oficinistas registrados.
  - **conductores / drivers**: Información de los conductores asignados.
  - **frecuencies**: Horarios y frecuencias de las rutas.
  - **taquilleros**: Datos de los cobradores.
  - **viajes**: Registro de viajes programados.
- **users**: Información general de los usuarios.

---

## Perfiles de Usuario y Funcionalidades

### Administrador
- Gestiona rutas, horarios y precios.
- Asigna conductores, cobradores y autobuses a viajes.
- Supervisa estadísticas y reportes.

### Oficinista
- Realiza ventas de boletos en taquillas.
- Valida códigos QR al abordar.

### Cliente
- Consulta rutas y horarios.
- Compra boletos seleccionando asientos.
- Descarga sus boletos y consulta el historial de compras.

---


## Créditos ✒️

## Equipo de desarrollo bytebuddies:
- Stalin Danilo Badillo Silva.
- Medina Vasco Gabriel Leonardo.
- Izurieta Freire Daniel Kevin.
- Ramírez Rojas  Andrés Said.
- Villafuerte Grijalva Mauricio Fernando.

---

## Enlaces Útiles

- [Repositorio de EcuabusApp](https://github.com/badilleins/EcuabusApp.git)  
- [Documentación de Ionic](https://ionicframework.com/docs)  
- [Documentación de Firebase](https://firebase.google.com/docs)
