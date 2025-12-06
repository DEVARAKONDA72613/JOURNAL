<#
convert_svgs_to_jpg_refs.ps1

Safely replace .svg references in `data.json` with .jpg for covers, default stills, and day images.

Usage:
  .\convert_svgs_to_jpg_refs.ps1 [-DryRun]

What it does:
  - Creates a backup `data.json.svgbak`.
  - Replaces occurrences of ".svg" in `coverImage`, `defaultStillImage`, `stillImage`, and `personalPhoto` values with ".jpg".
  - Optionally runs in DryRun mode to print changes without writing.

Note: This only updates JSON strings; it does not move or create image files.
#>
param(
  [switch]$DryRun
)

Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

if (-not (Test-Path '.\data.json')) { Write-Error 'data.json not found in current directory.'; exit 1 }

Copy-Item .\data.json .\data.json.svgbak -Force
$jsonRaw = Get-Content .\data.json -Raw
$json = $jsonRaw | ConvertFrom-Json

$changed = $false

foreach ($m in $json.months) {
  if ($m.coverImage -and $m.coverImage -like '*.svg') {
    $old = $m.coverImage; $m.coverImage = $m.coverImage -replace '\.svg$','.jpg'; Write-Host "coverImage: $old -> $($m.coverImage)"; $changed = $true
  }
  if ($m.defaultStillImage -and $m.defaultStillImage -like '*.svg') {
    $old = $m.defaultStillImage; $m.defaultStillImage = $m.defaultStillImage -replace '\.svg$','.jpg'; Write-Host "defaultStillImage: $old -> $($m.defaultStillImage)"; $changed = $true
  }
  if ($m.days) {
    foreach ($d in $m.days) {
      if ($d.stillImage -and $d.stillImage -like '*.svg') { $old = $d.stillImage; $d.stillImage = $d.stillImage -replace '\.svg$','.jpg'; Write-Host "day still: $old -> $($d.stillImage)"; $changed = $true }
      if ($d.personalPhoto -and $d.personalPhoto -like '*.svg') { $old = $d.personalPhoto; $d.personalPhoto = $d.personalPhoto -replace '\.svg$','.jpg'; Write-Host "personal photo: $old -> $($d.personalPhoto)"; $changed = $true }
    }
  }
}

if ($changed) {
  if ($DryRun) { Write-Host 'DryRun: changes were detected but not written.'; exit 0 }
  $json | ConvertTo-Json -Depth 10 | Set-Content .\data.json -Force
  Write-Host 'data.json updated; backup saved as data.json.svgbak'
} else {
  Write-Host 'No .svg references found in the targeted fields. No changes made.'
}
