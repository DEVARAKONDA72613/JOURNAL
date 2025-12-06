<#
import_jpgs_and_update.ps1

Usage:
  1) Place all your JPG files in a single folder (e.g. C:\Users\sasan\Pictures\journal-jpgs).
  2) From project root (c:\Users\sasan\OneDrive\Desktop\journal) run:
       .\import_jpgs_and_update.ps1 -SourceFolder "C:\Users\sasan\Pictures\journal-jpgs"

What it does:
  - Copies cover JPGs named like `2026-01.jpg` to `assets/covers/`.
  - Copies still/default JPGs named like `2026-01-default.jpg` and day JPGs like `2026-01-01.jpg` to `assets/stills/`.
  - Updates `data.json` so month `coverImage` and `defaultStillImage` use `.jpg` when matching files were copied.
  - Updates day objects' `stillImage` and `personalPhoto` if matching JPGs exist.

Notes:
  - This script runs locally on your PC. I cannot access files on your machine.
  - Make a backup of `data.json` before running (the script will also create `data.json.importbak`).
#>
param(
  [Parameter(Mandatory=$true)]
  [string]$SourceFolder
)

Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

if (-not (Test-Path $SourceFolder)) {
  Write-Error "Source folder '$SourceFolder' does not exist."
  exit 1
}

# Ensure destination folders exist
$coversDest = Join-Path -Path . -ChildPath 'assets\covers'
$stillsDest = Join-Path -Path . -ChildPath 'assets\stills'
New-Item -ItemType Directory -Path $coversDest -Force | Out-Null
New-Item -ItemType Directory -Path $stillsDest -Force | Out-Null

# Backup data.json
Copy-Item .\data.json .\data.json.importbak -Force

$json = Get-Content .\data.json -Raw | ConvertFrom-Json

# Copy cover JPGs: pattern YYYY-MM.jpg (e.g., 2026-01.jpg)
Get-ChildItem -Path $SourceFolder -Filter '????-??.jpg' | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $coversDest -Force
  Write-Host "Copied cover: $($_.Name)"
}

# Copy default stills pattern YYYY-MM-default.jpg
Get-ChildItem -Path $SourceFolder -Filter '????-??-default.jpg' | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $stillsDest -Force
  Write-Host "Copied default still: $($_.Name)"
}

# Copy day stills pattern YYYY-MM-DD.jpg
Get-ChildItem -Path $SourceFolder -Filter '????-??-??.jpg' | Where-Object { $_.Name -notmatch '-default' } | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $stillsDest -Force
  Write-Host "Copied day still: $($_.Name)"
}

# Copy personal photos if named like YYYY-MM-DD-personal.jpg
Get-ChildItem -Path $SourceFolder -Filter '*-personal.jpg' | ForEach-Object {
  Copy-Item -Path $_.FullName -Destination $stillsDest -Force
  Write-Host "Copied personal photo: $($_.Name)"
}

# Update data.json to prefer JPGs when present
foreach ($m in $json.months) {
  $coverJpg = Join-Path -Path $coversDest -ChildPath ($m.id + '.jpg')
  if (Test-Path $coverJpg) {
    $m.coverImage = ('assets/covers/' + $m.id + '.jpg')
  }

  $stillJpg = Join-Path -Path $stillsDest -ChildPath ($m.id + '-default.jpg')
  if (Test-Path $stillJpg) {
    $m.defaultStillImage = ('assets/stills/' + $m.id + '-default.jpg')
  }

  if ($m.days) {
    foreach ($d in $m.days) {
      $dayJpg = Join-Path -Path $stillsDest -ChildPath ($d.date + '.jpg')
      if (Test-Path $dayJpg) { $d.stillImage = ('assets/stills/' + $d.date + '.jpg') }

      $personalJpg = Join-Path -Path $stillsDest -ChildPath ($d.date + '-personal.jpg')
      if (Test-Path $personalJpg) { $d.personalPhoto = ('assets/stills/' + $d.date + '-personal.jpg') }
    }
  }
}

# Save updated JSON
$json | ConvertTo-Json -Depth 10 | Set-Content .\data.json -Force
Write-Host "data.json updated. A backup was saved as data.json.importbak"
Write-Host "Done. Open the site (or run a local server) to preview changes."