# Jogabilidade: melhorias sugeridas

Propostas para a versão 3.7.0, ordenadas por impacto. Cada item traz o problema observado, a proposta, os arquivos envolvidos e o efeito no save.

## Como este documento foi feito

- Li os módulos de jogo em `src/` (cena, atores, encontros, progressão, dificuldade, Lugia, descobertas, mundo, controles, câmera e áudio).
- Calculei a XP e o dano com os valores reais de `adventure.ts`, `actors.ts`, `progression.ts` e `difficulty.ts`, usando um script temporário fora do repositório.
- **Ninguém jogou para preparar este documento.** Os tempos de luta supõem chamas contínuas sobre o alvo, sem esquiva nem calor. Os números servem para indicar onde olhar. O balanceamento só se confirma com partidas reais (veja [Validação](#validação)).

### O que precisa continuar valendo

Save `hooh-adventure-v2` (versão 2, revisão de mundo 3) com campos novos opcionais e valores padrão. Os modos Fácil e Difícil, os quatro capítulos, Lugia, os controles simultâneos de movimento e ataque, a liberação dos comandos ao perder foco, o terreno em blocos de 1024 × 1024 e nenhum pós-processamento pesado em aparelhos touch.

---

## Prioridades

| # | Proposta | Problema | Esforço | Save |
| --- | --- | --- | --- | --- |
| 1 | Objetivo independente de Lugia | O rastreador fica preso em Lugia se o jogador não o recrutar | Baixo | Nenhum |
| 2 | Recalibrar a XP | O nível máximo chega durante o capítulo 2 | Baixo/médio | Nenhum |
| 3 | Fila de avisos | Avisos de nível são sobrescritos no mesmo quadro | Baixo | Nenhum |
| 4 | Padrões de chefe | O anel não acerta quem fica parado; os capítulos 3 e 4 não trazem padrões novos | Médio | Nenhum |
| 5 | Mira no teclado e no toque | No teclado, o fogo segue o movimento; no toque, não há assistência | Médio | Preferência local |
| 6 | Escolha real com Lugia | No Difícil, Lugia piora a partida, e a decisão é permanente | Médio | 1 campo opcional |
| 7 | Desafios opcionais calibrados | O tempo das Correntes sobra quase 10 vezes; o Ninho usa nível 3 numa região de nível 5 | Baixo | Nenhum |
| 8 | Avisos sonoros e câmera de chefe | A preparação dos ataques não tem som; a câmera ignora a mira e o chefe | Médio | Nenhum |
| 9 | Profundidade: tipos, esquiva perfeita, Cinza Sagrada | O combate se resume a apontar e segurar | Médio | 1 campo opcional |
| 10 | Exploração por habilidade, plumas, pós-jogo | O mundo esvazia e as plumas são só uma lista | Alto | Prefixos em `cleared` |

---

## 1. Objetivo preso em Lugia

**Problema.** `objective()` em `scene.ts` devolve "Encontre Lugia" sempre que `!lugia && guardians.has(0) && beacons.has(2)`. Quem não recruta Lugia passa o resto da partida com o painel e o mini-mapa apontando para a Travessia das Marés, sem ver o próximo marco ou guardião.

**Proposta.**
- Mostrar Lugia como objetivo **secundário**: uma linha extra no painel ou no mapa ("Uma presença aguarda…"). O objetivo principal continua no próximo marco ou guardião.
- Opcional: avisar só uma vez ao acender o Farol dos Juncos e depois deixar o registro no diário do mapa, que já menciona Lugia.

**Arquivos:** `scene.ts` (`objective`) e `main.ts` (painel e mapa).

## 2. Curva de XP e nível recomendado

**Problema.** Do nível 1 ao 15 são 3.920 XP no total (`needed = 55 + 30·nível`). A XP dos inimigos não depende do nível da região, e a exploração sozinha soma 3.165 XP. Resultado no Difícil:

| Capítulo | Nível sugerido no altar | Nível ao chegar ao guardião, com todos os abates* | Nível ao chegar ao guardião, só pela rota principal** |
| --- | --- | --- | --- |
| 1 · Bosque | 1 | 10 | 3 |
| 2 · Lago | 3 | 15 (máximo) | 6 |
| 3 · Vale | 5 | 15 | 8 |
| 4 · Ruínas | 7 | 15 | 9 |

\*Todos os inimigos comuns, 70% das plumas e os segredos.
\*\*Marcos, refúgio, descoberta da região e chefes anteriores, sem inimigos comuns, plumas ou segredos.

No Fácil, o multiplicador de XP ×1,8 compensa os poucos inimigos, e o resultado é parecido: nível 9 ao chegar ao primeiro guardião e nível máximo no capítulo 2. A partir daí:
- XP, nível e pontos param de crescer, e os abates rendem apenas `score`, que não aparece na interface.
- A vida dos chefes não muda. No nível 15, com Brasa viva 3, o lança-chamas causa 160 de dano por segundo. Isso bastaria para derrotar Venusaur em 4,1 s e Dragonite em 9,4 s de contato contínuo.
- O "nível recomendado" do altar perde o sentido.

**Proposta.** Simulei uma alternativa com estes três ajustes:

```ts
// progression.ts
get needed(){return 40+this.level*22+this.level**2*5}
// scene.ts, kill(): XP diminui quando o jogador supera o nível da região
const diff=this.progress.level-xpLevel;                 // xpLevel por região: 2/5/8/11
const factor=Phaser.Math.Clamp(1-.18*(diff-1),.15,1);
this.gainXP(Math.round(e.xp*factor));
```

Nível ao chegar a cada guardião:

| Abates | Atual (Difícil) | Proposta (Difícil) | Proposta (Fácil) |
| --- | --- | --- | --- |
| 0% | 3 / 6 / 8 / 9 | 3 / 5 / 7 / 8 | 3 / 5 / 7 / 8 |
| 50% | 8 / 14 / 15 / 15 | 6 / 9 / 11 / 13 | 6 / 9 / 11 / 12 |
| 100% | 10 / 15 / 15 / 15 | 7 / 10 / 12 / 14 | 6 / 10 / 12 / 13 |

O nível passa a crescer ao longo dos quatro capítulos, quem luta mais continua à frente e o nível 15 fica para segredos e pós-jogo. Os chefes mantêm a XP integral, por não serem refarmáveis. Também proponho:
- Mostrar no altar o nível de referência da região (2/5/8/11) no lugar dos atuais 1/3/5/7.
- Guardar `xpLevel` separado se o nível de vida dos inimigos (`REGIONS[].level`, +9% por nível) não deve mudar.
- Depois da curva, medir a duração real das lutas contra chefes. Se ficarem abaixo de uns 40 s, aumentar a vida dos chefes ou incluir uma terceira fase.

**Save.** `level` e `xp` continuam válidos. Um save antigo mantém o nível; se a XP guardada ultrapassar o novo `needed`, `gain` resolve isso no próximo ganho. Não precisa de migração.

## 3. Avisos sobrescritos

**Problema.** `onNotice` em `main.ts` troca o texto na hora. Em vários pontos, `gainXP` dispara "NÍVEL X" e outro aviso o substitui no mesmo quadro:
- `kill()` do chefe: o nível é coberto por "SELO DA …".
- Pluma, marco e recompensa de descoberta: o nível é coberto pelo aviso do item.
- Refúgio descoberto: o nível cobre "REFÚGIO DESCOBERTO".

**Proposta.** Uma fila curta com prioridades (chefe > nível > item > zona). Avisos do mesmo quadro se juntam ("PLUMA ANCESTRAL · NÍVEL 9 — +1 ponto, K para escolher"). Cada aviso fica uns 2,2 s; avisos de zona repetidos são descartados.

## 4. Padrões dos chefes

**Problemas.**
- **O anel acerta só quem se move.** Em `encounters.ts`, os projéteis saem a 60°–300° do ângulo travado, deixando uma abertura de 120° voltada para onde o jogador estava. Quem fica parado nunca é atingido.
- **Sem novidade no fim.** Venusaur estreia raízes e anel, Blastoise estreia jato e leque. Charizard repete leque e arrancada, e Dragonite repete arrancada e anel. A dificuldade dos capítulos 3 e 4 depende só dos números, e como o nível já está no máximo, esses capítulos acabam mais fáceis.
- **Previsível.** Os padrões alternam numa ordem fixa (`turn++ % length`).

**Propostas, mantendo o alvo travado durante o aviso:**
- **Anel:** deslocar a abertura 90° ou 180° do jogador, para obrigar o movimento. Na fase 2, lançar dois anéis seguidos com aberturas opostas.
- **Escolha por situação:** arrancada quando o jogador está longe, área ou anel quando está perto. Evitar o mesmo padrão três vezes seguidas.
- **Um golpe próprio por chefe na fase 2,** com aviso próprio:

| Chefe | Golpe novo | Leitura |
| --- | --- | --- |
| Venusaur | Esporos: duas zonas lentas que duram 4 s | Círculos verdes |
| Blastoise | Hidro Bomba: jato que gira 90° | Faixa azul com seta de rotação |
| Charizard | Arrancada que deixa um rastro de brasas por 2 s | Linha laranja tracejada |
| Dragonite | Combinação: arrancada seguida de anel no ponto de chegada | Linha seguida de círculo |

- **Ensinar antes do chefe.** Cada capítulo deveria ter um inimigo comum que mostre o padrão novo num lugar seguro. Squirtle e Bulbasaur já cumprem esse papel. Faltam versões do leque no Vale (por exemplo, Pidgey com rajada de vento) e do anel nas Ruínas (por exemplo, Zubat com supersônico).

## 5. Mira e controles

**Problemas.**
- **Teclado:** a direção do fogo só fica travada para mouse e toque (`!pointerFire && !touch.fire`). Com Espaço, o fogo acompanha o movimento, então quem joga só no teclado não consegue recuar atirando num perseguidor.
- **Toque:** sem arrastar, o botão de fogo dispara para a direção atual. Não existe assistência de mira.
- **Direcional:** a direção é arredondada para oito setores a cada movimento, sem histerese. Perto dos limites de 22,5°, ela pode alternar entre direções vizinhas.

**Propostas.**
- **Teclado, opção "dois direcionais":** WASD move e as setas miram e disparam. Outra possibilidade é travar a mira enquanto Espaço estiver pressionado, como no mouse. Ambas ficam no menu Sua jornada, salvas no localStorage, sem tocar no save.
- **Assistência de mira no toque**, ligada por padrão e desligável. Ao tocar sem arrastar, mirar no inimigo em combate mais próximo e visível dentro de ±35° da direção atual. Ao arrastar, corrigir no máximo 8° na direção do alvo.
- **Histerese** de ±8° no direcional para trocar de setor.
- **Gamepad** com a API do Phaser: analógico esquerdo voa, direito mira e dispara, LB impulso, X/Y Inferno e Ciclone, Start pausa. Desconectar ou perder o foco deve liberar todos os comandos, como já acontece no toque.

## 6. Lugia: escolha clara e possível de desfazer

**Problema.** O README diz que os adversários se fortalecem para compensar a ajuda. Na conta, a compensação passa do ponto no Difícil. No nível 7, com Brasa viva 3:

| | Lança-chamas | Lugia* | Vida dos inimigos | Equivalente sem Lugia |
| --- | --- | --- | --- | --- |
| Difícil, inimigos comuns | 122 dps | 46 dps | ×1,45 | 116 dps (−5%) e +18% de dano recebido |
| Difícil, chefes | 122 dps | 46 dps | ×1,5 | 112 dps (−8%) e +15% de dano recebido |
| Fácil | 122 dps | 46 dps | ×1,2 | 140 dps (+15%) e +8% de dano recebido |

\*No melhor caso: um disparo a cada 0,95 s, sempre com linha de visão.

No Difícil, recrutar Lugia deixa a partida mais difícil, a decisão não pode ser desfeita (`scaleForDuo` é aplicado uma única vez) e, até o item 1 ser corrigido, o objetivo empurra para o recrutamento.

**Propostas.**
- **Lugia como opção:** em qualquer refúgio, "Lugia descansa aqui / acompanha você". Os multiplicadores devem ser calculados na hora a partir de `lugiaActive`, em vez de alterar os inimigos. Save: `lugiaActive?: boolean`, cujo padrão é o valor de `lugia`.
- **Ação conjunta:** um botão (F / toque) faz Lugia disparar Aerobomba no alvo da sua mira, com recarga de 10 s. Fogo e Aerobomba no mesmo alvo podem causar um efeito combinado curto. Sem acionar, Lugia passa a priorizar o inimigo que está sob o seu fogo.
- **Compensação justa:** reduzir `duoHp` no Difícil para cerca de 1,25 ou dar uma recompensa própria (segredo exclusivo da dupla na Ilha do Eco, plumas azuis ou um registro no diário).

## 7. Desafios opcionais

- **Correntes da Maré:** os três círculos ficam a cerca de 500 px do baú, uns 2,4 s na velocidade base, e o limite é de 25 s. Proposta: 8–10 s, ou cinco círculos espalhados que exijam o impulso.
- **Ninho de Cinzas:** os inimigos surgem no nível 3 (`spawn(…, 3, …)`) numa região de nível 5, quando o jogador já costuma estar no máximo. Usar o nível da região e trocar um inimigo por uma versão de elite, com mais vida e um padrão a mais.
- **Novo tipo, Braseiros:** acender de três a quatro tochas numa ordem indicada por runas, usando o lança-chamas, a ação principal do jogo, fora do combate. Custo baixo, e o estado pode ficar em `cleared` com o prefixo `discovery-`.

## 8. Clareza do combate: som, câmera e impacto

**Problemas.**
- Só a arrancada toca som quando dispara. A preparação dos ataques não tem som, e os projéteis surgem em silêncio. Isso pesa no celular, onde o aviso pode estar fora da tela.
- A antecipação da câmera usa só o movimento (`mx`, `my`). Durante a mira com mouse ou toque, ou numa luta contra chefe, ela não mostra o que importa.
- O retorno visual se resume ao brilho de 0,05 s e às partículas. Não há números de dano nem pausa de impacto.

**Propostas.**
- **Som de preparação** para cada tipo (raízes: estalo grave; jato e leque: borbulhar; arrancada: inspiração; anel: zumbido crescente), com `StereoPannerNode` conforme a posição do inimigo na tela, no `sfxBus` atual.
- **Câmera:**
  - Ao mirar, antecipar uns 60 px na direção do fogo.
  - Na luta contra chefe, enquadrar um ponto entre o jogador e o chefe (peso 0,3 no chefe), limitado para manter o aviso visível.
  - Indicador na borda da tela para inimigos preparando ataque fora do enquadramento.
- **Impacto:**
  - Pausa de 40–60 ms na troca de fase e na derrota de um chefe.
  - Números de dano agrupados a cada 0,3 s (o fogo é contínuo), usando um conjunto reaproveitado de textos.
  - Tudo desligado em "Efeitos suaves".

## 9. Profundidade do combate

- **Efetividade de tipo com multiplicadores moderados:** fogo ×1,25 contra planta/inseto (Caterpie, Bulbasaur, Venusaur) e ×0,85 contra água, fogo e dragão (Squirtle, Blastoise, Charizard, Dragonite). Exibir "Eficaz!" ou "Resiste". Isso valoriza Mergulho cortante, Ciclone e Lugia, que não causam dano de fogo, e diferencia as lutas. Como é uma mudança grande no equilíbrio, convém validar antes.
- **Esquiva perfeita:** o impulso já protege por 0,18 s. Se ele atravessar um ataque nos últimos 0,15 s da preparação ou encostar num projétil, zerar o calor e reduzir em 1 s a recarga do impulso, com um brilho dourado. Isso premia a leitura dos avisos, que é o centro do combate.
- **Cinza Sagrada** (o item de Ho-Oh nos jogos): duas cargas (uma no Difícil) recarregadas nos refúgios, cada uma recuperando 50% da vida em 1 s (tecla H ou botão de toque). Hoje a cura depende de corações aleatórios (18% de chance, +24) e do aumento de nível, que deixa de existir quando o nível trava. Save: `ash?: number`, com o padrão igual ao máximo.
- **Calor:** hoje são 5,6 s de fogo e 1,9 s de espera. Uma alternativa à esquiva perfeita (não as duas juntas): soltar o fogo entre 85% e 99% de calor resfria na hora. Isso dá alguma decisão ao medidor.
- **Ponto de atenção:** com Mergulho cortante 2 e Asas velozes 2, o impulso causa 140 de dano a cada 1,3 s, cerca de 108 dps teóricos, sendo invulnerável durante o golpe. O lança-chamas causa 122 dps no nível 7. Verificar em partidas reais se essa combinação domina as lutas contra chefes.

## 10. Exploração e conteúdo

**Problemas.**
- Inimigos derrotados nunca voltam (`cleared`), então o mundo esvazia. Depois da vitória, o objetivo passa a ser "Desvios e segredos", mas não há o que enfrentar.
- As 21 plumas aparecem no mini-mapa das regiões descobertas e valem apenas 65 XP cada.
- A árvore de habilidades é uma corrente linear em cada ramo. O jogador recebe 20 pontos (1 inicial, 14 por nível, 4 dos guardiões e 1 da relíquia) para 27 níveis de habilidade, então quase tudo acaba aprendido e a escolha se limita à ordem.
- O clima e as regiões mudam a aparência, mas não a forma de jogar.

**Propostas.**
- **Caminhos opcionais liberados por habilidade,** nunca na rota principal, para não travar a progressão:
  - Inferno queima espinheiros.
  - Ciclone empurra rochas ou dissipa nuvens de cinza.
  - Mergulho cortante quebra cristais.

  Os obstáculos removíveis entram em `cleared` com o prefixo `gate-`, sem mudar o formato do save. Para não alterar a geometria existente, devem ser criados depois dos laços de geração em `world.ts`, sem consumir `rand()`.
- **Recompensas por plumas:**
  - 7 plumas: +1 ponto de habilidade.
  - 14 plumas: +20 de vida máxima.
  - 21 plumas: Asa Arco-Íris, um rastro de penas coloridas ou o golpe Fogo Sagrado.

  Também convém esconder no mapa as plumas fora de alcance e mostrar só a contagem por região.
- **Redistribuição gratuita** no Santuário da Aurora: devolver todos os pontos com `points += soma(ranks)`. Opcionalmente, duas variantes finais exclusivas para Inferno e Ciclone (por exemplo, Inferno em explosão ou em rastro). Ids novos de habilidade começam em 0, o que é compatível com `ranks`.
- **Perigos por região,** usando os avisos que já existem e desenhados com `Graphics` comuns, sem pós-processamento:

| Região | Perigo |
| --- | --- |
| Bosque | Esporos |
| Lago | Correntezas que empurram |
| Vale | Fendas de lava com erupção anunciada |
| Ruínas | Rajadas de vento |

- **Indicador de direção** do objetivo no painel ou na borda da tela. Hoje o painel mostra apenas a distância em linha reta, e as trilhas fazem curvas.
- **Pós-jogo:**
  - Entei, Raikou e Suicune vagando pelas três primeiras regiões (na história, Ho-Oh os reviveu).
  - Revanches nos altares com medalhas por tempo e dano recebido, finalmente usando o `score`.
  - Nova jornada+ que mantém habilidades e fortalece os inimigos.

  Save: `records?`, padrão `{}`; `cycle?`, padrão `0`. Sprites novos devem passar por `scripts/import-sprites.py` e ser registrados em `CREDITS.md`.

## Ajustes menores

- **Texto da derrota:** a tela diz "Retornar ao santuário", mas `respawn()` leva ao último refúgio. Usar o nome do refúgio.
- **Recomeçar o guardião:** ao morrer numa luta contra chefe, mostrar quanto de vida restou ao guardião ("Venusaur ficou com 23%").
- **`score` e `hooh-best-v1`** são calculados e salvos, mas nunca exibidos. Mostrar nas revanches ou remover.
- **Configurações sem efeito:** `shots`, `duoShots`, `e.shot` e `e.special` (×1,7 no Fácil) são atualizados, mas nenhum ataque os lê desde a mudança para `encounters.ts`. Ligar esses valores aos intervalos entre ataques ou removê-los, para que a tabela de `difficulty.ts` reflita o jogo.
- **Dicas de primeira vez,** uma única vez cada: primeiro aviso de ataque, primeira janela verde de vulnerabilidade, primeiro superaquecimento, primeiro ponto de habilidade. Save: `tips?: string[]`, padrão `[]`.
- **Assistências fora do modo de dificuldade,** salvas no localStorage: aviso 30% mais longo, mira assistida e dano recebido −25%. Os modos Fácil e Difícil continuam como estão, e o jogador pode pedir ajuda sem recomeçar.
- **Piscar de invulnerabilidade:** hoje o sprite pisca a cerca de 5,6 Hz. Com "Efeitos suaves", usar transparência fixa.

---

## Fases sugeridas

1. **Ajustes de baixo risco:** objetivo de Lugia, fila de avisos, curva de XP, anel, Correntes e Ninho, texto da derrota e configurações sem efeito. ✅ **Implementado nesta rodada** (ver abaixo).
2. **Combate:** golpes novos dos chefes, inimigos que ensinam os padrões, som de preparação, câmera de chefe, mira no teclado, assistência no toque e histerese do direcional.
3. **Sistemas:** Lugia como opção e ação conjunta, Cinza Sagrada, esquiva perfeita, efetividade de tipo, redistribuição de pontos e Braseiros.
4. **Conteúdo:** caminhos por habilidade, recompensas por plumas, perigos por região, gamepad e pós-jogo.

## Implementado nesta rodada

- **Objetivo independente de Lugia (item 1):** o painel volta a seguir a rota principal; Lugia aparece como linha secundária ("Lugia aguarda na Travessia das Marés") e num aviso único ao completar o selo da Raiz e o Farol dos Juncos.
- **Fila de avisos (item 3):** avisos do mesmo quadro se fundem ("A · B"), uma fila com prioridades (selo e renascer > nível e chefe > itens > zona) mostra cada aviso por 2,4 s.
- **Curva de XP (item 2):** `needed = 40 + 22·nível + 5·nível²`; XP de inimigos comuns cai conforme o jogador supera o nível da região (mínimo de 15%); níveis de região passam a 2/5/8/11, o que também eleva a vida dos inimigos comuns dessas regiões; chefes dão XP integral.
- **Anel dos guardiões (parte do item 4):** a abertura fica ±90° ao lado do jogador e alterna a cada uso; na fase 2, um segundo anel dispara ~0,35 s depois com a abertura no lado oposto; o aviso mostra as duas levas. A escolha por situação e os golpes exclusivos continuam pendentes.
- **Descobertas (item 7):** Correntes da Maré com 9 segundos; Ninho de Cinzas usa o nível da região e inclui um zubat elite.
- **Derrota (ajustes menores):** o botão nomeia o refúgio atual; a tela mostra quanto de vida restou ao guardião.
- **Configurações sem efeito (ajustes menores):** removidos `shots`, `duoShots`, `e.shot`, `e.special`, `e.charge`, `e.chargeX` e `e.chargeY`. Testes antigos que manipulam esses campos (`orchestra-weather`, `difficulty-flow`, `adventure-flow`, `collision-slide`) precisam de adaptação.
- **Efeitos suaves (ajustes menores):** a invulnerabilidade usa transparência fixa em vez do piscar de 5,6 Hz.
- Ficam pendentes os itens 5, 6, 8, 9 e 10, as demais partes do item 4, as assistências e as dicas de primeira vez.

## Compatibilidade do save

| Campo novo | Padrão ao ler um save antigo | Uso |
| --- | --- | --- |
| `lugiaActive?: boolean` | valor de `lugia` | Lugia acompanha ou descansa |
| `ash?: number` | máximo do modo | Cargas da Cinza Sagrada |
| `tips?: string[]` | `[]` | Dicas já mostradas |
| `records?: Record<string, {time:number; hits:number}>` | `{}` | Revanches |
| `cycle?: number` | `0` | Nova jornada+ |
| Prefixos `gate-`, `discovery-` em `cleared` | — | Caminhos e desafios, sem mudar o formato |

Tudo cabe na versão 2 e na revisão de mundo 3. Só uma mudança na geometria já gerada (árvores, rochas, costas) exigiria uma nova revisão e uma migração.

## Validação

- **Automática** (Playwright CLI, sessão própria, padrão de `tests/*.cjs`):
  - curva de XP com `window.battle` no servidor de desenvolvimento;
  - anel acertando quem fica parado;
  - fila de avisos;
  - objetivo sem Lugia;
  - mira no teclado;
  - assistência no toque com multitouch via CDP;
  - liberação dos comandos ao pausar, perder o foco ou desconectar o gamepad.
- **Produção:** testar também o build de produção, que não expõe `window.battle`.
- **Partidas reais:** 3–5 pessoas, nos dois modos, no computador e em celular físico. Por capítulo, anotar o nível ao chegar ao guardião, a duração da luta, os golpes recebidos, as mortes e onde a pessoa se perdeu. Uma sobreposição de métricas só em desenvolvimento (`import.meta.env.DEV`) ajuda, já que não há servidor.
- **Registro:** em `VALIDACAO.md`, separar o que foi verificado por script do que foi avaliado por pessoas e informar quando um teste usou emulação.
