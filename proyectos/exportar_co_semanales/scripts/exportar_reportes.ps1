# exportar_reportes.ps1
# Exporta todos los reportes del workspace "C.O - Semanales" a PDF.
# Requiere login interactivo con cuenta Microsoft (se abre el navegador).

# ─── CONFIGURACION ────────────────────────────────────────────────────────────
$WORKSPACE_ID   = "ab83f335-7756-4fc0-8e2c-00246483403d"
$WORKSPACE_NAME = "C.O - Semanales"
$FORMATO        = "PDF"
$TIEMPO_MAX_SEG = 180   # tiempo máximo de espera por reporte (3 minutos)
$INTERVALO_SEG  = 5     # cada cuántos segundos consulta el estado

$fechaHoy      = Get-Date -Format "yyyy-MM-dd"
$carpetaSalida = Join-Path $PSScriptRoot "..\salidas"
# ──────────────────────────────────────────────────────────────────────────────

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Exportador de reportes PowerBI — $WORKSPACE_NAME" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# ─── 1. VERIFICAR E INSTALAR MODULO ──────────────────────────────────────────
if (-not (Get-Module -ListAvailable -Name MicrosoftPowerBIMgmt)) {
    Write-Host "El modulo MicrosoftPowerBIMgmt no esta instalado." -ForegroundColor Yellow
    Write-Host "Instalando... (esto solo ocurre la primera vez)" -ForegroundColor Yellow
    Install-Module -Name MicrosoftPowerBIMgmt -Scope CurrentUser -Force
    Write-Host "Modulo instalado correctamente." -ForegroundColor Green
    Write-Host ""
}

Import-Module MicrosoftPowerBIMgmt -ErrorAction Stop

# ─── 2. LOGIN INTERACTIVO ─────────────────────────────────────────────────────
Write-Host "Paso 1: Iniciando sesion en Microsoft Fabric/PowerBI..." -ForegroundColor Yellow
Write-Host "        Se abrira el navegador — ingresa tu usuario y contrasena de Microsoft." -ForegroundColor Gray
Write-Host ""

try {
    Connect-PowerBIServiceAccount | Out-Null
    Write-Host "Sesion iniciada correctamente." -ForegroundColor Green
} catch {
    Write-Host "ERROR: No se pudo iniciar sesion. Detalle: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# ─── 3. CREAR CARPETA DE SALIDA SI NO EXISTE ─────────────────────────────────
if (-not (Test-Path $carpetaSalida)) {
    New-Item -ItemType Directory -Path $carpetaSalida | Out-Null
}

# ─── 4. OBTENER REPORTES DEL WORKSPACE ───────────────────────────────────────
Write-Host "Paso 2: Obteniendo lista de reportes del workspace '$WORKSPACE_NAME'..." -ForegroundColor Yellow

try {
    $reportes = Get-PowerBIReport -WorkspaceId $WORKSPACE_ID
} catch {
    Write-Host "ERROR: No se pudo obtener los reportes. Detalle: $_" -ForegroundColor Red
    Disconnect-PowerBIServiceAccount | Out-Null
    exit 1
}

if (-not $reportes -or $reportes.Count -eq 0) {
    Write-Host "No se encontraron reportes en el workspace. Revisa que tengas acceso." -ForegroundColor Red
    Disconnect-PowerBIServiceAccount | Out-Null
    exit 1
}

Write-Host "Se encontraron $($reportes.Count) reporte(s):" -ForegroundColor Green
$reportes | ForEach-Object { Write-Host "  - $($_.Name)" -ForegroundColor White }
Write-Host ""

# ─── 5. EXPORTAR CADA REPORTE ────────────────────────────────────────────────
Write-Host "Paso 3: Exportando reportes a PDF..." -ForegroundColor Yellow
Write-Host ""

$exitosos = @()
$fallidos  = @()

foreach ($reporte in $reportes) {

    Write-Host "  Exportando: $($reporte.Name)" -ForegroundColor Cyan

    # 5a. Iniciar exportacion
    $urlExportar = "groups/$WORKSPACE_ID/reports/$($reporte.Id)/ExportTo"
    $cuerpo      = '{"format":"' + $FORMATO + '"}'

    try {
        $respuestaJson = Invoke-PowerBIRestMethod -Url $urlExportar -Method Post -Body $cuerpo
        $respuesta     = $respuestaJson | ConvertFrom-Json
        $exportId      = $respuesta.id
    } catch {
        Write-Host "    ERROR al iniciar exportacion: $_" -ForegroundColor Red
        $fallidos += $reporte.Name
        continue
    }

    # 5b. Esperar hasta que termine
    $urlEstado    = "groups/$WORKSPACE_ID/reports/$($reporte.Id)/exports/$exportId"
    $tiempoEspera = 0
    $estado       = "Running"

    while ($estado -notin @("Succeeded", "Failed") -and $tiempoEspera -lt $TIEMPO_MAX_SEG) {
        Start-Sleep -Seconds $INTERVALO_SEG
        $tiempoEspera += $INTERVALO_SEG

        try {
            $checkJson = Invoke-PowerBIRestMethod -Url $urlEstado -Method Get
            $check     = $checkJson | ConvertFrom-Json
            $estado    = $check.status
            $porcentaje = if ($check.percentComplete) { $check.percentComplete } else { "..." }
            Write-Host "    Esperando... $estado ($porcentaje%) — $($tiempoEspera)s" -ForegroundColor Gray
        } catch {
            Write-Host "    Advertencia al consultar estado: $_" -ForegroundColor Yellow
        }
    }

    if ($estado -ne "Succeeded") {
        $motivo = if ($tiempoEspera -ge $TIEMPO_MAX_SEG) { "tiempo de espera agotado" } else { "la API reporto error" }
        Write-Host "    ERROR: $motivo para '$($reporte.Name)'" -ForegroundColor Red
        $fallidos += $reporte.Name
        continue
    }

    # 5c. Descargar el archivo
    $nombreLimpio  = $reporte.Name -replace '[\\/:*?"<>|]', '' -replace '\s+', '_'
    $nombreArchivo = "$fechaHoy`_$nombreLimpio.pdf"
    $rutaArchivo   = Join-Path $carpetaSalida $nombreArchivo

    try {
        $token    = (Get-PowerBIAccessToken).Authorization
        $urlDescarga = "https://api.powerbi.com/v1.0/myorg/groups/$WORKSPACE_ID/reports/$($reporte.Id)/exports/$exportId/file"
        Invoke-WebRequest -Uri $urlDescarga -Headers @{ Authorization = $token } -OutFile $rutaArchivo
        Write-Host "    OK — guardado como: $nombreArchivo" -ForegroundColor Green
        $exitosos += $nombreArchivo
    } catch {
        Write-Host "    ERROR al descargar el archivo: $_" -ForegroundColor Red
        $fallidos += $reporte.Name
    }

    Write-Host ""
}

# ─── 6. RESUMEN FINAL ─────────────────────────────────────────────────────────
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  RESUMEN" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Exitosos : $($exitosos.Count)" -ForegroundColor Green
Write-Host "  Con error: $($fallidos.Count)" -ForegroundColor $(if ($fallidos.Count -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($exitosos.Count -gt 0) {
    Write-Host "  Archivos guardados en:" -ForegroundColor White
    Write-Host "  $((Resolve-Path $carpetaSalida).Path)" -ForegroundColor White
    Write-Host ""
    $exitosos | ForEach-Object { Write-Host "    - $_" -ForegroundColor Green }
}

if ($fallidos.Count -gt 0) {
    Write-Host ""
    Write-Host "  Reportes que fallaron:" -ForegroundColor Red
    $fallidos | ForEach-Object { Write-Host "    - $_" -ForegroundColor Red }
}

Write-Host ""

# ─── 7. CERRAR SESION ─────────────────────────────────────────────────────────
Disconnect-PowerBIServiceAccount | Out-Null
Write-Host "Sesion cerrada. Listo." -ForegroundColor Cyan
Write-Host ""
