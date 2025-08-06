# Script para convertir documentación de Markdown a DOCX
# Requiere tener pandoc instalado: https://pandoc.org/installing.html

param(
    [string]$InputFile = "DOCUMENTACION_TECNICA.md",
    [string]$OutputFile = "DOCUMENTACION_TECNICA_HEALTH_STATE.docx"
)

Write-Host "🏥 Generando documentación técnica de Health State..." -ForegroundColor Cyan

# Verificar si pandoc está instalado
try {
    $pandocVersion = pandoc --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Pandoc no encontrado"
    }
    Write-Host "✅ Pandoc encontrado" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Pandoc no está instalado" -ForegroundColor Red
    Write-Host "📥 Para instalar pandoc:" -ForegroundColor Yellow
    Write-Host "   1. Visita: https://pandoc.org/installing.html" -ForegroundColor Yellow
    Write-Host "   2. O usa Chocolatey: choco install pandoc" -ForegroundColor Yellow
    Write-Host "   3. O usa Winget: winget install JohnMacFarlane.Pandoc" -ForegroundColor Yellow
    exit 1
}

# Verificar si el archivo de entrada existe
if (-not (Test-Path $InputFile)) {
    Write-Host "❌ Error: Archivo $InputFile no encontrado" -ForegroundColor Red
    exit 1
}

Write-Host "📄 Convirtiendo $InputFile a $OutputFile..." -ForegroundColor Yellow

try {
    # Convertir Markdown a DOCX con configuraciones optimizadas
    pandoc $InputFile -o $OutputFile `
        --from markdown `
        --to docx `
        --toc `
        --toc-depth=3 `
        --number-sections `
        --highlight-style=tango `
        --reference-doc=template.docx 2>$null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Documentación generada exitosamente: $OutputFile" -ForegroundColor Green
        Write-Host "📊 Información del archivo:" -ForegroundColor Cyan
        $fileInfo = Get-Item $OutputFile
        Write-Host "   📏 Tamaño: $([math]::Round($fileInfo.Length / 1KB, 2)) KB" -ForegroundColor White
        Write-Host "   📅 Creado: $($fileInfo.CreationTime)" -ForegroundColor White
        
        # Preguntar si abrir el archivo
        $openFile = Read-Host "¿Deseas abrir el archivo ahora? (y/n)"
        if ($openFile -eq 'y' -or $openFile -eq 'Y') {
            Start-Process $OutputFile
        }
    } else {
        Write-Host "❌ Error al generar el documento" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error durante la conversión: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏥 Health State - Documentación Técnica Completa" -ForegroundColor Cyan
Write-Host "📋 El documento incluye:" -ForegroundColor White
Write-Host "   • Arquitectura del sistema" -ForegroundColor Gray
Write-Host "   • Documentación de módulos" -ForegroundColor Gray
Write-Host "   • APIs y servicios" -ForegroundColor Gray
Write-Host "   • Configuración y despliegue" -ForegroundColor Gray
Write-Host "   • Características de seguridad" -ForegroundColor Gray
Write-Host "   • Estructura de directorios" -ForegroundColor Gray
