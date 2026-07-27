# AlgoLab

Biblioteca visual de algoritmos de ordenação e pesquisa: escolhe um
algoritmo, corre-o num array aleatório de barras e vê a animação passo a
passo, ao lado do código real e da complexidade (Big-O).

## Ideia

- 5 algoritmos de ordenação (Bubble, Selection, Insertion, Merge, Quick) e
  2 de pesquisa (Linear, Binary), todos implementações reais que devolvem
  uma sequência de passos — não é uma animação pré-cozinhada.
- Painel com o código de cada algoritmo e a complexidade melhor/média/pior
  caso e espaço.
- A pesquisa binária ordena o array primeiro (é um pré-requisito real do
  algoritmo) e mostra visualmente o intervalo a ser eliminado a cada passo.
- 100% client-side, sem backend, sem dependências além de React.

## Executar

```bash
npm install
npm run dev
```

Abrir <http://127.0.0.1:5180>.

## Validar

```bash
npm run check
npm run build
```

## Ideias para evoluir

- Permitir input manual do array (colar números).
- Mostrar contador de comparações/trocas em tempo real.
- Adicionar Heap Sort e Counting Sort.
- Tradução da interface para PT/EN/DE, como as outras apps do portfólio.

O README deve ser atualizado quando o conceito, as funcionalidades ou as
prioridades mudarem.

## Nota técnica — Google Analytics

O Analytics só é carregado depois de o utilizador aceitar os cookies. A função
`gtag` deve enviar o objeto nativo `arguments` para `dataLayer`:

```js
function gtag() {
  dataLayer.push(arguments)
}
```

Não substituir por `dataLayer.push(args)` com um rest parameter (`...args`):
apesar de o script da Google carregar, o comando `config` e o `page_view` podem
não ser processados.
