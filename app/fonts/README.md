# Fuentes propias — LUXE.

Colocá los archivos `.woff2` de tu fuente en esta carpeta.

## Estructura recomendada

```
app/fonts/
├── NombreFuente-Regular.woff2    (weight 400)
├── NombreFuente-Medium.woff2     (weight 500)
├── NombreFuente-SemiBold.woff2   (weight 600)
└── NombreFuente-Bold.woff2       (weight 700)
```

## Cómo activar

Una vez que tengas los archivos, editá `app/layout.tsx`:

1. Descomentá el bloque `localFont` y reemplazá los nombres de archivo
2. Comentá (o eliminá) los imports de `Geist` y `Geist_Mono`
3. Reemplazá las variables en el `<html className>`

El bloque está listo en `layout.tsx`, marcado con `// CUSTOM FONT`.
