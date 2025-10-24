#!/usr/bin/env node

const [, , apiUrl, countArg] = process.argv;

if (!apiUrl || !countArg) {
  console.error("Uso: node seed-data.js <API_URL> <Quantidade>");
  process.exit(1);
}

const total = Number.parseInt(countArg, 10);

if (Number.isNaN(total) || total <= 0) {
  console.error("Quantidade inválida. Informe um número inteiro positivo.");
  process.exit(1);
}

const baseProducts = [
  { nome: "Notebook Dell", descricao: "Intel i7, 16GB RAM", preco: 3500.0, estoque: 50 },
  { nome: "Mouse Logitech", descricao: "Wireless, ergonômico", preco: 120.0, estoque: 200 },
  { nome: "Teclado Mecânico", descricao: "RGB, switches blue", preco: 450.0, estoque: 80 },
  { nome: "Monitor LG 24pol", descricao: "Full HD, IPS", preco: 850.0, estoque: 45 },
  { nome: "Webcam Logitech", descricao: "1080p, microfone", preco: 380.0, estoque: 120 },
  { nome: "Headset Gamer", descricao: "7.1 surround", preco: 290.0, estoque: 95 },
  { nome: "SSD Samsung 1TB", descricao: "NVMe, 3500MB/s", preco: 650.0, estoque: 150 },
  { nome: "Memória RAM 16GB", descricao: "DDR4 3200MHz", preco: 320.0, estoque: 180 },
  { nome: "Placa de Vídeo RTX", descricao: "8GB GDDR6", preco: 2800.0, estoque: 25 },
  { nome: "Fonte 650W", descricao: "80 Plus Gold", preco: 480.0, estoque: 60 }
];

const randomBetween = (minPercent, maxPercent) => {
  return (Math.random() * (maxPercent - minPercent) + minPercent) / 100;
};

const chooseRandom = () => {
  return baseProducts[Math.floor(Math.random() * baseProducts.length)];
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const postProduct = async (payload) => {
  const response = await fetch(`${apiUrl.replace(/\/$/, "")}/produtos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status} ${response.statusText} ${text}`.trim());
  }
};

(async () => {
  console.log(`🌱 Populando ${total} produtos na API: ${apiUrl}`);

  let success = 0;
  let errors = 0;

  for (let i = 1; i <= total; i += 1) {
    const base = chooseRandom();
    const priceFactor = randomBetween(90, 120);
    const stockFactor = randomBetween(80, 140);

    const product = {
      nome: `${base.nome} #${i}`,
      descricao: base.descricao,
      preco: Math.round(base.preco * priceFactor * 100) / 100,
      estoque: Math.max(0, Math.round(base.estoque * stockFactor))
    };

    try {
      await postProduct(product);
      success += 1;
      if (i % 10 === 0) {
        console.log(`  ✓ ${i} produtos criados...`);
      }
    } catch (error) {
      errors += 1;
      console.error(`  ✗ Erro ao criar produto ${i}: ${error.message}`);
      // Evita bombardeio caso haja erro contínuo
      await delay(200);
    }
  }

  console.log("\n✅ Concluído!", `Sucesso: ${success} | Erros: ${errors}`);
})();
