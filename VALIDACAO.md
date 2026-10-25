# Correção mobile · v3.5.1

Terreno dividido em 12 texturas de 1024×1024, sem upload da textura única de 4096×3072. Canvas temporário liberado após a geração. Neblina pós-processada desativada em dispositivos touch/telas estreitas; clima leve preservado. HUD reduzido e opções concentradas no menu Sua jornada.

Playwright Chromium: blocos opacos com dimensões verificadas, menus, multitouch e layout em 390×844, 360×640 e 844×390; capturas inspecionadas; sem erros JavaScript. Não houve teste em iPhone físico: a correção aborda as causas prováveis observadas, mas requer confirmação no aparelho afetado.

# Validação mobile · v3.5

- Compilação TypeScript e versão autocontida concluídas.
- Playwright/Chromium: 51 verificações de multitouch real via CDP, movimento diagonal + fogo, liberação independente, cancelamento, impulso, menus, ausência de scroll e controles dentro da viewport (390×844, 360×640, 844×390, 667×375), desktop sem controles de toque. Sem erros JavaScript no fluxo.
- Validação adicional: Inferno e Ciclone por botão, pausa durante fogo pressionado e versão autocontida.
- Capturas de tela inspecionadas em retrato, paisagem e menus.
- Emulação no navegador; desempenho e comportamento em aparelhos físicos/iOS não foram medidos.

# Validação — viewport e fullscreen 3.4

- TypeScript, Vite e HTML autocontido compilados sem erros. Permanece o aviso de tamanho do pacote pelo áudio incorporado.
- `viewport.cjs`: 12 verificações aprovadas. Canvas com tamanho da viewport e origem zero; ausência de bordas e rolagem da página; menu, partida, habilidades e seleção de dificuldade; movimento e fogo; redimensionamento a 1440×900, 390×844 e 844×390; entrada/saída real de fullscreen e estado acessível do botão; nenhuma exceção JavaScript.
- `viewport-standalone.cjs`: arquivo final testado por HTTP. Canvas ajustado, entrada/saída de fullscreen, mensagem para recusa simulada da API e retorno ao jogo salvo aprovados.
- Capturas de menu, jogo, HUD móvel e dificuldade abertas e inspecionadas.
- Corrigida durante a validação uma inscrição prematura em eventos de cena: o ajuste inicial agora acontece quando a cena está pronta.
- Testado no Chromium. A disponibilidade da tela cheia depende das permissões e do suporte do navegador; em caso de recusa, permanece a ocupação integral da janela. Painéis longos podem rolar internamente, sem rolagem da página.

---

# Validação — dificuldades 3.3

- TypeScript, Vite e HTML autocontido compilados sem erros; permanece o aviso conhecido do áudio incorporado.
- `difficulty-flow.cjs`: 16 verificações aprovadas. Fácil recomendado, 59 versus 143 inimigos, atributos e XP, menor percepção, perseguição curta, ausência de investida de Rattata, rajadas de chefe reduzidas/lentas, seleção apenas no início, cancelamento seguro, persistência, reforço moderado com Lugia e compatibilidade de saves antigos como Difícil.
- `difficulty-campaign.cjs`: 20 verificações aprovadas nos quatro capítulos com Fácil, incluindo caminhos acessíveis, marcos, guardiões, refúgios, viagem rápida, conclusão, derrota, retorno e salvamento. Usa teletransporte e dano direto aos chefes para verificar a progressão, não constitui campanha manual de balanceamento.
- `difficulty-standalone.cjs`: arquivo final testado por HTTP, selecionando Fácil, salvando, recarregando, continuando sem mudar o modo e iniciando outra partida no Difícil. Nenhuma exceção JavaScript.
- Capturas da escolha em computador e celular abertas e inspecionadas. Testes realizados em Chromium.
- Os testes antigos que assumem início imediato sem escolha ou população acima de 120 precisam selecionar Difícil explicitamente. Os testes desta rodada refletem o novo fluxo.

---

# Validação — diagonais 3.2.1

`fire-eight-directions.cjs`: oito direções verificadas com teclado real no Chromium, conferindo ângulo, dano ao adversário e preservação da mira após soltar teclas com intervalo de 40 ms. Também verificadas setas combinadas e mudança deliberada para direção reta. Nenhuma exceção JavaScript. Captura do fogo diagonal aberta e inspecionada. TypeScript, build Vite e HTML autocontido gerados sem erros; permanece o aviso conhecido sobre tamanho do pacote.

---

# Validação — Lugia 3.2

- TypeScript, Vite e HTML autocontido compilados sem erros. Permanece o aviso de tamanho devido à trilha incorporada.
- `lugia-flow.cjs`: 18 verificações aprovadas. Sprite de 24 quadros; encontro após o primeiro selo; recrutamento por E; modificadores de dificuldade em inimigos existentes e novos chefes; proteção contra aplicação duplicada; dano da rajada; oclusão por obstáculos; acompanhamento da trilha; pausa; salvar/continuar; derrota; viagem rápida; indicador móvel; novo jogo sem parceiro e com dificuldade inicial.
- O teste de ataque usa um alvo isolado para distinguir o dano do parceiro da seleção de outros inimigos próximos. O teste de acompanhamento inclui tempo curto de recuperação da formação após o movimento.
- `lugia-standalone.cjs`: versão final por HTTP com partida preparada no encontro. Recrutamento, salvamento, deslocamento, resumo do menu e restauração após recarregar aprovados, sem exceções JavaScript.
- Capturas de encontro, combate da dupla e interface móvel abertas e inspecionadas. Posição inicial e de retorno ajustada para afastar Lugia de Ho-Oh, quando houver terreno livre com linha de visão.
- A checagem de dificuldade verifica os atributos numericamente e sua persistência. Não equivale a uma campanha manual completa de balanceamento. Testado no Chromium, sem validação física de dispositivos móveis.

---

# Validação — menu e interface 3.1

- Build TypeScript, Vite e HTML autocontido concluídos sem erros. Mantém o aviso de tamanho pelo áudio incorporado.
- `menu-ui.cjs`: 17 verificações aprovadas. Sem salvamento, início do zero; com salvamento, resumo e continuação; confirmação antes de substituir a partida; cancelar por botão/Escape; foco e Tab no diálogo; reinício confirmado; fontes e alvos de toque móveis; ausência de exceções.
- `menu-standalone.cjs`: versão final por HTTP testada com início, compra de habilidade, retorno ao menu, recarregamento do navegador, continuação preservando habilidade, lança-chamas e cancelamento de novo jogo. Sem exceções JavaScript.
- Capturas inspecionadas em 1440 px e 390 px: menu, HUD, habilidades e mapa. Verificado que as opções principais têm área de toque de pelo menos 44 px. Fontes funcionais de 13–16 px e auxiliares de 11–12 px; rótulos do mapa ampliados.
- Verificação funcional feita em Chromium. Não é uma auditoria completa WCAG nem um teste em aparelhos móveis físicos.

---

# Validação — A Grande Jornada 3.0

## Rodada atual

- TypeScript, Vite e HTML autocontido compilados sem erros. O aviso de tamanho continua esperado pelo áudio orquestral incorporado.
- `journey-flow.cjs`: 20 verificações aprovadas, incluindo os quatro capítulos, oito marcos, guardiões, descanso, viagem rápida, derrota, retorno ao último refúgio, salvamento e interface móvel.
- Busca em grade de 32 pixels, com raio do jogador de 20 pixels, alcançou 7.450 células. Todos os 18 lugares, quatro altares, oito marcos, cinco refúgios e 21 plumas estão conectados ao início. Nenhum encontro inicial estava dentro de obstáculos ou água.
- `journey-migration.cjs`: quatro verificações aprovadas. Partida 2.x migra para o santuário preservando nível, habilidades, pontos, selos e recompensas. Capítulos concluídos recebem seus marcos automaticamente. Um segundo carregamento conserva os dados migrados.
- Colisão costeira verificada com movimento de 690 pixels/s a 15, 30 e 120 passos/s.
- `journey-combat.cjs`: lança-chamas causa dano, as duas faixas orquestrais carregam e efeitos suaves reduzem a neblina, sem exceções.
- Capturas de mapa, versão móvel, ruínas e travessias abertas e inspecionadas.
- `journey-standalone.cjs`: arquivo final testado por HTTP e com a rede desligada após carregar. Início, habilidade, compra, lança-chamas, mapa, pausa e menu funcionaram; ambas as faixas de 87,273 segundos foram decodificadas. Sem ferramentas internas de desenvolvimento ou exceções JavaScript.
- Amostra de desempenho no navegador local: aproximadamente 59 FPS.

Os testes dos capítulos usam teletransporte e dano direto nos guardiões para verificar o fluxo. Não equivalem a uma campanha manual completa nem validam o equilíbrio de longo prazo. Os testes antigos com coordenadas fixas correspondem ao mapa 2.x; use os arquivos `journey-*.cjs` para a edição 3.0. Testado no Chromium, não em aparelhos móveis físicos ou outros navegadores.

---

# Validação — música e clima 2.2

## Rodada atual

- Build TypeScript, Vite e HTML autocontido concluídos. Vite informa um aviso de tamanho do pacote: as duas gravações orquestrais estão incorporadas para permitir uso offline.
- 73 verificações aprovadas: aventura (33), interface móvel e encontros (17), atmosfera/colisões/câmera (11), orquestra/clima/IA (12).
- Versão final `jogar.html` testada por HTTP e, após carregar, com a rede desligada: início, habilidades, compra, lança-chamas, mapa, pausa e retorno ao menu. As duas faixas estéreo foram decodificadas com 87,273 segundos cada. Nenhuma ferramenta de diagnóstico do desenvolvimento incluída na versão final.
- Testes de áudio: duas fontes sincronizadas, sinal real na saída da música, entrada/saída gradual da camada de combate e silêncio na pausa. Pico observado no bus da música: 0,267. Renderização das camadas somadas limitada a 0,82 antes da codificação. Não foi medida loudness integrada, nem realizada audição humana em caixas e fones.
- Testes da IA: aquisição de alvo, preparação e deslocamento da investida, abandono da perseguição no santuário, movimento lateral e disparo de Squirtle.
- Capturas do lago com chuva/neblina, vale com cinzas e interface de 390 px abertas e inspecionadas.
- Amostra local de desempenho: 59 FPS. Não representa garantia para outros aparelhos.
- Nenhuma exceção JavaScript nos fluxos finais. Erros temporários do servidor durante a geração do arquivo de áudio foram resolvidos antes dos testes finais.
- Conservados o formato de salvamento, os pontos de missão, as colisões e os requisitos das habilidades.

As limitações de navegador e de preparação determinística da rodada anterior continuam válidas. O efeito de neblina requer WebGL. O novo equilíbrio não foi avaliado por uma campanha manual completa.

---

# Validação — edição Atmosfera 2.1

## Resultados

- `npm run build:standalone`: TypeScript, build Vite e HTML autocontido gerados sem erros.
- `tests/adventure-flow.cjs`: 33 verificações aprovadas.
- `tests/adventure-mobile.cjs`: 17 verificações aprovadas.
- `tests/adventure-effects.cjs`: 4 verificações aprovadas.
- `tests/atmosphere-flow.cjs`: 11 verificações aprovadas.
- Total: **65 verificações de desenvolvimento**.
- Versão autocontida também verificada por HTTP, sem ferramentas internas de diagnóstico.
- Nenhuma exceção JavaScript nos fluxos finais.
- Amostra local durante jogo: **60 FPS**. Não é uma garantia para qualquer aparelho.

## Cobertura

Sprites reais animados; santuário seguro; ausência de ondas; encontros locais; aproximação e abandono de perseguição; posicionamentos fora de obstáculos; movimento; câmera; jato contínuo com vários alvos e alcance limitado; oclusão por obstáculos; aquecimento e resfriamento; XP e níveis; pontos e pré-requisitos; três ramos e 12 habilidades; alcance adicional; dano e recarga de Inferno; desaceleração de Ciclone; queimadura após interromper o fogo; dano do impulso; cura por eliminação; vida máxima; redução de dano; renascimento único e recarga; coleta de plumas; mapa; quatro altares e guardiões; exigência dos três primeiros selos; conclusão e exploração posterior; derrota e retorno sem perder progressão; salvamento e retomada; pausa; áudio; interface de 390 px; controles móveis; mira pelo mouse.

Foram inspecionadas capturas da tela inicial, combate com lança-chamas, árvore, mapa e versões móveis dos painéis.

## Limites

Os testes usam Chromium e preparações determinísticas no modo de desenvolvimento: XP acelerado, teletransporte para verificar pontos do mapa e redução da vida de chefes para percorrer a missão. Não equivalem a uma campanha manual completa nem validam equilíbrio de longo prazo. O conteúdo está funcional, mas dificuldade e valores das habilidades podem receber ajustes após uso real.

Não foram testados Safari, Firefox ou hardware móvel físico. A abertura por `file://` não é permitida pelo navegador automatizado; o HTML autocontido foi validado por HTTP. A persistência depende de `localStorage` disponível na origem em que o jogo é aberto.


## Validação adicional da atmosfera

Shader renderizado no WebGL sem exceções; copas animadas; caminhos até todos os quatro altares e oito plumas verificados por busca em grade; deslocamento contra obstáculos com passos equivalentes a 15/30/120 Hz; câmera com diferença de aproximadamente 1,8 pixel entre simulações a 30/120 Hz; opção de efeitos suaves; reflexos e ondulações; resposta visual do impulso; layout móvel.

O áudio foi verificado por roteamento e amostragem do sinal (pico de aproximadamente 0,022 na amostra testada). Isso não equivale a uma medição integrada de loudness nem a uma audição humana em fones e caixas. Esses ajustes perceptivos podem ser refinados após jogar. A alternativa Canvas sem o shader não foi exercitada nesta rodada.
