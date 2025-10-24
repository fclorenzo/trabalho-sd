# Script para popular dados iniciais nas APIs
# Usage: .\seed-data.ps1 -ApiUrl "http://localhost:3000" -Count 100

param(
    [string]$ApiUrl = "http://localhost:3000",
    [int]$Count = 100
)

Write-Host "🌱 Populando $Count produtos na API: $ApiUrl" -ForegroundColor Green

$produtos = @(
    @{nome="Notebook Dell"; descricao="Intel i7, 16GB RAM"; preco=3500.00; estoque=50},
    @{nome="Mouse Logitech"; descricao="Wireless, ergonômico"; preco=120.00; estoque=200},
    @{nome="Teclado Mecânico"; descricao="RGB, switches blue"; preco=450.00; estoque=80},
    @{nome="Monitor LG 24pol"; descricao="Full HD, IPS"; preco=850.00; estoque=45},
    @{nome="Webcam Logitech"; descricao="1080p, microfone"; preco=380.00; estoque=120},
    @{nome="Headset Gamer"; descricao="7.1 surround"; preco=290.00; estoque=95},
    @{nome="SSD Samsung 1TB"; descricao="NVMe, 3500MB/s"; preco=650.00; estoque=150},
    @{nome="Memória RAM 16GB"; descricao="DDR4 3200MHz"; preco=320.00; estoque=180},
    @{nome="Placa de Vídeo RTX"; descricao="8GB GDDR6"; preco=2800.00; estoque=25},
    @{nome="Fonte 650W"; descricao="80 Plus Gold"; preco=480.00; estoque=60}
)

$success = 0
$errors = 0

for ($i = 1; $i -le $Count; $i++) {
    # Seleciona produto base aleatório
    $base = $produtos | Get-Random
    
    # Gerar variações aleatórias
    $randomFactor = (Get-Random -Minimum 90 -Maximum 120) / 100.0
    $stockFactor = (Get-Random -Minimum 80 -Maximum 140) / 100.0
    
    # Varia um pouco os valores
    $produto = @{
        nome = "$($base.nome) #$i"
        descricao = $base.descricao
        preco = [math]::Round([double]$base.preco * $randomFactor, 2)
        estoque = [int]([int]$base.estoque * $stockFactor)
    }
    
    try {
        $response = Invoke-RestMethod -Method Post -Uri "$ApiUrl/produtos" `
            -ContentType "application/json" `
            -Body ($produto | ConvertTo-Json) `
            -ErrorAction Stop
        $success++
        
        if ($i % 10 -eq 0) {
            Write-Host "  ✓ $i produtos criados..." -ForegroundColor Cyan
        }
    }
    catch {
        $errors++
        Write-Host "  ✗ Erro ao criar produto $i : $_" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "✅ Concluído! Sucesso: $success | Erros: $errors" -ForegroundColor Green
