# Sprites e créditos

Os personagens agora usam os sprites animados das versões **Pokémon Black & White**, disponibilizados no acervo público **PokéAPI/sprites**:

- Repositório: https://github.com/PokeAPI/sprites
- Diretório de origem: `sprites/pokemon/versions/generation-v/black-white/animated/`
- Ho-Oh também usa sua animação traseira ao voar para o norte.
- `public/sprites/sources.json` registra o commit exato e a URL de cada arquivo.
- `public/sprites/LICENCE.txt` preserva a declaração de direitos do acervo.

A declaração do repositório informa que o conteúdo das imagens é copyright The Pokémon Company. O repositório é distribuído sob CC0, mas isso **não transforma os direitos dos personagens e imagens em domínio público**. Este jogo permanece um projeto de fã não oficial; não há aqui uma licença comercial concedida pelos titulares de Pokémon.

Os GIFs foram convertidos em spritesheets PNG locais, preservando suas cores e poses. Para reduzir o tamanho do jogo, foram selecionados até 24 quadros de cada animação, distribuídos pelo ciclo original. O arquivo `src/sprite-data.json` incorpora as imagens para que tanto o aplicativo quanto o HTML autocontido funcionem sem carregar recursos de terceiros durante a partida.

O cenário, as interfaces, o lança-chamas e a composição musical foram produzidos para este projeto. Phaser, Vite e TypeScript conservam as respectivas licenças distribuídas com suas dependências.

## Instrumentos acústicos e trilha original

A composição e o arranjo “Asas da Aurora” foram criados para este jogo. As notas usam gravações de instrumentos reais de **VSCO 2 Community Edition**, Versilian Studios / Sam Gossner, distribuídas sob **CC0**. Não se trata de uma gravação de uma orquestra executando a peça inteira: a composição foi montada a partir dessas amostras acústicas.

- Biblioteca oficial: https://versilian-studios.com/vsco-community/
- Fontes fixadas: https://github.com/sgossner/VSCO-2-CE/tree/440300901dfe9275fd84e0b7763af1f8443ae62e
- Arquivos utilizados: `scripts/orchestra-sources.json`.
- Licença preservada: `public/audio/VSCO-CC0.txt`.
- Partitura programada, mixagem estéreo e renderização: `scripts/render-orchestra.py`.
- Stems AAC incorporados: `src/orchestra-data.json`.

Os efeitos de interface e combate continuam sintetizados via Web Audio. Nenhuma música de Pokémon foi copiada.

## Lugia

O companheiro Lugia usa o sprite animado de Pokémon Black & White, do mesmo acervo PokéAPI e commit dos demais personagens. Origem e conversão de 60 para 24 quadros registradas em `public/sprites/sources.json`; os mesmos direitos e limitações de Pokémon descritos acima se aplicam.


## Trilhas regionais v3.6
Quatro composições originais (Bosque Esmeralda, Lago das Marés, Vale das Cinzas, Ruínas do Céu), renderizadas com as mesmas amostras VSCO CC0 já creditadas. Nenhuma gravação musical de Pokémon foi utilizada. Gerador: scripts/render-regions.py.
