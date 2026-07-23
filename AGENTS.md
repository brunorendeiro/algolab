# AGENTS.md

## Objetivo

Este projeto contém exclusivamente a app AlgoLab, uma biblioteca visual de
algoritmos de ordenação e pesquisa.

## Regras

- Manter a app 100% client-side: sem backend, sem tracking, sem login.
- Os algoritmos em `src/data/algorithms.ts` têm de continuar a devolver
  passos reais gerados pela execução do algoritmo — nunca substituir por
  uma animação hardcoded.
- O código mostrado em `src/data/info.ts` deve refletir fielmente a lógica
  real do algoritmo, não pseudocódigo inventado.
- Não colocar aqui código do portfólio ou de outras aplicações.

## Validação

```bash
npm run check
npm run build
```
