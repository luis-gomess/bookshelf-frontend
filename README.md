# Estante Pessoal

Frontend academico para organizar livros pessoais, autores, categorias e emprestimos.

## Tecnologias

- HTML
- CSS
- JavaScript puro com ES Modules
- Tabler local

O projeto nao usa React, Angular, Vue, TypeScript, Vite, Webpack, JSX, TSX ou build.

## Como executar

Abra o arquivo `index.html` no navegador.

Como o projeto usa ES Modules, alguns navegadores podem exigir um servidor estatico local. Se isso acontecer, use qualquer servidor simples apontando para a raiz do projeto. O projeto final nao depende de `node_modules` nem de `npm install`.

## Arquitetura

Fluxo esperado:

```text
HTML -> Controller -> Service -> httpClient -> Backend Java futuramente
```

Enquanto o backend Java com Spring Boot e MySQL nao existe, os services executam CRUD em memoria com dados mockados. Ao recarregar a pagina, os dados voltam ao estado inicial.

## Tabler

O Tabler esta salvo localmente em:

- `src/vendor/tabler/dist/css/tabler.min.css`
- `src/vendor/tabler/dist/js/tabler.min.js`

Nenhuma pagina depende de CDN.
