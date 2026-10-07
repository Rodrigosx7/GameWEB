# Salto das Estrelas

Jogo de ação e plataforma 2D para navegador com cinco fases, espadas,
combate, esquiva, equipamentos, checkpoints, efeitos sonoros e um chefão final.

## Executar

Abra `index.html` no navegador. Não há dependências nem compilação.
Também é possível executar `python3 -m http.server 8000` nesta pasta e acessar
http://localhost:8000.

## Controles

- Andar: setas esquerda/direita ou A/D.
- Pular: Espaço, seta para cima ou W.
- Atacar com a espada: J ou Z.
- Esquivar: K ou Shift. A esquiva concede um curto período de invulnerabilidade
  e tem 1,1 segundo de recarga. A esquiva não impede quedas.
- Pausar/continuar: P ou o botão de pausa.
- No celular, use os botões de toque.
- Ative ou silencie os efeitos no botão de som.

## Poderes e checkpoints

- Você começa com uma lâmina de treino. Cada fase guarda uma espada melhor na
  metade final, sobre uma plataforma que exige saltos e enfrentar inimigos.
  As espadas aumentam alcance e dano. Uma espada obtida segue equipada até o
  fim da partida, mesmo ao perder uma vida.
- Cada fase tem apenas um power-up, localizado mais adiante.
- ◆ Escudo azul: protege contra inimigos, espinhos e esferas por 10 segundos.
  Não protege contra quedas.
- ↑ Super salto verde: aumenta o impulso do salto por 12 segundos.
- ♥ Coração rosa: adiciona uma vida, até o máximo de cinco. Você começa com três.
- As bandeiras salvam seu ponto de retorno e as estrelas coletadas até ali.
  Ao perder uma vida, as estrelas coletadas depois da bandeira reaparecem.
- Poderes coletados não reaparecem ao perder uma vida, impedindo repetir a coleta
  de vidas extras. Os poderes temporários terminam quando você perde uma vida.
- A pausa também pausa o tempo dos poderes.

## Inimigos e combate

- Caçadores perseguem e investem em você depois de um aviso visual.
- Guardas bloqueiam golpes de frente durante a postura defensiva. Acerte-os
  por trás, após a investida ou pule sobre eles.
- Atiradores mostram um aviso antes de disparar. Você pode esquivar ou cortar
  os projéteis com a espada.
- Os inimigos têm pontos de vida e ficam brevemente atordoados após um golpe.
  As fases avançadas incluem mais inimigos, espinhos e menos itens de cura.

## Fases e chefão

1. Colinas do Amanhecer
2. Vale dos Ventos
3. Céu das Estrelas
4. Floresta da Lua
5. Fortaleza do Eclipse

Na fase final, ataque o Guardião com a espada ou pule sobre sua cabeça.
Ele sinaliza disparos e investidas, acelera ao perder vida e fica brevemente
protegido após um golpe. O portal final abre após sua derrota. Ao perder uma vida,
o chefão recupera sua energia. O recorde desta versão de combate fica salvo
neste navegador, separado dos recordes das versões anteriores.

O som é sintetizado no navegador e começa após sua interação. O jogo funciona
mesmo quando áudio ou armazenamento local não estão disponíveis.
