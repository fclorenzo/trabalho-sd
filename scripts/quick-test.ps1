param(
    [Parameter(Mandatory = $true)]
    [ValidateSet("postgres", "mongo")]
    [string]$Api,

    [Parameter(Mandatory = $true)]
    [ValidateSet("balanced", "read-heavy", "write-heavy")]
    [string]$Scenario,

    [string]$JMeterPath = "jmeter",
    [int]$Users,
    [int]$Duration,
    [string]$ApiHost,
    [int]$Port,
    [string]$ResultsDirectory
)

$ErrorActionPreference = "Stop"

$apiConfig = @{
    postgres = @{ Host = "localhost"; Port = 3000; Label = "Postgres" }
    mongo    = @{ Host = "localhost"; Port = 3001; Label = "Mongo" }
}

$scenarioConfig = @{
    balanced     = @{ Jmx = "jmeter/test-plan-balanced.jmx";     Users = 100; Duration = 300 }
    "read-heavy"  = @{ Jmx = "jmeter/test-plan-read-heavy.jmx";  Users = 150; Duration = 180 }
    "write-heavy" = @{ Jmx = "jmeter/test-plan-write-heavy.jmx"; Users = 50;  Duration = 180 }
}

try {
    $commandInfo = Get-Command -Name $JMeterPath
    $resolvedJMeter = $commandInfo.Source
    if (-not $resolvedJMeter) {
        $resolvedJMeter = $commandInfo.Path
    }
    if (-not $resolvedJMeter) {
        $resolvedJMeter = $commandInfo.Definition
    }
}
catch {
    Write-Error "JMeter não encontrado. Informe o caminho com -JMeterPath ou adicione ao PATH."
    exit 1
}

if (-not $resolvedJMeter) {
    Write-Error "Não foi possível resolver o executável do JMeter a partir de '$JMeterPath'."
    exit 1
}

Write-Host "🛠️ Usando JMeter em: $resolvedJMeter"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).ProviderPath
$scenarioSettings = $scenarioConfig[$Scenario]

$hostToUse = if ($ApiHost) { $ApiHost } else { $apiConfig[$Api].Host }
$portToUse = if ($Port) { $Port } else { $apiConfig[$Api].Port }
$usersToUse = if ($Users) { $Users } else { $scenarioSettings.Users }
$durationToUse = if ($Duration) { $Duration } else { $scenarioSettings.Duration }

$jmxPath = Join-Path $repoRoot $scenarioSettings.Jmx
if (-not (Test-Path $jmxPath)) {
    Write-Error "Plano de teste não encontrado: $jmxPath"
    exit 1
}

if ($ResultsDirectory) {
    if (-not (Test-Path $ResultsDirectory)) {
        $null = New-Item -ItemType Directory -Path $ResultsDirectory -Force
    }
    $resultsRoot = (Resolve-Path $ResultsDirectory).ProviderPath
}
else {
    $defaultRoot = Join-Path $repoRoot "results"
    if (-not (Test-Path $defaultRoot)) {
        $null = New-Item -ItemType Directory -Path $defaultRoot -Force
    }

    $quickTestRoot = Join-Path $defaultRoot "quick-test"
    if (-not (Test-Path $quickTestRoot)) {
        $null = New-Item -ItemType Directory -Path $quickTestRoot -Force
    }

    $resultsRoot = (Resolve-Path $quickTestRoot).ProviderPath
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$runFolder = Join-Path $resultsRoot "$($Api)-$($Scenario)-$timestamp"
$reportFolder = Join-Path $runFolder "report"
$resultFile = Join-Path $runFolder "$($Api)-$($Scenario).jtl"

$null = New-Item -ItemType Directory -Path $runFolder -Force
$null = New-Item -ItemType Directory -Path $reportFolder -Force

$healthUrl = "http://$hostToUse`:$portToUse/produtos"
Write-Host "🔍 Verificando API $($apiConfig[$Api].Label) em $healthUrl ..."
try {
    Invoke-RestMethod -Uri $healthUrl -Method Get -TimeoutSec 10 | Out-Null
    Write-Host "✅ API respondendo" -ForegroundColor Green
}
catch {
    Write-Warning "Não foi possível confirmar a API ($healthUrl). Prosseguindo assim mesmo..."
}

Write-Host "🚀 Executando teste '$Scenario' contra API '$Api'"
Write-Host "   • Usuários: $usersToUse"
Write-Host "   • Duração: $durationToUse segundos"
Write-Host "   • Resultados: $runFolder"

$arguments = @(
    "-n",
    "-t", $jmxPath,
    "-Jhost=$hostToUse",
    "-Jport=$portToUse",
    "-Jusers=$usersToUse",
    "-Jduration=$durationToUse",
    "-l", $resultFile,
    "-e",
    "-o", $reportFolder
)

& $resolvedJMeter @arguments
$jmeterExit = $LASTEXITCODE

if ($jmeterExit -ne 0) {
    Write-Error "JMeter retornou código $jmeterExit. Verifique os logs em $resultFile."
    exit $jmeterExit
}

Write-Host "🎉 Teste concluído com sucesso!" -ForegroundColor Green
Write-Host "📂 Relatório HTML: $reportFolder"
Write-Host "🗒️ Resultados brutos: $resultFile"
