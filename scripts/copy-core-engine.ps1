$dest = "node_modules\core-engine"
Remove-Item $dest -Force -Recurse -ErrorAction SilentlyContinue
New-Item -ItemType Directory -Path $dest -Force | Out-Null
Copy-Item "..\VISTAMATIONS\core_engine\dist" "$dest\dist" -Recurse -Force
Copy-Item "..\VISTAMATIONS\core_engine\package.json" "$dest\package.json" -Force
Write-Host "core-engine copied into node_modules"
