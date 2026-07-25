# Barão Barbearia — site de agendamento

Novo projeto, no mesmo padrão do cardápio (`App.tsx` + estilos), mas agora com
**CSS Modules** (`App.module.css`) e um fluxo de **agendamento** em vez de pedido/compra.

## Estrutura do site

1. **Hero** — nome, selo aberto/fechado, botão "Agendar horário" e "Falar no WhatsApp",
   endereço, horário e Instagram.
2. **Valores** — vitrine informativa com os serviços e preços (não é clicável, só mostra).
3. **Agendamento** (stepper de 4 passos): Serviço → Data e Hora → Seus Dados → Revisão.
   No final, gera uma mensagem e abre o WhatsApp do Gustavo já preenchido.
4. **Galeria** — grade com fotos do trabalho (ver observação importante abaixo).
5. **Depoimentos** — carrossel simples, mesmo padrão do projeto anterior.
6. **Rodapé**.

## Informações que já vieram certas das imagens

- **WhatsApp real**: `5581995217970` (já configurado, não é placeholder desta vez).
- **Instagram**: `@barao_barbearia__`.
- **Endereço**: Vila Urucuba, Limoeiro - PE (não veio rua/número, só isso).
- **Barbeiro**: Gustavo José.
- **Preços** (Valores): Cabelo Degradê R$15, Cabelo Social R$12, Barba R$10,
  Cabelo e Barba R$23, Luzes a partir de R$25, Pézinho R$3.

## O que você precisa confirmar/ajustar

1. **Horário de funcionamento — ATENÇÃO**: as imagens que você mandou não informam o
   horário de funcionamento. Coloquei um padrão comum de barbearia — **segunda a sábado,
   das 8h às 20h, fechado aos domingos** — nas constantes `HORA_ABERTURA` e
   `HORA_FECHAMENTO` no topo do `App.tsx`. Confirme com o Gustavo e ajuste esses dois
   números (e os textos "das 8h às 20h" espalhados pelo Hero/Rodapé) se for diferente.
2. **Fotos da Galeria — os links vão expirar**: as 5 fotos que você mandou são links
   diretos do CDN do Instagram (`instagram.fcau4-1.fna.fbcdn.net`). Esses links têm um
   token de expiração (`oe=...`) e o Instagram costuma derrubá-los depois de um tempo —
   quando isso acontecer, as fotos vão sumir do site. O ideal é baixar essas 5 imagens
   (clique direito → salvar imagem, ou print) e salvar na pasta `public/` do seu projeto,
   trocando o `imgLink` de cada item do array `GALERIA` em `App.tsx` pelo nome do arquivo
   local (mesmo padrão do cardápio: `"foto-1.jpg"`, sem barra no início).
3. **Serviços sem foto**: nenhum serviço tem `imgLink` ainda — todos mostram o selo
   dourado com ícone. Se quiser fotos reais de cada corte, preencha o campo `imgLink`
   de cada item no array `SERVICOS`.
4. **Banner**: o Hero e os Depoimentos usam `banner.png` (a arte "Mais que um corte,
   uma experiência" que você mandou). Copie o arquivo da pasta `public/` deste pacote
   para a pasta `public/` do seu projeto Vite.

## Arquivos deste pacote

- `App.tsx` — componente principal.
- `App.module.css` — estilos em CSS Modules (paleta preto + dourado).
- `package.json` — dependências (sem i18n, mesmo padrão do cardápio).
- `index.html` — meta tags atualizadas para a Barão Barbearia.
- `public/banner.png` — a arte de divulgação que você enviou.

Depois de copiar os arquivos (lembrando de ajustar o `import` de `styles` em
`App.tsx` se o nome do arquivo CSS no seu projeto for diferente), rode `npm install`
e `npm run dev` para conferir.