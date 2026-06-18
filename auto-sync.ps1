# ============================================================================
#  auto-sync.ps1  -  Sincronizacion automatica del repo PUENTE (workspace-somacor-bi)
# ----------------------------------------------------------------------------
#  Que hace, en simple:
#    1. Se mete a la carpeta del repo.
#    2. Guarda (commitea) lo que Michell haya cambiado.
#    3. Baja los cambios de Cecil con rebase (sin merge commits feos).
#    4. Sube todo a GitHub (main).
#
#  Lo corre el Programador de Tareas de Windows cada 10 minutos, en silencio.
#  Michell NO tiene que escribir ningun comando de git: solo trabaja y guarda.
#
#  REGLAS DE ORO:
#    - Si el rebase choca (conflicto), NO fuerza nada: deja todo como estaba,
#      escribe el error en auto-sync.log y se detiene para que lo revise Cecil.
#    - Si no hay nada nuevo que subir, no crea commits vacios.
#
#  OJO con el orden: primero COMMITEAMOS lo de Michell y DESPUES hacemos el
#  pull --rebase. Es a proposito: git no deja rebasear con cambios sin guardar,
#  asi que guardamos primero y luego integramos lo de Cecil encima. Igual usa
#  rebase, asi que el historial queda limpio.
# ============================================================================

# La carpeta del repo es la MISMA donde vive este script, se llame como se llame.
# $PSScriptRoot = carpeta del propio archivo .ps1. Asi no importa si el repo esta
# en C:\workspace-somacor-bi, en C:\workspace-somacor o donde sea: siempre apunta bien.
$RepoPath = $PSScriptRoot
$LogFile  = Join-Path $RepoPath "auto-sync.log"

# --- Funcion para escribir en el log con fecha y hora ----------------------
function Escribir-Log {
    param([string]$Mensaje)
    $marca = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    "$marca  $Mensaje" | Out-File -FilePath $LogFile -Append -Encoding utf8
}

# Si algo revienta de forma inesperada, lo atrapamos y lo dejamos en el log.
try {

    # --- 1. Meternos a la carpeta del repo ---------------------------------
    if (-not (Test-Path $RepoPath)) {
        # No usamos $LogFile aca porque ni la carpeta existe; escribimos en C:\
        $marca = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        "$marca  ERROR: no existe la carpeta $RepoPath" | Out-File "C:\auto-sync-ERROR.log" -Append -Encoding utf8
        exit 1
    }
    Set-Location $RepoPath

    # --- 2. Guardar (commitear) lo que cambio Michell ----------------------
    # git add -A toma TODO: archivos nuevos, modificados y borrados.
    git add -A

    # Preguntamos si quedo algo "en cola" para commitear.
    # 'git diff --cached --quiet' devuelve codigo 0 si NO hay cambios staged,
    # y codigo 1 si SI hay. Por eso miramos $LASTEXITCODE.
    git diff --cached --quiet
    $hayCambios = ($LASTEXITCODE -ne 0)

    if ($hayCambios) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        git commit -m "auto-sync: $timestamp" | Out-Null
        if ($LASTEXITCODE -ne 0) {
            Escribir-Log "ERROR: fallo el commit. Me detengo, no toco nada mas."
            exit 1
        }
        Escribir-Log "Cambios de Michell guardados en commit 'auto-sync: $timestamp'."
    }
    else {
        Escribir-Log "No habia cambios locales nuevos que guardar."
    }

    # --- 3. Bajar lo de Cecil con rebase -----------------------------------
    # Como ya commiteamos, el arbol esta limpio y el rebase puede correr.
    git pull --rebase origin main
    if ($LASTEXITCODE -ne 0) {
        # Algo salio mal en el pull/rebase (lo mas probable: un CONFLICTO).
        # Regla de oro: NO forzamos nada. Abortamos el rebase para dejar el
        # repo tal cual estaba antes de intentar bajar, registramos y paramos.
        Escribir-Log "ERROR: el 'pull --rebase' fallo (probable conflicto). Aborto el rebase y me detengo SIN forzar ni subir nada. Revisar a mano."
        git rebase --abort 2>$null   # por si quedo un rebase a medias; si no habia, no pasa nada
        exit 1
    }

    # --- 4. Subir todo a GitHub --------------------------------------------
    # Subimos si hicimos un commit nuevo o si el rebase trajo algo que reposicionar.
    git push origin main
    if ($LASTEXITCODE -ne 0) {
        Escribir-Log "ERROR: el 'push' a origin main fallo. Me detengo. Revisar conexion / permisos."
        exit 1
    }

    if ($hayCambios) {
        Escribir-Log "OK: cambios subidos a GitHub (main)."
    }
    else {
        Escribir-Log "OK: repo al dia (nada nuevo que subir)."
    }
}
catch {
    # Cualquier error inesperado que no hayamos previsto cae aca.
    Escribir-Log "ERROR inesperado: $($_.Exception.Message)"
    exit 1
}
