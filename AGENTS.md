# Ho-Oh Fire Battle — instruções para agentes

## Projeto

Jogo de aventura 2D para navegador, em português, feito com TypeScript, Phaser 3 e Vite. Sem backend, autenticação ou serviços de dados. O progresso fica no localStorage. O README.md descreve execução, controles e publicação; CREDITS.md documenta os recursos; VALIDACAO.md registra verificações e limitações.

## Trabalhando no código

- Leia os módulos afetados antes de editar. Preserve a estética em pixel art e a interface mobile limpa.
- Mantenha compatibilidade com o save `hooh-adventure-v2`, versão 2, revisão de mundo 3. Novos campos devem ter valores padrão; mudanças incompatíveis exigem migração. Não limpe saves do usuário para testar.
- Preserve os modos Fácil/Difícil, a progressão dos quatro capítulos, Lugia e o funcionamento simultâneo dos controles de movimento e ataque.
- Mudanças de interação devem funcionar com teclado/mouse e com multitouch. Soltar, cancelar, pausar ou perder foco deve liberar os comandos.
- Não volte a enviar o terreno inteiro como uma textura à GPU. O mundo usa blocos de 1024 × 1024 para compatibilidade mobile. Evite efeitos de pós-processamento pesados em dispositivos touch.
- Use assets locais e mantenha as fontes/licenças em CREDITS.md. As músicas são composições originais com amostras VSCO CC0; sprites Pokémon continuam sujeitos aos direitos dos respectivos titulares.
- Não edite `dist/` ou `jogar.html` manualmente: são gerados pelo build. Não inclua node_modules, credenciais, logs ou capturas de teste no Git.
- Não force push, não altere visibilidade do repositório e não descarte alterações existentes sem autorização.

## Arquitetura

- `src/main.ts`, `src/style.css`: interface DOM, menus, HUD e tela cheia.
- `src/scene.ts`: integração da partida, progressão, saves, interação e atualização.
- `src/actors.ts`, `src/encounters.ts`: atores, preparação de ataques e padrões dos chefes.
- `src/touch.ts`, `src/flame.ts`, `src/combat.ts`: mira mobile, lança-chamas, projéteis e impactos.
- `src/world.ts`, `src/adventure.ts`, `src/discoveries.ts`: terreno, colisões, rota e desafios opcionais.
- `src/progression.ts`, `src/difficulty.ts`, `src/companion.ts`: habilidades, balanceamento e Lugia.
- `src/camera.ts`, `src/scenery.ts`, `src/atmosphere.ts`: câmera, cenário e clima.
- `src/audio.ts`, `scripts/render-regions.py`: reprodução adaptativa e geração das trilhas.

## Verificação

1. Execute `npm run build` para conferir TypeScript e produção.
2. Quando a entrega incluir o HTML autocontido, execute `npm run build:standalone`.
3. Para validação no navegador, use a skill `playwright`: CLI primeiro, MCP sob demanda. Use uma sessão própria e feche apenas essa sessão.
4. Scripts `tests/*.cjs` exportam funções para `playwright-cli run-code --filename=...`; não são uma suíte de `npm test`. Vários scripts históricos dependem de URLs locais e seletores antigos. Leia e adapte antes de executar.
5. `window.battle` existe apenas no servidor de desenvolvimento. Valide também o build de produção, que não expõe essa referência.
6. Em mudanças mobile, teste retrato/paisagem, controles simultâneos, menus e cancelamento de toques. Capture e abra screenshots para inspecionar o resultado.
7. Não apresente emulação como teste em aparelho físico, nem testes programáticos de chefes como avaliação humana de balanceamento. Registre limites em VALIDACAO.md quando pertinente.

## Publicação

O repositório é `LucasMartinelli/ho-oh-game`, branch `main`. O Netlify usa `npm run build` e publica `dist/`, com diretório base vazio. Não há variáveis de ambiente obrigatórias. Um push pode disparar o deploy conectado; confirme o envio e diferencie-o da conclusão do deploy.
