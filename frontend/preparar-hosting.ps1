# Script para crear una versión web optimizada de la documentación
# Este script prepara los archivos para hosting web

Write-Host "🚀 Preparando documentación para hosting web..." -ForegroundColor Green

# Crear carpeta para deployment
$deployFolder = "docs-deployment"
if (Test-Path $deployFolder) {
    Remove-Item $deployFolder -Recurse -Force
}
New-Item -ItemType Directory -Path $deployFolder

# Copiar archivo principal
Copy-Item "DOCUMENTACION_TECNICA.html" "$deployFolder/"

# Crear index.html de inicio
$indexContent = @"
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Health State - Documentación</title>
    <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; padding: 40px; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; }
        h1 { color: #2c3e50; margin-bottom: 20px; }
        .btn { display: inline-block; background: linear-gradient(135deg, #3498db, #2980b9); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
        .btn:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏥 Health State</h1>
        <p>Sistema de Gestión Hospitalaria</p>
        <p><strong>Documentación Técnica v1.0</strong></p>
        <a href="DOCUMENTACION_TECNICA.html" class="btn">📖 Ver Documentación</a>
        <p style="margin-top: 30px; color: #7f8c8d; font-size: 0.9em;">
            ✅ Enlaces internos funcionales<br>
            ✅ Navegación interactiva<br>
            ✅ Optimizado para todos los dispositivos
        </p>
    </div>
</body>
</html>
"@

$indexContent | Out-File -FilePath "$deployFolder/index.html" -Encoding UTF8

# Crear README para el deployment
$readmeContent = @"
# Health State - Documentación Web

## 🌐 Archivos Incluidos

- **index.html** - Página de inicio
- **DOCUMENTACION_TECNICA.html** - Documentación completa

## 🚀 Para Hostear

### GitHub Pages:
1. Subir estos archivos a un repositorio
2. Activar GitHub Pages en Settings
3. La documentación estará disponible en: https://tuusuario.github.io/repo/

### Netlify:
1. Arrastrar la carpeta completa a https://app.netlify.com/drop
2. Obtener URL instantánea

### Vercel:
1. Subir carpeta a Vercel
2. Deploy automático

## ✅ Funcionalidades Garantizadas

- ✅ Todos los enlaces internos funcionan
- ✅ Navegación suave entre secciones
- ✅ Responsive en todos los dispositivos
- ✅ Botón de impresión integrado
- ✅ Tabla de contenidos interactiva

---
© 2025 Health State
"@

$readmeContent | Out-File -FilePath "$deployFolder/README.md" -Encoding UTF8

Write-Host "✅ Archivos preparados en la carpeta: $deployFolder" -ForegroundColor Green
Write-Host "📁 Contenido:" -ForegroundColor Yellow
Get-ChildItem $deployFolder | ForEach-Object { Write-Host "   - $($_.Name)" -ForegroundColor Cyan }

Write-Host "`n🌐 Opciones de hosting:" -ForegroundColor Yellow
Write-Host "   1. GitHub Pages: Sube la carpeta a un repo y activa Pages" -ForegroundColor Cyan
Write-Host "   2. Netlify Drop: Arrastra la carpeta a netlify.com/drop" -ForegroundColor Cyan
Write-Host "   3. Vercel: Sube a vercel.com para deploy automático" -ForegroundColor Cyan
Write-Host "   4. Compartir archivo: Envía DOCUMENTACION_TECNICA.html directamente" -ForegroundColor Cyan

Write-Host "`n✨ La documentación mantiene TODOS los enlaces funcionando!" -ForegroundColor Green
