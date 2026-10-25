# Ho-Oh Fire Battle

Aventura 2D de Pokémon para navegador, com combate em tempo real, exploração e controles para computador e celular. Desenvolvido com **TypeScript, Phaser 3 e Vite**, sem backend.

**Versão atual:** 3.7.0  
**Jogo:** https://ho-oh-game.netlify.app/  
**Repositório:** https://github.com/LucasMartinelli/ho-oh-game

## Executar localmente

Use Node.js 22.12 ou superior e npm.

```bash
npm install
npm run dev
```

Abra o endereço exibido pelo Vite, normalmente `http://127.0.0.1:5173/`. O servidor pode escolher outra porta se a padrão estiver ocupada.

Para testar num celular na mesma rede:

```bash
npm run dev -- --host 0.0.0.0
```

Abra no celular o endereço de rede exibido pelo Vite. Não use `127.0.0.1` no celular para acessar o computador.

## Compilar e distribuir

```bash
npm run build
npm run preview
```

O build verifica os tipos e gera `dist/`. Para gerar também uma versão HTML autocontida:

```bash
npm run build:standalone
```

Abra `jogar.html` para jogar sem um servidor de aplicação. O build publicado no Netlify abre pela página inicial `/`. A instalação pela Tela de Início é destinada à versão hospedada; não há service worker nem garantia de funcionamento offline da versão hospedada.

O bundle é relativamente grande porque inclui sprites e trilhas locais. O aviso de tamanho do Vite não impede a compilação.

## Como jogar

Explore quatro capítulos, encontre plumas, ative marcos e desafie os guardiões para recuperar os selos. Descubra refúgios para descansar e viajar entre locais conhecidos. Lugia pode se juntar à jornada; os adversários se fortalecem para compensar a ajuda.

Escolha **Fácil** ou **Difícil** ao iniciar uma nova aventura. A dificuldade fica vinculada à partida. O menu permite continuar o progresso salvo ou começar novamente.

### Computador

| Controle | Ação |
| --- | --- |
| WASD ou setas | Voar em oito direções |
| Espaço | Manter o lança-chamas ativo |
| Clique esquerdo segurado | Mirar e lançar fogo na direção do cursor |
| Shift | Impulso |
| E | Interagir |
| Q / R | Inferno / Ciclone, após aprender |
| K | Habilidades |
| M | Mapa e viagem rápida |
| P ou Esc | Pausar/retomar |

### Celular

- Arraste o direcional esquerdo para voar.
- Segure o botão de fogo e arraste para mirar independentemente do movimento.
- O impulso segue o movimento quando o direcional está ativo.
- Golpes aprendidos aparecem perto dos controles de combate.
- Toque em pausa para acessar **Sua jornada**: mapa, habilidades, áudio e tela cheia.
- A interface se adapta a retrato e paisagem. Menus longos rolam dentro do painel.

### Combate e exploração

Squirtle, Bulbasaur e Rattata anunciam seus ataques. A área ou direção fica definida durante o aviso: aproveite para sair do caminho.

Cada chefe alterna dois padrões e entra numa segunda fase abaixo de metade da vida. Depois de atacar, o círculo verde indica recuperação: nesse período ele recebe **35% mais dano**.

| Chefe | Padrões |
| --- | --- |
| Venusaur | Raízes em área e anel de projéteis com abertura |
| Blastoise | Jato e leque de água |
| Charizard | Leque de fogo e arrancada |
| Dragonite | Arrancada e anel de projéteis com abertura |

Há quatro descobertas opcionais: **Baú das Lanternas**, **Correntes da Maré** (três círculos em 25 segundos), **Ninho de Cinzas** (encontro de combate) e **Relíquia do Céu**. As recompensas de experiência e cura são únicas; a relíquia também concede um ponto de habilidade.

## Saves

O progresso é salvo automaticamente no localStorage deste navegador, sob a chave `hooh-adventure-v2`. Não há conta nem sincronização entre dispositivos ou endereços diferentes. Limpar os dados do site remove o progresso. Descobertas concluídas, habilidades, dificuldade e Lugia fazem parte do save.

## Tela cheia no iPhone

A API de tela cheia para páginas pode não estar disponível no navegador do iPhone. Como alternativa:

1. Abra o site no Safari.
2. Toque em **Compartilhar → Adicionar à Tela de Início**.
3. Ative **Abrir como App da Web**, se essa opção aparecer.
4. Abra o jogo pelo ícone criado.

O projeto inclui manifesto e ícones para abrir em modo independente, sem barra de endereço. Isso não equivale a suporte universal à API de tela cheia. No Android e no computador, o botão usa a API nativa quando disponível.

## Música

Quatro composições originais usam instrumentos acústicos amostrados da biblioteca VSCO CC0:

| Região | Característica | Andamento |
| --- | --- | --- |
| Bosque Esmeralda | Flauta e cordas | 88 BPM |
| Lago das Marés | Harpa e melodia suave | 76 BPM |
| Vale das Cinzas | Metais e percussão | 104 BPM |
| Ruínas do Céu | Tema lento e solene | 68 BPM |

As regiões fazem transições de 1,5 segundo e possuem camadas sincronizadas de combate. O áudio começa após interação do jogador. Para regenerar as trilhas, são necessários macOS (`afconvert`), Python com NumPy e as amostras descritas em `scripts/orchestra-sources.json`:

```bash
python scripts/render-regions.py DIRETORIO_DAS_AMOSTRAS
```

## Estrutura

| Local | Responsabilidade |
| --- | --- |
| `src/main.ts`, `src/style.css` | Interface, menus e tela cheia |
| `src/scene.ts` | Integração da partida e saves |
| `src/actors.ts`, `src/encounters.ts` | Personagens e padrões de ataque |
| `src/touch.ts`, `src/flame.ts`, `src/combat.ts` | Controles, fogo e projéteis |
| `src/world.ts`, `src/adventure.ts`, `src/discoveries.ts` | Mapa, colisões, rota e segredos |
| `src/progression.ts`, `src/difficulty.ts`, `src/companion.ts` | Habilidades, dificuldade e Lugia |
| `src/audio.ts`, `src/atmosphere.ts`, `src/camera.ts` | Áudio, clima e câmera |
| `public/` | Sprites, licenças, manifesto e ícones |
| `scripts/` | Geração de recursos e HTML autocontido |
| `tests/` | Scripts de validação para Playwright CLI |

## Validar mudanças

```bash
npm run build
```

Para testes de navegador, use a skill Playwright e uma sessão própria. Exemplo, ajustando a URL à porta do servidor de desenvolvimento:

```bash
playwright-cli -s=hooh-test open http://127.0.0.1:5174/
playwright-cli -s=hooh-test run-code --filename=tests/gameplay-upgrade.cjs
playwright-cli -s=hooh-test close
```

Os scripts são funções executadas pelo CLI, não testes de `npm test`. Alguns scripts históricos contêm URLs ou expectativas de versões anteriores; leia-os antes de usar. Testes que acessam `window.battle` precisam do servidor de desenvolvimento, pois essa referência não existe no build de produção.

Consulte [VALIDACAO.md](VALIDACAO.md) para verificações realizadas e limites. Emulação não substitui testes em aparelhos físicos; avaliações programáticas não garantem o balanceamento de uma partida real.

## Publicar no Netlify

| Campo | Valor |
| --- | --- |
| Branch | `main` |
| Base directory | Vazio |
| Build command | `npm run build` |
| Publish directory | `dist` |
| Functions directory | Vazio |

Não há variáveis de ambiente obrigatórias. O repositório conectado pode disparar um novo deploy após cada push; acompanhe a conclusão no painel do Netlify.

## Créditos e contribuição

Projeto de fã não oficial. Pokémon e seus personagens pertencem aos respectivos titulares. A disponibilidade dos sprites não concede uma licença geral de uso da propriedade intelectual. Consulte [CREDITS.md](CREDITS.md) e as licenças em `public/`.

As instruções para agentes de desenvolvimento estão em [AGENTS.md](AGENTS.md).
