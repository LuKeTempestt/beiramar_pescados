import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Script } from "node:vm";

const raiz = resolve(fileURLToPath(new URL("..", import.meta.url)));
const ignorados = new Set([".git", "node_modules"]);
const falhas = [];

function listarArquivos(diretorio) {
  const arquivos = [];
  for (const item of readdirSync(diretorio)) {
    if (ignorados.has(item)) continue;
    const caminho = resolve(diretorio, item);
    if (statSync(caminho).isDirectory()) {
      arquivos.push(...listarArquivos(caminho));
    } else {
      arquivos.push(caminho);
    }
  }
  return arquivos;
}

const arquivos = listarArquivos(raiz);
const html = arquivos.filter((arquivo) => extname(arquivo) === ".html");
const javascript = arquivos.filter((arquivo) => extname(arquivo) === ".js");

for (const arquivo of javascript) {
  try {
    new Script(readFileSync(arquivo, "utf8"), {
      filename: relative(raiz, arquivo),
    });
  } catch (erro) {
    falhas.push(`${relative(raiz, arquivo)}: JavaScript inválido\n${erro.message}`);
  }
}

const regexRecurso = /(?:href|src)=["']([^"']+)["']/g;
for (const arquivo of html) {
  const conteudo = readFileSync(arquivo, "utf8");
  if (!/<title>[^<]+<\/title>/i.test(conteudo)) {
    falhas.push(`${relative(raiz, arquivo)}: título ausente`);
  }

  for (const correspondencia of conteudo.matchAll(regexRecurso)) {
    const referencia = correspondencia[1].trim();
    if (
      referencia === "" ||
      referencia.startsWith("#") ||
      referencia.startsWith("data:") ||
      referencia.startsWith("javascript:") ||
      referencia.startsWith("mailto:") ||
      /^https?:\/\//i.test(referencia)
    ) {
      continue;
    }

    const caminhoLimpo = decodeURIComponent(referencia.split(/[?#]/)[0]);
    const destino = resolve(dirname(arquivo), caminhoLimpo);
    if (!existsSync(destino)) {
      falhas.push(
        `${relative(raiz, arquivo)}: recurso ausente ${referencia}`,
      );
    }
  }
}

if (falhas.length > 0) {
  console.error("Validação reprovada:");
  falhas.forEach((falha) => console.error(`- ${falha}`));
  process.exit(1);
}

console.log(
  `Validação aprovada: ${html.length} arquivos HTML e ${javascript.length} arquivos JavaScript.`,
);
