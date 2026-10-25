# Controles para celular · v3.5

A interface se adapta a telas em pé e deitadas. Arraste o direcional esquerdo para voar em oito direções; segure FOGO com o outro dedo para atacar enquanto se move. O fogo acompanha a última direção do voo. Impulso fica ao lado do fogo; habilidades, mapa, áudio e pausa ficam nas laterais. Inferno e Ciclone ficam disponíveis após aprendê-los. Menus longos rolam dentro do painel, sem rolar a página. Controles são liberados ao pausar, trocar de orientação ou interromper um toque. Teclado e mouse continuam disponíveis no computador.

# Ho-Oh Fire Battle — Aventura

Uma aventura 2D de exploração com Ho-Oh, feita em **TypeScript + Phaser 3 + Vite**, sem backend. O objetivo é percorrer quatro capítulos, despertar oito marcos ancestrais e recuperar os selos de Raiz, Maré, Brasa e Céu.

## Jogar

Abra `jogar.html` para usar a edição autocontida. Para desenvolvimento, com Node.js 22.12+:

```sh
npm install
npm run dev
```

Use o endereço exibido no terminal. Para gerar a distribuição:

```sh
npm run build
npm run preview
```

`npm run build:standalone` também atualiza `jogar.html`. O conteúdo de `dist/` pode ser publicado em qualquer hospedagem estática. Sprites, fontes e áudio não dependem de URLs externas durante o jogo. O salvamento usa `localStorage`; para persistência previsível, prefira servir o jogo por HTTP em vez de `file://`.

## Janela inteira e tela cheia — versão 3.4

O jogo ocupa **100% da viewport**, sem rolagem da página, margens, moldura, cabeçalho ou rodapé externos. O canvas se redimensiona junto da janela e os controles aparecem sobre o cenário. Em celulares, a câmera ajusta a escala para manter uma área de jogo útil.

Use **⛶**, no canto superior direito, para entrar na tela cheia nativa. O mesmo botão permite sair; Escape também sai conforme o comportamento do navegador. O botão está disponível no menu e durante a aventura. Se o navegador bloquear a API de tela cheia, uma mensagem informa isso e o jogo continua preenchendo a janela.

Menus longos (como habilidades e diário) têm rolagem interna para manter todo o conteúdo acessível em telas pequenas; a página permanece sem rolagem. Salvamento e dificuldade não são alterados pelo redimensionamento ou pela tela cheia.

## Dificuldade — versão 3.3

**Iniciar novo jogo** abre a escolha entre Fácil e Difícil, com Fácil pré-selecionado. A dificuldade é definida antes de começar, salva com a aventura e exibida na pausa e no resumo do menu. Continuar nunca muda o modo. Partidas antigas sem esse campo mantêm o desafio anterior como Difícil; para jogar no Fácil, inicie uma nova aventura.

| Ajuste | Fácil | Difícil |
| --- | --- | --- |
| Encontros iniciais | 59 | 143 |
| Vida dos adversários | 65% | 100% |
| Dano dos adversários | 50%, arredondado | 100% |
| Velocidade de movimento | 72% | 100% |
| Percepção | 165 px | 245–335 px |
| Abandono da perseguição comum | 330 px | 580 px |
| Intervalo entre disparos | 1,8× | Original |
| Velocidade dos projéteis | 70% | Original |
| Projéteis por rajada dos chefes | 3; Venusaur 6 | 5; Venusaur 12 |
| XP por inimigo | 1,8× | Original |

No Fácil, Rattata não dá investidas, Zubat não tenta cercar, Pidgey não faz zigue-zague e os inimigos de distância não se deslocam lateralmente ao atacar. Chefes investem com menor velocidade e maior intervalo. Missões, marcos, mapas e recompensas de exploração são os mesmos.

Lugia continua aumentando a dificuldade, de forma mais suave no Fácil: +20% de vida, +8% de dano e +3% de velocidade, com intervalo de disparo reduzido em 5%. No Difícil, os reforços anteriores permanecem. Os bônus não se acumulam ao recarregar.

## Mira em oito direções — versão 3.2.1

Combine **W+A, W+D, S+A ou S+D** (ou duas setas) e segure **Espaço** para disparar na diagonal. O jato mantém a direção quando as teclas são soltas com pequena diferença de tempo. Manter apenas uma direção por mais de 120 ms muda novamente a mira para essa direção. A origem do fogo acompanha o vetor de mira; controle pelo mouse permanece livre.

## Duas lendas — versão 3.2

Após recuperar o selo da Raiz, siga o objetivo até **Lugia, na Travessia das Marés**. Aproxime-se e pressione **E** para convidá-lo. O encontro também está disponível em partidas antigas que já tenham o primeiro selo.

- Lugia usa sprite animado local de Black & White. Segue a trilha de Ho-Oh, respeita obstáculos e acompanha viagens rápidas e retornos após derrota. Se ficar muito distante ou preso, reaparece junto do jogador com efeito visual.
- Usa rajadas de vento automaticamente contra adversários em combate, com alcance de 350 pixels e linha de visão. Não provoca inimigos distantes nem ataca através de obstáculos. Suas eliminações concedem XP e pontuação a Ho-Oh.
- É um apoio ofensivo: não possui uma barra de vida própria nem absorve ataques destinados ao jogador.
- Ao recrutá-lo, todos os adversários vivos restantes ganham **45% de vida, 18% de dano e 8% de velocidade**. Chefes recebem **50% de vida, 15% de dano e 8% de velocidade**. O intervalo entre ataques à distância diminui 15%. A proporção de vida restante é mantida ao aplicar o reforço.
- O reforço vale também para os próximos chefes e não se acumula ao carregar ou recrutar novamente. Novos jogos restauram o estado sem parceiro e a dificuldade inicial.
- Parceria salva com o progresso; indicador na partida, no mapa e no resumo do menu.

## Menu e leitura — versão 3.1

- Menu principal dedicado com **Continuar aventura** e **Iniciar novo jogo**. Continuar aparece quando há uma partida salva, acompanhado de nível, selos, plumas e tempo de jornada.
- Novo jogo apresenta a escolha de dificuldade mesmo quando não existe salvamento. Havendo uma aventura salva, um diálogo permite manter a partida ou confirmar a substituição. Escape cancela; o foco fica restrito ao diálogo.
- Pela pausa, **Voltar à tela inicial** salva a aventura e abre o menu. Continuar também funciona após fechar e abrir o navegador na mesma origem.
- Tipografia revisada: textos funcionais entre 13 e 16 px, informações auxiliares entre 11 e 12 px, maior contraste e botões de toque com pelo menos 44 px nas ações principais.
- HUD móvel em duas linhas, painéis com rolagem e respeito à preferência de movimento reduzido.

## A Grande Jornada — versão 3.0

O antigo terreno retangular deu lugar a uma rota de **18 lugares**, com costas irregulares, clareiras, travessias de madeira, ilhas, formações de basalto e ruínas. O mundo mede **8192 × 6144 pixels**, com uma rota principal sinuosa e quatro desvios opcionais.

- **Quatro capítulos:** Bosque → Marés → Cinzas → Céu. Ative os dois marcos de cada região com **E**, depois desafie seu guardião. O altar de cada capítulo exige o selo anterior.
- **Cinco refúgios:** aproximar-se descobre o refúgio e atualiza o ponto de retorno. **E** restaura vida e recarrega Renascer. Após uma derrota, o progresso continua no último refúgio.
- **Viagem rápida:** estando em um refúgio, abra **M** e escolha outro já descoberto. Não permite escapar instantaneamente de um combate no meio da trilha.
- **21 plumas**, quatro desvios e mais de 120 encontros iniciais distribuídos pelas regiões. Inimigos eliminados permanecem eliminados na partida salva.
- Mapa redesenhado com a forma da rota, marcos, objetivo atual, refúgios e estado de cada capítulo.
- **Partidas antigas:** nível, habilidades, XP, selos e recompensas são preservados. A posição migra para o novo Santuário da Aurora; os marcos dos capítulos já concluídos ficam ativados.

A trilha orquestral, neblina, chuva, cinzas e lança-chamas continuam presentes. A exploração não usa ondas nem geração infinita de inimigos.

## Música, clima e adversários — versão 2.2

- Trilha original de 87 segundos: cordas, violoncelos, trompas, flautas, harpa, pizzicato, bumbo e tímpanos. Usa gravações acústicas da biblioteca VSCO 2 CE (CC0), não osciladores para simular os instrumentos da música.
- Duas camadas sincronizadas: exploração e combate. A percussão e os metais entram no próximo pulso e ganham intensidade nos chefes; pausa e silêncio preservam a sincronização.
- Neblina em camadas móveis, com menor densidade perto de Ho-Oh; chuva e respingos no lago, cinzas no vale, nuvens densas nas ruínas. As transições entre regiões são graduais, sem flashes.
- Patrulhas mais amplas, percepção a até 335 pixels, investida telegrafada de Rattata e deslocamento lateral dos adversários de ataque à distância. Ataques mais frequentes; santuário e limites de perseguição mantidos.
- Efeitos suaves reduzem a neblina e removem chuva/cinzas animadas. O efeito de neblina usa WebGL.

A trilha está incorporada no jogo para funcionar offline; o HTML agora tem aproximadamente 5 MB. `scripts/render-orchestra.py` documenta a composição e pode regenerar os stems com NumPy, macOS `afconvert` e as amostras listadas em `scripts/orchestra-sources.json`. Não é preciso executar esse script para jogar ou compilar. Licença e fontes em `CREDITS.md`.

## Cenário e movimento

- Copas independentes com folhas, casca, raízes, variação por bioma e balanço ao vento. A vegetação fica parcialmente transparente quando encobre Ho-Oh.
- Pedras facetadas com musgo, caminhos com pedriscos e transições de cor suaves entre as regiões.
- Lagos com profundidade visual, margens orgânicas, juncos, reflexos e ondulações animadas.
- Partículas de folhas e poeira, feixes de luz sutis e um shader leve de temperatura de cor e vinheta. O cenário básico também funciona sem WebGL; o shader é opcional nesse caso.
- Ho-Oh inclina nas curvas, varia a batida das asas e a sombra, tem brilho de fogo e deixa penas no movimento/impulso.
- Câmera com zona morta, antecipação da direção, suavização dependente do tempo e reposicionamento imediato em grandes deslocamentos.
- Mixagem com buses de música, efeitos e ambiente; camadas orquestrais de combate, vento/água e redução temporária da música em efeitos importantes.
- A opção **Efeitos suaves**, na pausa, reduz partículas, balanço e antecipação da câmera. Respeita a preferência de movimento reduzido do sistema e pode ser alterada pelo jogador.

A edição 3.0 redesenhou o mapa e expandiu os objetivos. Os atributos e a progressão anterior são preservados pela migração do salvamento. A arte continua em pixel art; o aprimoramento busca mais detalhe e profundidade, não fotorrealismo.

## O que mudou

- **Sprites reais animados:** Ho-Oh, Caterpie, Rattata, Pidgey, Zubat, Bulbasaur, Squirtle, Venusaur, Blastoise, Charizard e Dragonite usam imagens de Black & White via PokéAPI, armazenadas localmente. Veja `CREDITS.md` para origem e direitos.
- **Exploração no lugar de ondas:** mapa 8192×6144, quatro capítulos, 18 lugares, 21 plumas, oito marcos e cinco refúgios. Inimigos fixos patrulham a vizinhança, perseguem quando provocados ou quando você se aproxima, e retornam à sua região se você se afastar. Não há geração infinita ao redor do jogador.
- **Lança-chamas:** jato contínuo de curto alcance, com camadas turbulentas, brilho e partículas, dano em cone e bloqueio por obstáculos. Aquece após uso prolongado e esfria quando interrompido. Movimentação e ataque podem ocorrer juntos.
- **XP e habilidades:** experiência por combate, descobertas e plumas. Um ponto inicial, um por nível e um por guardião. Até nível 15. Há 12 habilidades em três ramos, com ranks e pré-requisitos. As escolhas são permanentes nesta aventura; iniciar uma nova reinicia a distribuição.
- **Aventura salva:** nível, XP, habilidades, posição, HP, inimigos derrotados, plumas, regiões descobertas e selos. Salvamento automático a cada 5 segundos, nas recompensas, ao pausar e ao descansar.

## Controles

| Controle | Ação |
| --- | --- |
| WASD / setas | Voar |
| Espaço (segurar) | Lança-chamas na última direção do movimento |
| Clique esquerdo (segurar) | Mirar com o mouse e usar lança-chamas |
| Shift | Impulso com invulnerabilidade breve |
| E | Interagir com altar / descansar no santuário |
| K | Árvore de habilidades |
| M | Mapa e diário |
| Q | Inferno sagrado, após aprender |
| R | Ciclone, após aprender |
| P / Esc | Pausar / fechar painel |

Botões equivalentes aparecem em telas estreitas. O jogo pausa ao perder foco. Música e efeitos iniciam após interação e podem ser silenciados.

## Sua jornada

O Santuário da Aurora é seguro. Siga a estrada pelas lanternas ao norte, rumo ao **Bosque Esmeralda**. Explore, enfrente Pokémon e distribua seus pontos ative os dois marcos com **E** e desafie Venusaur no altar.

Depois, visite o **Lago das Marés** (Blastoise) e o **Vale das Cinzas** (Charizard). Os três selos liberam Dragonite nas **Ruínas do Céu**. Os níveis mostrados são recomendações; a exploração permanece livre.

Reunir os quatro selos conclui a história e permite continuar explorando. Inimigos derrotados não reaparecem na mesma aventura. A derrota devolve você ao último refúgio preservando a progressão; guardiões ainda não vencidos precisam ser desafiados novamente.

## Árvore de habilidades

- **Chamas:** Brasa viva → Língua de fogo → Combustão → Inferno sagrado.
- **Voo:** Vento favorável → Asas velozes → Ciclone → Mergulho cortante.
- **Renascimento:** Coração da fênix → Calor vital → Plumagem solar → Renascer.

Cada compra custa 1 ponto. Os efeitos, ranks máximos, nível necessário e habilidades anteriores são exibidos no painel. Renascer evita uma derrota por descanso no santuário. Inferno e Ciclone possuem recargas independentes.

## Arquitetura

- `scene.ts`: estados, IA local, câmera e integração da aventura.
- `adventure.ts`: regiões, objetivos, plumas e formato de salvamento.
- `progression.ts`: XP, níveis, regras e efeitos da árvore de habilidades.
- `flame.ts`: renderização do jato e seu cone de alcance/oclusão.
- `combat.ts`: projéteis dos inimigos e partículas.
- `actors.ts`: atributos, animações e estados dos personagens.
- `world.ts`: cenário determinístico, estradas e colisões com índice espacial.
- `assets.ts` / `sprite-data.json`: spritesheets locais e texturas dos efeitos.
- `main.ts` / `style.css`: HUD, árvore, mapa e controles.
- `scenery.ts`: texturas de árvores e penas, com geração determinística.
- `atmosphere.ts`: ambiente animado, transparência de copas e shader WebGL.
- `camera.ts`: enquadramento e suavização de voo.
- `audio.ts`: música original e efeitos Web Audio, incluindo o som contínuo do fogo.

Os testes de navegador usam uma referência de diagnóstico exposta **apenas em desenvolvimento** para preparar situações de forma determinística. Ela não existe no build de produção.

## Validação no navegador

Com Playwright CLI instalado, servidor em execução e uma sessão de teste exclusiva:

```sh
playwright-cli -s=hooh-test open http://127.0.0.1:5173
playwright-cli -s=hooh-test run-code --filename=tests/adventure-flow.cjs
playwright-cli -s=hooh-test run-code --filename=tests/adventure-mobile.cjs
playwright-cli -s=hooh-test run-code --filename=tests/adventure-effects.cjs
playwright-cli -s=hooh-test run-code --filename=tests/atmosphere-flow.cjs
playwright-cli -s=hooh-test close
```

Esses fluxos criam novas aventuras na sessão de teste, preparam encontros e aceleram a progressão. Não use uma sessão de navegador que contenha um salvamento que queira preservar. Consulte `VALIDACAO.md` para resultados e limites.
