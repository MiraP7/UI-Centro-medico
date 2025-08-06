# Script para abrir la documentación técnica de Health State
# Este script abre el archivo HTML en el navegador predeterminado

Write-Host "🏥 Health State - Abriendo Documentación Técnica..." -ForegroundColor Cyan

$htmlFile = "DOCUMENTACION_TECNICA.html"

if (Test-Path $htmlFile) {
    Write-Host "✅ Abriendo documentación en el navegador..." -ForegroundColor Green
    Start-Process $htmlFile
    
    Write-Host "`n📋 Documentación incluye:" -ForegroundColor Yellow
    Write-Host "   • Arquitectura completa del sistema" -ForegroundColor White
    Write-Host "   • Documentación de todos los módulos" -ForegroundColor White
    Write-Host "   • APIs y servicios implementados" -ForegroundColor White
    Write-Host "   • Configuración y despliegue" -ForegroundColor White
    Write-Host "   • Características de seguridad" -ForegroundColor White
    Write-Host "   • Estructura de directorios detallada" -ForegroundColor White
    
    Write-Host "`n💡 Para convertir a DOCX:" -ForegroundColor Cyan
    Write-Host "   1. Abrir el archivo HTML en Word" -ForegroundColor Gray
    Write-Host "   2. Ir a Archivo > Guardar como" -ForegroundColor Gray
    Write-Host "   3. Seleccionar formato 'Documento de Word (.docx)'" -ForegroundColor Gray
    Write-Host "   4. Guardar con el nombre deseado" -ForegroundColor Gray
    
    Write-Host "`n🖨️ El archivo HTML incluye:" -ForegroundColor Cyan
    Write-Host "   • Botón de impresión (esquina superior derecha)" -ForegroundColor Gray
    Write-Host "   • Navegación suave entre secciones" -ForegroundColor Gray
    Write-Host "   • Formato optimizado para impresión" -ForegroundColor Gray
    Write-Host "   • Estilos profesionales listos para presentación" -ForegroundColor Gray
} else {
    Write-Host "❌ Error: No se encontró el archivo $htmlFile" -ForegroundColor Red
    Write-Host "   Asegúrate de que el archivo esté en el directorio actual" -ForegroundColor Yellow
}

Write-Host "`n🏥 Health State - Documentación Técnica Completa" -ForegroundColor Cyan
