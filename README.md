# workspace-somacor-bi — Repo Puente (staging)

Este repositorio es un **puente de pruebas (staging)**, no es producción.

## ¿Para qué sirve?

Acá trabaja el equipo de soporte y se suben avances para **revisar y probar**. Cuando
algo sirve, se traspasa **a mano** desde aquí hacia el repo de producción
(`workspace-somacor`).

- ➡️ Producción → Puente: **NO** se empuja nada.
- ⬅️ Puente → Producción: el traspaso lo hace Cecil **manualmente** cuando algo está OK.

## Subida automática

Los cambios suben a la rama `main` **solos cada 10 minutos**, mediante el script
[`auto-sync.ps1`](auto-sync.ps1) ejecutado por una tarea programada de Windows.

No hay que correr comandos de git a mano: solo abrir el editor, trabajar y guardar.

## Archivos clave

- [`auto-sync.ps1`](auto-sync.ps1) — script que commitea, rebasea y empuja en automático.
- [`SETUP-MICHELL.md`](SETUP-MICHELL.md) — guía paso a paso para dejar el equipo configurado.
- `auto-sync.log` — registro local de cada sincronización (no se sube al repo).
