# Jogabilidade · fase 2 (demais itens de jogabilidade.md)

- Chefes: assinatura na fase 2 (Venusaur esporos em zonas, Blastoise Hidro Bomba giratória, Charizard arrancada com rastro, Dragonite arrancada+anel), seleção por situação (arrancada à distância, sem repetir 3×), anel com abertura lateral e segunda leva na fase 2; Pidgey (rajada) e Zubat (supersônico em anel) ensinam os padrões. Som de aviso por padrão com pan estéreo.
- Combate: efetividade de tipo (×1,25 planta/inseto, ×0,85 água/fogo/dragão), esquiva perfeita no impulso (calor zerado, −1 s de recarga), Cinza Sagrada (2 cargas Fácil / 1 Difícil, recarrega em refúgios, tecla H), hit-stop na fase 2 e na derrota de chefe, números de dano agrupados (verde=eficaz, cinza=resiste) desligados em efeitos suaves.
- Lugia: reversível em refúgios (G ou botão no menu), ação conjunta F com recarga de 10 s e combo com o fogo; compensação reequilibrada (×1,28/1,12 Difícil, ×1,15/1,05 Fácil, chefes ×1,35/1,1).
- Controles: mira assistida no toque (opcional), travar mira ao manter Espaço (opcional, padrão ligado), histerese ±8° no direcional, gamepad (analg. esquerdo voa, direito mira/atira, RB/B impulso, X/Y golpes, Start pausa), câmera com antecipação da mira e enquadramento do chefe, seta de objetivo e indicador de telegrafia fora da tela.
- Exploração: plumas com marcos (7=+1 ponto, 14=+20 HP, 21=Asa Arco-Íris), redistribuição gratuita no santuário, três selos de habilidade (Inferno/Ciclone/Mergulho cortante, `gate-*` em cleared), oito perigos regionais telegrafados (esporos/correntes/fendas/rajadas), revanches com medalhas (`records`), Nova jornada+ (`cycle`, inimigos +30%/ciclo, mantém progresso), assistências no localStorage (`hooh-assist`), dicas de primeira vez (`tips`).
- `npm run build` sem erros. Smoke no Chromium (`tests/jogabilidade-fase2.cjs`, dev server na porta 5200, `window.battle`): portões bloqueiam e quebram, 8 perigos, esporos geram zonas, sonic/gust disparam, Cinza cura, Lugia alterna e restaura atributos, revanche grava medalha — aprovados, sem erros JavaScript.
- Não medido/não feito: feras lendárias (precisam de sprites novos e registro em CREDITS.md), variantes exclusivas de Inferno/Ciclone, equilíbrio humano dos golpes de fase 2 e do Mergulho cortante, testes em aparelho físico e gamepad real. main.ts foi reescrito em paralelo (sistema de ícones); as alterações desta rodada foram aplicadas sobre a versão atual.

# Colisão deslizante e emendas de tiles

- `world.move` substitui a rejeição por eixo: desliza pela normal do obstáculo (ou pela normal estimada da costa quando não há obstáculo) e aplica depenetração para liberar atores encravados. O desvio dos inimigos usa leque de ângulos (±43°, ±86°) e recuo, com inversão de lado após 0,7 s sem progresso. Raios de colisão: árvore 21→17, pedra 19→15; `sr` preserva o espaçamento original da geração — posições e hashes de árvores idênticos.
- Tiles de terreno exibidos com 4 px de sobreposição (`setDisplaySize` 2052) para esconder as linhas de 1 px abertas pelo scroll fracionário da câmera em mobile.
- `tests/collision-slide.cjs` passou no Chromium: deslize tangencial, parada frontal sem penetrar, depenetração, inimigo contornando árvore até alcançar o jogador e knockback sem encravar. `tests/terrain-mobile.cjs` passou em Chromium: orçamento de canvas, terra nos 18 destinos, água nas emendas, geometria preservada; captura da emenda em x=4096 inspecionada sem falha visível.
- Limites: a sensação de fluidez foi medida por trajetos programáticos, não por avaliação humana de jogabilidade; o glitch de emenda era intermitente e a captura única não prova ausência em todos os aparelhos — confirmar no iPhone afetado. `tests/adventure-flow.cjs` segue desatualizado (usa coordenadas de um layout de mundo anterior e posiciona o jogador sobre o oceano).

# Jogabilidade · fase 1 (itens simples de jogabilidade.md)

- Objetivo principal deixa de travar em Lugia; a presença vira linha secundária no painel de missão e aviso único ao concluir o selo da Raiz com o Farol dos Juncos aceso.
- Fila de avisos: fusão no mesmo quadro ("A · B"), prioridades (selo/renascer > nível/chefe > itens > zona), 2,4 s por aviso.
- XP: curva `40 + 22·L + 5·L²`; redução por nível da região nos inimigos comuns (`clamp(1 − .18·(nível jogador − nível região − 1), .15, 1)`); níveis de região 2/5/8/11 também elevam a vida dos comuns (+9%/nível); chefes dão XP integral.
- Anel dos guardiões: abertura ±90° ao lado do jogador, alternada por turno; na fase 2 um segundo anel sai ~0,35 s depois com a abertura oposta; o aviso mostra as duas levas (a segunda mais fraca). Parado, o jogador passa a ser atingido.
- Descobertas: Correntes da Maré 25 → 9 s; Ninho de Cinzas usa o nível da região (8) e um zubat elite (vida ×2,4, dano ×1,25, XP ×1,6).
- Derrota: botão nomeia o refúgio atual; ao morrer para um guardião, a tela exibe "… ficou com N% de vida".
- Removidos campos sem efeito: `DIFFICULTY.shots`/`duoShots` e `Enemy.shot`/`special`/`charge`/`chargeX`/`chargeY`. Testes antigos que os manipulam (`orchestra-weather`, `difficulty-flow`, `adventure-flow`, `collision-slide`) precisam de adaptação antes de rodar.
- Efeitos suaves: piscar de invulnerabilidade (~5,6 Hz) vira transparência fixa.
- `npm run build` sem erros. Smoke no Chromium (`tests/jogabilidade-fase1.cjs`, servidor de desenvolvimento na porta 5175 porque a 5173 estava ocupada por outra sessão; usa `window.battle`): curva e redução de XP, objetivo e texto secundário de Lugia, fusão e avanço da fila de avisos, anel cobrindo a posição do jogador, vida restante do guardião e temporizador de 9 s — todos aprovados, sem erros JavaScript. Captura `phase1-smoke.png` inspecionada.
- Não medido: duração real das lutas contra chefes com a nova curva, equilíbrio do duplo anel na fase 2 e legibilidade das telemetrias — dependem de partidas humanas. Emulação não valida aparelho físico.

# Terreno mobile — desenho direto em blocos

- Removido o canvas intermediário de 4096×3072: o terreno agora é pintado diretamente nas 12 texturas de 1024×1024, incluindo caminhos, recortes, gradientes e sombras. Isso elimina a superfície grande ainda presente na correção anterior; não altera o formato dos saves.
- `tests/terrain-mobile.cjs` passou em Chromium e WebKit com emulação de iPhone: orçamento de 1024×1024 também para canvases temporários, terra nos 18 destinos, água em cinco emendas e ausência de pós-processamento mobile. A geração das posições de árvores e obstáculos mantém os mesmos hashes da versão anterior.
- O limite de canvas simulado falha na implementação anterior (`4096×3072`) e permite iniciar com a nova. Essa reprodução controlada testa a dependência removida, não reproduz a falha específica do aparelho do usuário.
- `tests/mobile-clean.cjs` passou no Chromium: menus, controles simultâneos via CDP, cancelamento e layouts de retrato/paisagem, sem exceções. Capturas das quatro regiões, emendas e paisagem inspecionadas. Build TypeScript/Vite e verificação da produção no WebKit, sem `window.battle`.
- Limite: o desaparecimento do chão relatado no iPhone não ocorreu nos navegadores locais antes da alteração. A confirmação definitiva depende de testar a nova versão no aparelho afetado; emulação WebKit no macOS não equivale a Safari em hardware iOS. Permanece o aviso de tamanho do pacote Vite por causa do áudio incorporado.

# Jogabilidade · v3.7

- 33 verificações: multitouch real via CDP com movimento à esquerda/fogo à direita, mira diagonal, cancelamento, aviso antes de atacar/alvo fixo para sete espécies, recuperação, bônus de dano de quatro chefes, alternância de padrões, quatro segredos livres de colisão, recompensas únicas, persistência e timeout/repetição da trilha.
- Dano de área: nenhum dano durante aviso; acerta ao disparar; sair da marca evita dano. Segunda fase reduz tempo de preparação.
- Regressão: 9 verificações de fogo/teclado em oito direções e 20 verificações da campanha (marcos, chefes, quatro capítulos, viagem, respawn e saves). Chefes da regressão são derrotados de forma programática; não equivale a um teste de balanceamento por uma pessoa.
- Capturas mobile e paisagem inspecionadas. Caminho da trilha verificado por busca com colisões e velocidade base. Compilação TypeScript e produção. Não testado em aparelho físico.

# Áudio regional e instalação · v3.6

Compilação TypeScript/produção; quatro trilhas AAC decodificadas no Chromium, com sinal não silencioso, duração de 37–56 segundos, dois stems sincronizados e loops habilitados. Trocas de região, trocas rápidas durante carregamento, aumento da camada de combate e silêncio na pausa passaram. Erro de fullscreen simulado com agente de iPhone: instrução exibida. Manifesto standalone e ícones retornam 200. Sem erros JavaScript no teste.

Picos PCM combinados limitados a 0,78 antes da codificação. Não foi realizada medição LUFS, avaliação auditiva em alto-falantes físicos nem teste de instalação num iPhone real.

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

## Revisão pós-fase-2 (verificação do jogabilidade.md)

Corrigidos na revisão: zonas de perigo/assinaturas morriam no mesmo quadro (`clear()` esvaziava `zones` a cada frame — separado em `clearZones()`); botão de interação desabilitado para revanches (faltava `rematch` na lista); recompensas de plumas 7/14/21 não tinham sido aplicadas (incluídas); Asa Arco-Íris sem efeito visual (tinge as plumas do rastro); Mergulho cortante marcava dano como `fire` (agora `phys`, não recebe multiplicador de tipo); Lugia passou a priorizar o alvo sob o fogo do jogador; plumas no mapa só aparecem na região atual.
Pendente intencional: feras lendárias (precisam de sprites novos + CREDITS.md), variantes finais de Inferno/Ciclone, desafio novo "Braseiros", exibição de `score`/`hooh-best-v1` (medalhas cobrem parcialmente), dica de primeiro ponto de habilidade.

## Rodada de animações de combate (squash & stretch procedural)

Verificado programaticamente via `window.battle` no servidor de desenvolvimento (`playwright-cli run-code`): achatamento progressivo e tremor no windup (scaleX 1.187 / scaleY 1.073 com w=0,32), estiramento na fase ativa do avanço (squash −0,254), recuo e tremor ao receber dano, texto "!" no alerta, hit-stop de 45 ms em abates comuns e 140 ms em chefes, shockwave criado, materialização (alfa 0,05→1 e escala 0,32→1,12), barra de vida com atraso (barHp decai atrás do hp) e recuo do jogador ao disparar (ox 2,36 px com recoil 0,74). `npm run build` sem erros.

Limites: verificações usam estados forçados e leitura de valores, não uma sessão contínua de jogo; fluidez perceptual (anticipação, esquiva) deve ser sentida jogando. Não testado em aparelho físico nem com `prefers-reduced-motion` ativo em cada efeito novo — a rota `reducedEffects` suprime partículas novas (chamas de queimadura) mas mantém squash/escala, que são leitura de jogo.

## Rodada 2 de animações (Ho-Oh + ambiente) e correção de colisão de texturas

- Corrigido bloqueio total de renderização: o novo `scenery-data.json` trazia chaves `fire`/`water`/`water2` que colidiam com as texturas procedurais de `buildAssets` (o loader ocupava `fire`, `createCanvas` retornava `null` e `create()` abortava — mundo vazio). As chaves de cenário agora carregam como `scn-<chave>`; referências futuras a esse pacote devem usar o prefixo.
- Adicionados: inclinação de pitch do Ho-Oh ao voar verticalmente, smear na virada, pós-imagem no impulso, fumaça no superaquecimento, aura avermelhada com vida baixa, dispersão de penas douradas na morte com subida do corpo, fogueiras animadas (`scn-brazier`, 3 quadros) com brasa e fumaça nos acampamentos, fachos de luz nos marcos ativados, brilhos ocasionais nas plumas colecionáveis, pulsação nos corações, pássaros distantes em voo e anéis de corrente de ar sobre lagoas.
- `npm run build` e `tsc` sem erros; console do navegador limpo após a correção.
- Limites: inspeção visual por capturas pontuais e leitura de estado via `window.battle`; efeitos novos de partículas respeitam `reducedEffects` (fumaça, pós-imagem, chamas de queimadura e pássaros suprimidos); pitch/smear são suprimidos na rota de efeitos suaves via `reduced` na rotação. Sem verificação em aparelho físico.

## Música adaptativa: pausa/menu e refúgios

- Nova cadeia `musicBus → lowpass → duckBus` em `audio.ts`. Pausa, painéis, morte, vitória e menu deixaram de silenciar a trilha: ela segue a ~−11 dB, com filtro em 620 Hz e camada de combate zerada (o tom "calmo" é derivado das gravações existentes, sem assets novos). Nos acampamentos (`CAMPS`, raio 190) o modo `rest` mantém o ganho normal, mas fecha o filtro em 2400 Hz e força só a camada de exploração — inclusive se um inimigo estiver em aggro dentro do raio seguro.
- Verificado via `window.battle` no dev server (`playwright-cli run-code`, `tests/calm-music.cjs`): filtro <6000 Hz e intensidade ~0 ao nascer no santuário, inimigo agressivo no refúgio não sobe a camada de combate, filtro reabre ao explorar, pausa deixa a trilha audível e reduzida (ganho ~0,30, filtro <2500 Hz) e retomada restaura ganho/filtro. `tests/orchestra-weather.cjs` e `tests/regional-music.cjs` adaptados e verdes. `npm run build` sem erros.
- Limites: validação programática de ganhos/frequências, sem audição humana; a sensação de "calma" pode pedir ajustes de ganho/frequência após jogar. Menu antes da primeira partida continua em silêncio (o navegador exige gesto do usuário para criar o AudioContext).
