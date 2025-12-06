<#
import_jpgs_flexible.ps1

Flexible importer for JPGs into the journal project.

Usage examples:
  .\import_jpgs_flexible.ps1 -SourceFolder 'C:\Users\sasan\Pictures\journal-jpgs'
  .\import_jpgs_flexible.ps1 -SourceFolder '.\assets\source-jpgs' -CoverPattern 'cover-YYYY-MM.jpg' -Verbose

Parameters:
  -SourceFolder  : (required) path to folder containing JPGs
  -CoverPattern  : filename pattern for covers; supports tokens YYYY-MM or {month}
  -DefaultPattern: filename pattern for default stills; supports token YYYY-MM (e.g. '{month}-default.jpg')
  -DayPattern    : pattern for day stills (e.g. 'YYYY-MM-DD.jpg')
  -PersonalPattern: pattern for personal/day photos (e.g. 'YYYY-MM-DD-personal.jpg')
  -DryRun        : switch; if present, do not copy or modify files, just report actions

Notes:
  - Token usage: Use placeholders YYYY, MM, DD in patterns, or provide literal glob-style patterns.
  - The script will update data.json to reference JPGs that are copied.
  - A backup of data.json is made to data.json.importbak before modifications.
#>
param(
  [Parameter(Mandatory=$true)]
  [string]$SourceFolder,
  [string]$CoverPattern = 'YYYY-MM.jpg',
  [string]$DefaultPattern = 'YYYY-MM-default.jpg',
  [string]$DayPattern = 'YYYY-MM-DD.jpg',
  [string]$PersonalPattern = 'YYYY-MM-DD-personal.jpg',
  [switch]$DryRun
)

function Expand-TokenPattern($pattern, $token) {
  # If the pattern contains YYYY or MM etc, return as-is for matching with -like by replacing tokens with ?
  $g = $pattern -replace 'YYYY','????' -replace 'MM','??' -replace 'DD','??'
  return $g
}

Set-Location -Path (Split-Path -Parent $MyInvocation.MyCommand.Definition)

if (-not (Test-Path $SourceFolder)) {
  Write-Error "Source folder '$SourceFolder' does not exist."
  exit 1
}

$coversDest = Join-Path -Path . -ChildPath 'assets\covers'
$stillsDest = Join-Path -Path . -ChildPath 'assets\stills'
New-Item -ItemType Directory -Path $coversDest -Force | Out-Null
New-Item -ItemType Directory -Path $stillsDest -Force | Out-Null

# Backup data.json
Copy-Item .\data.json .\data.json.importbak -Force
$json = Get-Content .\data.json -Raw | ConvertFrom-Json

# Helper: copy matching files by converting token pattern to wildcard
$coverGlob = Expand-TokenPattern $CoverPattern
$defaultGlob = Expand-TokenPattern $DefaultPattern
$dayGlob = Expand-TokenPattern $DayPattern
$personalGlob = Expand-TokenPattern $PersonalPattern

# Copy cover-like files
Get-ChildItem -Path $SourceFolder -Filter '*.jpg' -File | Where-Object { $_.Name -like $coverGlob } | ForEach-Object {
  $dest = Join-Path $coversDest $_.Name
  if ($DryRun) { Write-Host "[DRY] Would copy cover: $($_.FullName) -> $dest" } else { Copy-Item -Path $_.FullName -Destination $dest -Force; Write-Host "Copied cover: $($_.Name)" }
}

# Copy default stills
Get-ChildItem -Path $SourceFolder -Filter '*.jpg' -File | Where-Object { $_.Name -like $defaultGlob } | ForEach-Object {
  $dest = Join-Path $stillsDest $_.Name
  if ($DryRun) { Write-Host "[DRY] Would copy default still: $($_.FullName) -> $dest" } else { Copy-Item -Path $_.FullName -Destination $dest -Force; Write-Host "Copied default still: $($_.Name)" }
}

# Copy day stills
Get-ChildItem -Path $SourceFolder -Filter '*.jpg' -File | Where-Object { $_.Name -like $dayGlob -and $_.Name -notlike $defaultGlob } | ForEach-Object {
  $dest = Join-Path $stillsDest $_.Name
  if ($DryRun) { Write-Host "[DRY] Would copy day still: $($_.FullName) -> $dest" } else { Copy-Item -Path $_.FullName -Destination $dest -Force; Write-Host "Copied day still: $($_.Name)" }
}

# Copy personal photos
Get-ChildItem -Path $SourceFolder -Filter '*.jpg' -File | Where-Object { $_.Name -like $personalGlob } | ForEach-Object {
  $dest = Join-Path $stillsDest $_.Name
  if ($DryRun) { Write-Host "[DRY] Would copy personal photo: $($_.FullName) -> $dest" } else { Copy-Item -Path $_.FullName -Destination $dest -Force; Write-Host "Copied personal photo: $($_.Name)" }
}

# Update data.json references where matching files now exist
foreach ($m in $json.months) {
  $coverJpg = Join-Path -Path $coversDest -ChildPath ($m.id + '.jpg')
  if (Test-Path $coverJpg) { $m.coverImage = ('assets/covers/' + $m.id + '.jpg') }

  $stillJpg = Join-Path -Path $stillsDest -ChildPath ($m.id + '-default.jpg')
  if (Test-Path $stillJpg) { $m.defaultStillImage = ('assets/stills/' + $m.id + '-default.jpg') }

  if ($m.days) {
    foreach ($d in $m.days) {
      $dayJpg = Join-Path -Path $stillsDest -ChildPath ($d.date + '.jpg')
      if (Test-Path $dayJpg) { $d.stillImage = ('assets/stills/' + $d.date + '.jpg') }

      $personalJpg = Join-Path -Path $stillsDest -ChildPath ($d.date + '-personal.jpg')
      if (Test-Path $personalJpg) { $d.personalPhoto = ('assets/stills/' + $d.date + '-personal.jpg') }
    }
  }
}

if (-not $DryRun) {
  $json | ConvertTo-Json -Depth 10 | Set-Content .\data.json -Force
  Write-Host "data.json updated (backup at data.json.importbak)."
} else {
  Write-Host "Dry run complete — no files copied or changed."
}
