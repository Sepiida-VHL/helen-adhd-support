<#
One-off Firestore -> Supabase migration script.
- Exports Firestore using gcloud.
- Converts Firestore export (entities.json) to plain row JSON per table using a Node transformer.
- Inserts rows to Supabase via REST API with upsert support.

Prerequisites:
- gcloud CLI authenticated to the correct project with Firestore Admin permissions.
- Node.js available.
- PowerShell 7+.
- jq optional (we use Node for portability).
- Supabase project URL and service role key (NOT the anon key!). Store securely in env.

Environment variables required (set in shell before running):
- $env:GCLOUD_PROJECT = your-gcp-project-id
- $env:SUPABASE_URL = your-supabase-url (e.g., https://abc.supabase.co)
- $env:SUPABASE_SERVICE_KEY = your-supabase-service-role-key (keep secret)
- $env:SUPABASE_SCHEMA = schema name (default: public)
- $env:FIRESTORE_NAMESPACE = (optional) namespace if used; default is '(default)'

Usage (manual, do not run in CI):
  pwsh -File scripts/migrate-firestore-to-supabase.ps1 -ExportDir "./tmp/firestore-export" -Bucket "gs://your-bucket/path" -TableMapPath "./scripts/table-map.json"

-TableMapPath points to a JSON file mapping Firestore collections to Supabase tables and field transforms. Example created alongside this script.
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$ExportDir,
  [Parameter(Mandatory=$true)][string]$Bucket,
  [Parameter(Mandatory=$true)][string]$TableMapPath
)

$ErrorActionPreference = 'Stop'

function Assert-Env($name) {
  if (-not $env:$name -or "$($env:$name)" -eq '') {
    throw "Environment variable $name is required."
  }
}

# Validate env
Assert-Env 'GCLOUD_PROJECT'
Assert-Env 'SUPABASE_URL'
Assert-Env 'SUPABASE_SERVICE_KEY'
if (-not $env:SUPABASE_SCHEMA) { $env:SUPABASE_SCHEMA = 'public' }
if (-not $env:FIRESTORE_NAMESPACE) { $env:FIRESTORE_NAMESPACE = '(default)' }

# 1) Firestore export
Write-Host "[1/4] Exporting Firestore from project $($env:GCLOUD_PROJECT) to $Bucket ..."
$exportCmd = @(
  'gcloud','firestore','export', $Bucket,
  '--project', $env:GCLOUD_PROJECT
)
$export = & $exportCmd[0] $exportCmd[1] $exportCmd[2] $exportCmd[3] $exportCmd[4] $exportCmd[5]
Write-Host $export

# 2) Copy export locally
Write-Host "[2/4] Copying export to $ExportDir ..."
New-Item -ItemType Directory -Force -Path $ExportDir | Out-Null
# Determine latest export folder from bucket listing
$ls = & gsutil ls $Bucket
$latest = ($ls | Select-String -Pattern '/(\d{4}-\d{2}-\d{2}T\d{6}Z)-\w+/' -AllMatches).Matches | Sort-Object Value | Select-Object -Last 1
if (-not $latest) { throw 'Could not determine latest export folder in bucket.' }
$latestPrefix = $latest.Value
Write-Host "Latest export prefix: $latestPrefix"
& gsutil -m cp -r "$latestPrefix" "$ExportDir/"

# 3) Transform using Node transformer
Write-Host "[3/4] Transforming Firestore entities to table row JSON ..."

# Ensure transformer exists
$transformerPath = Join-Path (Split-Path $PSCommandPath -Parent) 'migrate-transformer.cjs'
if (-not (Test-Path $transformerPath)) { throw "Transformer not found at $transformerPath" }

# Node command to transform into per-table JSON files in $ExportDir/out
& node $transformerPath `
  --input "$ExportDir" `
  --namespace "$($env:FIRESTORE_NAMESPACE)" `
  --tableMap "$TableMapPath" `
  --outDir "$ExportDir/out"

# 4) Insert into Supabase via REST
Write-Host "[4/4] Inserting into Supabase ..."

$tables = Get-Content $TableMapPath | ConvertFrom-Json
$headers = @{ 'apikey' = $env:SUPABASE_SERVICE_KEY; 'Authorization' = "Bearer $($env:SUPABASE_SERVICE_KEY)"; 'Content-Type' = 'application/json' }

foreach ($t in $tables) {
  $table = $t.supabase_table
  $file = Join-Path "$ExportDir/out" ("$table.json")
  if (-not (Test-Path $file)) { Write-Warning "No data file for $table; skipping."; continue }
  $rows = Get-Content $file -Raw
  if ([string]::IsNullOrWhiteSpace($rows)) { Write-Warning "Empty data for $table; skipping."; continue }
  $url = "$($env:SUPABASE_URL)/rest/v1/$table?on_conflict=$($t.on_conflict -join ',')"
  Write-Host "Upserting $(($rows | ConvertFrom-Json).Count) rows into $table ..."
  $resp = Invoke-RestMethod -Method Post -Uri $url -Headers $headers -Body $rows
  Write-Host "Inserted into $table"
}

Write-Host "Migration complete. Review your Supabase tables to verify data."

