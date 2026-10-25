# Design system: Relicário da Torre do Sino

Referência visual da interface de **Ho-Oh Fire Battle**. Vale para os menus, os painéis, o HUD, os controles de toque e os ícones. Os tokens descritos aqui estão em `src/tokens.css` (CSS) e em `src/palette.ts` (canvas, SVG e Phaser). Os componentes estão em `src/theme.css`.

## 1. Conceito

Ho-Oh vive na Torre do Sino de Ecruteak, a cidade de Johto inspirada em Kyoto. A interface parece **uma caixa de laca preta com acabamento em ouro, guardando um diário de viagem em papel washi**. Essa imagem se combina com a linguagem das telas de Pokémon HeartGold/SoulSilver e Black & White, cujos sprites o jogo usa.

| Material | Onde aparece | Por quê |
| --- | --- | --- |
| **Laca** (tinta escura + filete de ouro) | Tela inicial, HUD, minimapa, controles de toque | É uma moldura discreta: o mundo de pixel art continua sendo o foco. |
| **Papel** (washi creme + contorno de tinta) | Diálogos, pausa, habilidades, mapa, avisos | Lembra a caixa de texto de Pokémon: tudo que "fala" com o jogador fica em papel. |
| **Brasa** (vermelho-vermelhão dos torii) | Ação principal, fogo, perigo | A cor do fogo sagrado e dos portões do santuário. |
| **Ouro** | Lenda, recompensa, seleção, foco | O dourado de Ho-Oh e de HeartGold. |
| **Arco-íris** (7 faixas duras) | Momentos lendários: tela inicial, vitória | Ho-Oh é o Pokémon arco-íris. Use pouco para que continue especial. |

### Princípios

1. **O mundo é o protagonista.** O HUD é escuro e compacto. O papel claro aparece só quando o jogador precisa ler ou decidir.
2. **Pixel honesto.** Sem `border-radius`, sem sombras desfocadas e sem gradientes suaves. Contornos de 1 pixel de arte em tinta, cantos chanfrados, sombras duras e gradientes em faixas.
3. **Pokémon reconhecível, sem cópia.** Ponteiro ▶ de seleção, caixa de texto em papel, etiqueta "HP" com barra verde/amarela/vermelha, cores por tipo nos golpes. Nada de logotipos, fontes ou telas oficiais.
4. **Legibilidade primeiro.** Fonte de texto legível, contraste AA, alvos de toque de 44 px e texto que nunca depende só da cor.
5. **Celular é a plataforma principal.** Cada componente nasce no retrato de 360–430 px e depois se adapta ao paisagem e ao computador (ver [§8](#8-celular)).

### O que evitar

- Glifos Unicode como ícones (`✦ ⌖ ♫ Ⅱ ⛶ ϟ ♨ ≋ ⌂`): mudam de fonte para fonte e não combinam com os sprites.
- Georgia, Trebuchet, Arial e fontes do sistema.
- Verde-musgo com dourado genérico, cantos arredondados, vidro fosco (`backdrop-filter`), brilhos difusos.
- Gradientes contínuos em superfícies. Se precisar de volume, use faixas duras ou dithering.

## 2. Unidade de pixel e grade

- `--px: 2px` é **um pixel de arte** na interface. Contornos, filetes, sombras e deslocamentos usam múltiplos dele.
- O espaçamento segue uma grade de 4 px (`--space-1` … `--space-8`).
- Ícones são desenhados em 16 × 16 e exibidos em **múltiplos inteiros**: 16, 32 ou 48 px. Evite 24 px: o fator 1,5 deforma os pixels em telas de densidade 1×.
- Arte com `image-rendering: pixelated` e SVG com `shape-rendering: crispEdges`.

## 3. Cores

### 3.1 Primitivas

| Família | 50/100 | 200 | 300 | 400 | 500 | 600 | 700+ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **ink** (laca/tinta) | — | — | — | `#9a8290` | `#7a6170` | `#5a4553` | 700 `#3d2d3c` · 800 `#2b1f2c` · 900 `#1e1520` · 950 `#140d14` |
| **paper** (washi) | 50 `#fffaf0` · 100 `#f7eed6` | `#ecdcb8` | `#d9c294` | `#b39a6c` | `#8c7452` | `#6b5640` | — |
| **ember** (brasa) | — | `#ffc09a` | `#ff8a5c` | `#ec5a36` | `#c4362a` | `#9a2526` | 700 `#651a22` |
| **gold** (ouro) | 100 `#fff4c2` | `#ffe07a` | `#f8c440` | `#e0962a` | `#a8661c` | `#8a5012` | — |
| **leaf** (folha) | — | `#c8f0a0` | `#9ee070` | `#4cbc48` | `#2e8a3c` | `#22703a` | 700 `#18502c` |
| **tide** (maré) | — | `#bfe6fb` | `#68b8f0` | `#3d8ad0` | `#2a5ea8` | — | 700 `#1a3a6c` · 900 `#0f2038` |
| **gale** (vento) | — | `#ddd0fb` | `#b8a0f0` | — | `#6a4cb8` | — | 700 `#3c2a74` |

A tinta puxa para o vinho, não para o preto puro. Ela complementa o verde do mundo e combina com o vermelho e o ouro.

### 3.2 Semânticas

| Token | Valor | Uso |
| --- | --- | --- |
| `--surface-lacquer` / `-raised` | ink-900 / ink-800 | Tela inicial, HUD, botões de ícone |
| `--surface-hud` | ink-900 a 94% | Faixas do HUD sobre o mundo |
| `--surface-paper` / `-raised` / `-sunken` | paper-100 / 50 / 200 | Diálogos, cartões, campos |
| `--scrim` | ink-950 a 72% + `--dither` | Fundo atrás de menus |
| `--text-on-dark` / `-muted` / `-accent` | paper-100 / paper-300 / gold-200 | Texto sobre laca |
| `--text-on-paper` / `-muted` / `-accent` | ink-900 / paper-600 / ember-600 | Texto sobre papel |
| `--line-ink` | ink-950 | Contorno de tudo |
| `--line-gold` | gold-400 | Filete da laca |
| `--line-paper` | paper-300 | Filete interno do papel |
| `--action` / `-hover` / `-light` / `-shade` / `-deep` | ember-500 / 400 / 300 / 600 / 700 | Botão principal |
| `--on-action` | paper-50 | Texto sobre a ação |
| `--legend` | gold-300 | Seleção, recompensa, pontos |
| `--focus` | gold-200 na laca, ember-500 no papel | Anel de foco |
| `--hp-high` / `-mid` / `-low` | leaf-400 / gold-300 / ember-400 | Vida acima de 50%, até 50%, abaixo de 30% |
| `--xp` | tide-300 | Experiência |
| `--type-fire` / `-flying` / `-sacred` | ember-400 / gale-300 / gold-300 | Ramos de habilidade e golpes |
| `--region-forest` / `-tide` / `-ash` / `-sky` | leaf / tide / ember / gale | Capítulos, selos e mapa |

### 3.3 Contraste verificado (WCAG 2.1)

| Par | Razão | | Par | Razão |
| --- | --- | --- | --- | --- |
| paper-100 / ink-900 | 15,3 | | ink-900 / paper-100 | 15,3 |
| paper-300 / ink-900 | 10,2 | | paper-600 / paper-100 | 6,0 |
| gold-200 / ink-900 | 13,7 | | ember-600 / paper-50 | 7,6 |
| ink-400 / ink-900 | 5,0 | | gold-600 / paper-100 | 5,6 |
| tide-300 / ink-900 | 8,2 | | leaf-600 / paper-100 | 5,3 |
| paper-50 / ember-500 | 5,2 | | gale-500 / paper-50 | 6,1 |

Texto sobre papel usa apenas ink-600 a ink-900, paper-600, ember-600, gold-600, leaf-600, tide-500 ou gale-500. Os tons 300–400 servem para preenchimento, não para texto.

## 4. Tipografia

Três famílias com papéis fixos, todas sob a SIL Open Font License e incorporadas ao build (subconjunto latino em woff2, ~27 KB no total):

| Papel | Família | Uso | Regras |
| --- | --- | --- | --- |
| **Título** | Pixelify Sans 700 | Logotipo, títulos, botões | A partir de 16 px. Em tamanhos menores o "5" parece um "S", então números pequenos não usam esta fonte. |
| **Texto** | DotGothic16 400 | Parágrafos, descrições, números, mapa | Uma fonte pontilhada japonesa que remete aos RPGs portáteis e a Johto. Fica nítida em 16 px (tamanho nativo); o mínimo é 12 px. |
| **Rótulo** | Silkscreen 400 | Rótulos em caixa-alta, teclas, etiquetas | Sempre em caixa-alta, com espaçamento `--tracking-label`. Mínimo de 10 px; no celular, 12 px. |

| Token | px | Uso típico |
| --- | --- | --- |
| `--text-2xs` | 10 | Tecla, etiqueta "HP" |
| `--text-xs` | 12 | Rótulos, notas |
| `--text-sm` | 14 | Descrições, diário |
| `--text-md` | 16 | Texto padrão, botões secundários |
| `--text-lg` | 20 | Botão principal, subtítulo |
| `--text-xl` | 24 | Título de painel no celular |
| `--text-2xl` | 32 | Título de diálogo |
| `--text-3xl` | 40 | Título grande |

- Entrelinha: `--leading-body` (1,5) para texto, `--leading-tight` (1,15) para títulos.
- Ligaduras desligadas (`font-variant-ligatures: none`): a ligadura "fl" da Pixelify se desfaz em tamanhos pequenos.
- Sombra de texto, só sobre cor forte: `2px 2px 0` em tom escuro. Sem desfoque.
- As fontes são carregadas por `src/fonts.ts` como data URL, para funcionar também no `jogar.html` autocontido.

## 5. Superfícies, molduras e sombras

Toda moldura começa com o **contorno chanfrado**: quatro sombras de 1 pixel de arte, sem preencher os cantos.

```css
--outline: 0 -2px 0 var(--line-ink), 0 2px 0 var(--line-ink),
           -2px 0 0 var(--line-ink), 2px 0 0 var(--line-ink);
```

| Moldura | Receita | Uso |
| --- | --- | --- |
| **Papel** | `--outline` + borda de 2 px paper-50 + filete interno de 2 px paper-300 + `--drop` | Diálogos e painéis |
| **Laca** | `--outline` + filete de 2 px gold-400 + 2 px ink-950 + 2 px gold-600 | Tela inicial |
| **Laca leve** | `--outline` + filete de 2 px ink-600 em cima | HUD e botões de ícone |
| **Placa de brasa** | ember-500 + `--outline` + realce ember-300 em cima | Etiquetas e fitas |

- **Sombra**: `--drop` (3 pixels de arte para baixo, ink-950 a 45%) e `--drop-sm`. Nunca use desfoque.
- **Fundo de menu**: `--scrim` com `--dither` (xadrez de 2 × 2 px). Substitui o `backdrop-filter`, que pesa no celular.
- **Faixa arco-íris**: `--rainbow`, com 4 px de altura, no topo das superfícies lendárias.
- Painéis roláveis usam `outline` com deslocamento negativo para o filete interno, que fica sobre o conteúdo durante a rolagem.

## 6. Iconografia

Os ícones são pixel art própria, definidos como mapas de caracteres em `src/icons.ts`, convertidos em SVG e desenhados também no canvas do mapa.

### Regras de desenho

- Grade de 16 × 16 com até 14 × 14 de preenchimento. **O contorno de tinta é gerado automaticamente** em volta da forma (vizinhança ortogonal), garantindo o mesmo traço em todos.
- Luz vindo de cima à esquerda: realce no alto, à esquerda; sombra embaixo, à direita.
- No máximo três tons além do contorno, todos da paleta (`palette.ts`). Cada caractere do mapa corresponde a uma cor primitiva.
- Silhueta reconhecível em 16 px. Detalhes que só aparecem em 48 px não devem carregar o significado.
- Ícones são decorativos (`aria-hidden`). O botão leva o texto ou o `aria-label`.

### Conjunto

| Grupo | Ícones |
| --- | --- |
| Interface | `pause` `play` `map` `sound` `mute` `fullscreen` `exitFullscreen` `close` `next` `pointer` `check` `lock` `torii` `respawn` `sparkle` `scroll` `note` |
| Jornada | `feather` (Asa Arco-Íris, habilidades) `lugia` `tent` (refúgio) `lantern` (marco) `seal` (guardião) `you` (posição) |
| Selos e capítulos | `leaf` (Raiz) `drop` (Maré) `flame` (Brasa) `wing` (Céu) |
| Habilidades | `embers` `reach` `burn` `inferno` `gust` `wing` `cyclone` `talons` `heart` `warmth` `aegis` `rebirth` |

Para adicionar um ícone: desenhe o mapa em `ICONS`, use só caracteres da paleta e confira na folha de contato (`?icons` no servidor de desenvolvimento) em 16, 32 e 48 px, sobre papel e sobre laca.

## 7. Componentes

### Botões

| Variante | Visual | Uso |
| --- | --- | --- |
| **Principal** | `--action`, Pixelify 20 px em paper-50 com sombra dura, realce em cima e sombra embaixo, `--drop`. Altura de 52 px. | Uma por tela: Continuar, Começar aventura |
| **Secundário** | paper-200, texto ink-900, mesmo relevo em tons de papel. Altura de 48 px. | Novo jogo, Voltar, ferramentas da pausa |
| **Ícone** | Laca leve de 44–48 px com ícone de 32 px | HUD, fechar painel, tela cheia |
| **Ladrilho** | Secundário com ícone de 32 px sobre o rótulo | Ferramentas da pausa, abas |

Estados: **hover/foco** mostram o ponteiro ▶ à esquerda (oscila em 2 passos) e clareiam o fundo; **pressionado** desce 2 px e encurta a sombra; **desabilitado** fica com 45% de opacidade, sem ponteiro. O anel de foco é um `outline` de 2 px em `--focus`, afastado 4 px.

### Componentes de menu

- **Logotipo**: "HO-OH" em letras de pixel com bandas de ouro, contorno de tinta e extrusão de brasa (`logo()` em `icons.ts`). O texto real fica num `span` acessível. Abaixo, a fita de brasa "FIRE BATTLE" em Silkscreen.
- **Disco solar**: o sprite de Ho-Oh voa sobre um disco de brasa com aro de ouro, gerado em pixel art.
- **Cartão de save**: papel embutido na laca, no formato "CONTINUAR" dos jogos portáteis: título em Pixelify e linhas de dados (Dificuldade, Selos, Plumas, Tempo) com rótulo à esquerda e valor à direita, separadas por linha tracejada.
- **Opção de dificuldade**: cartão de papel com ícone de 32 px (folha para Fácil, chama para Difícil), rádio em pixel art e, quando selecionado, filete de ouro.
- **Resumo da jornada**: quatro blocos (Nível, XP, Selos, Segredos), com o número em Pixelify sobre o rótulo em Silkscreen.
- **Cabeçalho de painel**: rótulo em brasa, título em Pixelify e botão de fechar. É fixo no topo (`sticky`) durante a rolagem.
- **Nó de habilidade**: cartão de papel com ladrilho do ícone na cor do ramo, título, pontos como pips (■■□), descrição e requisito com cadeado. Disponível: filete de brasa e ponteiro. Aprendido: filete de ouro.
- **Abas de ramo**: ladrilhos com ícone. A aba ativa se liga ao conteúdo, como uma ficha de arquivo.
- **Diário do mapa**: seções com rótulo em Silkscreen e linhas com ícone de 16 px. Botões de viagem secundários com a barraca.
- **Mapa**: mar em tide-900 com dithering, terra nas cores das regiões, regiões ocultas em tinta, trilhas tracejadas em papel, marcadores feitos dos mesmos ícones da legenda e nomes com contorno de tinta. O canvas usa a densidade de pixels da tela.

### HUD (sobre o mundo)

- Faixa de laca leve com filete de ouro embaixo. Botões de ícone com a mesma moldura.
- Vida: etiqueta "HP" e barra com as três cores de `--hp-*`. Experiência: barra `--xp`.
- Rótulos em Silkscreen; números em DotGothic16.

## 8. Celular

O jogo é jogado principalmente no celular. Estas regras têm prioridade sobre as do computador.

- **Detecção**: `body.touch-layout` (ponteiro grosso, largura ≤ 700 px ou paisagem com altura ≤ 500 px). O paisagem baixo é tratado com `@media (max-height: 500px) and (orientation: landscape)`.
- **Painéis em tela cheia**: Habilidades e Mapa ocupam a tela inteira, como a Mochila e a Pokédex. O cabeçalho com o botão de fechar fica fixo no topo; só o conteúdo rola (`overscroll-behavior: contain`).
- **Ação ao alcance do polegar**: nos diálogos (pausa e nova aventura), os botões principais ficam num rodapé fixo na parte de baixo do cartão.
- **Áreas seguras**: todo overlay soma `env(safe-area-inset-*)` ao espaçamento.
- **Alvos**: no mínimo 44 × 44 px; botão principal com 52 px; espaço de 8 px entre alvos vizinhos.
- **Texto**: no mínimo 14 px para leitura e 12 px para rótulos. Títulos de painel com 24 px.
- **Retrato**: uma coluna. Na tela inicial: logotipo, Ho-Oh, cartão de save resumido e botões empilhados.
- **Paisagem baixa**: duas colunas (tela inicial: marca à esquerda, ações à direita; mapa: canvas à esquerda, diário à direita), sem a arte do herói e com cabeçalhos compactos.
- **Sem hover**: o estado pressionado (desce 2 px) e o filete de seleção substituem o hover. O ponteiro ▶ aparece no foco por teclado e na opção selecionada.
- **Desempenho**: nada de `backdrop-filter`, desfoque ou filtros animados no toque. Animações só com `transform` e `opacity`.
- **Validação**: 360 × 740, 390 × 844, 430 × 932 e 844 × 390, com captura de tela de cada menu.

## 9. Movimento

| Token | Duração | Uso |
| --- | --- | --- |
| `--dur-instant` | 80 ms | Botão pressionado |
| `--dur-fast` | 140 ms | Hover, troca de aba |
| `--dur-base` | 220 ms | Entrada de diálogo (sobe 8 px e aparece) |
| `--dur-slow` | 360 ms | Entrada da tela inicial |

- Movimentos de pixel usam `steps()`: o ponteiro oscila em 2 passos e o selo de pontos pisca em 2 passos.
- Com `prefers-reduced-motion` ou "Efeitos suaves", as animações decorativas param; as mudanças de estado ficam instantâneas.

## 10. Acessibilidade

- Contraste AA em todo texto ([§3.3](#33-contraste-verificado-wcag-21)). Estados não dependem só da cor: o HP mostra números, os nós bloqueados mostram cadeado e texto, a aba ativa muda de forma.
- Foco visível em todos os controles; os diálogos mantêm o foco preso e fecham com Esc.
- Ícones com `aria-hidden="true"`; botões só com ícone têm `aria-label`.
- O logotipo em pixel tem o texto equivalente para leitores de tela.

## 11. Arquitetura

| Arquivo | Papel |
| --- | --- |
| `src/tokens.css` | Tokens: primitivas, semânticas, tipografia, espaço, molduras, movimento, camadas |
| `src/theme.css` | Aparência dos componentes, carregada depois de `style.css` |
| `src/style.css` | Posição e tamanho dos elementos (legado). Novas cores e fontes não entram aqui. |
| `src/palette.ts` | Espelho das primitivas para canvas, SVG e Phaser |
| `src/icons.ts` | Ícones, logotipo, discos e as variáveis CSS `--icon-*` e `--art-*` |
| `src/fonts.ts` | Carregamento das três fontes |

- Cores hexadecimais só existem em `tokens.css` e `palette.ts`. Qualquer cor nova entra primeiro nos dois arquivos e nesta documentação.
- Camadas (`--z-*`): mundo e menu inicial 4, HUD 5, controles de toque 6, painéis 8, diálogo de nova aventura 10, tela cheia 40, aviso de tela cheia 50.

### Pendências conhecidas

- Os textos do mundo (nomes de lugares e XP, criados no Phaser em `scene.ts`, `companion.ts` e `discoveries.ts`) ainda usam a fonte padrão do Phaser. Migrá-los para `WORLD_TEXT` de `palette.ts` quando esses arquivos não estiverem sendo alterados por outra frente.
- `style.css` ainda contém cores antigas sobrescritas por `theme.css`. Elas podem ser removidas aos poucos, sem mudar a disposição.

## 12. Checklist de revisão

- [ ] Usa tokens; nenhum hex fora de `tokens.css`/`palette.ts`.
- [ ] Sem `border-radius`, desfoque, vidro fosco ou gradiente contínuo.
- [ ] Ícones da `icons.ts` em 16/32/48 px; nenhum glifo Unicode como ícone.
- [ ] Título em Pixelify (≥ 16 px), texto em DotGothic16, rótulos em Silkscreen caixa-alta.
- [ ] Contraste AA; foco visível; alvos de 44 px.
- [ ] Retrato e paisagem testados com captura; cabeçalho e ações alcançáveis sem rolar.
- [ ] `prefers-reduced-motion` e "Efeitos suaves" respeitados.
- [ ] Funciona no build de produção e no `jogar.html`.
