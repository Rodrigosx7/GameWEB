# Salto das Estrelas

Jogo de ação, plataforma e progressão para navegador. Quatro classes, cinco
fases ampliadas, XP, recompensas de nível, equipamentos raros, objetos
interativos e o Guardião do Eclipse como chefão final.

## Executar

Abra `index.html` no navegador. Não há dependências nem compilação.
Ou execute `python3 -m http.server 8000` nesta pasta e abra http://localhost:8000.

## Classes

Escolha a classe antes de começar uma partida:

| Classe | HP inicial | Ataque básico | Habilidade do nível 3 |
| --- | --- | --- | --- |
| Guerreiro | 5 | Espada, alcance maior | Redemoinho que atinge inimigos próximos |
| Mago | 3 | Projétil arcano, 10 de energia | Explosão arcana em uma área ampla |
| Ladrão | 3 | Adagas rápidas e movimento ágil | Ocultação por 4s e próximo golpe crítico |
| Arqueiro | 4 | Flecha, 5 de energia | Disparo de três flechas |

A energia se recupera com o tempo. Habilidades têm custo e recarga. A classe
fica fixa até o fim da partida. Cada classe tem seu próprio recorde de tempo.

## Controles

- Mover: A/D ou setas esquerda/direita.
- Pular: Espaço, W ou seta para cima.
- Atacar: J ou Z.
- Esquivar: K ou Shift; invulnerabilidade breve, com recarga por classe.
- Habilidade: L ou Q; desbloqueada no nível 3.
- Interagir com objetos: E.
- Pausar: P ou o botão de pausa.
- Celular: botões para mover, pular, atacar, esquivar, habilidade e interação.
- O botão de som ativa ou silencia os efeitos.

## XP e recompensas

Mobs dão 25–60 XP conforme tipo e fase, além de moedas. O chefão dá 250 XP.
Cada inimigo dá XP e moedas apenas uma vez por partida; ele pode reaparecer ao
perder uma vida, mas não pode ser usado para repetir a recompensa.

O primeiro nível exige 60 XP, com mais 35 XP a cada nível seguinte. O limite é 15.

- Nível 2: +1 de HP máximo.
- Nível 3: habilidade da classe.
- Nível 4: +1 de dano permanente.
- Nível 5: esquiva recarrega 20% mais rápido.
- Nível 6: +20 de energia máxima.
- Níveis 7 e 10: +1 de HP máximo.
- Níveis 8 e 12: +1 de dano.
- Nível 9: habilidade recarrega 20% mais rápido.
- Demais níveis: HP ou energia máxima.

Subir de nível também recupera até 2 HP e toda a energia. O painel de
recompensas mostra os cinco prêmios mais recentes. XP, nível, moedas e melhorias
são mantidos entre fases e ao perder uma vida, até recomeçar uma partida.

## Equipamentos, poderes e saúde

O personagem começa com equipamento de treino. Cada fase tem um equipamento
melhor em uma plataforma alta da área ampliada. O equipamento se adapta à classe:
espada, cajado, adagas ou arco. Ele aumenta dano e alcance e permanece após morrer.

- Escudo: proteção temporária de 10s contra ataques e espinhos.
- Super salto: impulso maior por 12s.
- Coração: uma vida extra, até cinco vidas. A partida começa com três vidas.
- HP mede a saúde em combate; quando chega a zero, uma vida é consumida.
- Quedas consomem uma vida mesmo com escudo ou invulnerabilidade.
- Checkpoints salvam o ponto de retorno e as estrelas coletadas até ali.
- Itens coletados não reaparecem ao morrer. XP e equipamento permanecem.
- A pausa também pausa os efeitos e recargas.

## Exploração e interações

- Placas: E lê dicas de combate e exploração.
- Alavancas: E abre uma ponte de atalho; ela permanece aberta após morrer.
- Caixas: ataques quebram a caixa e dão 4 moedas e 10 de energia, uma única vez.
- Baús: ficam em plataformas altas e são selados por um guarda. Após derrotá-lo,
  E abre o baú: 25 moedas e +5 de energia máxima permanente.
- Santuários: E restaura HP e energia por 30 moedas; um uso por fase.

As fases agora têm 4.400, 4.700, 5.000, 5.200 e 6.000 unidades de largura,
com novas rotas elevadas, obstáculos, encontros e checkpoints.

## Inimigos e chefão

Caçadores perseguem e investem. Guardas bloqueiam ataques de frente durante a
postura defensiva; ataque após a investida ou por trás. Atiradores sinalizam
antes de disparar. Espadas e adagas podem cortar projéteis; magia atravessa a
guarda frontal. Mobs sofrem atordoamento breve após um golpe.

O Guardião ocupa a área final da Fortaleza do Eclipse. Ele alterna esferas e
investidas, acelera ao perder HP e fica brevemente protegido após um golpe.
Ataque com sua classe ou pule sobre a cabeça dele para abrir o portal final.
Ao perder uma vida, o chefão recupera a saúde.

Cenários têm ruínas, árvores, tochas e partículas em movimento. Cada classe
possui aparência e animação de ataque próprias; golpes mostram dano e XP,
esquivas deixam rastros e impactos movimentam a câmera.

O jogo funciona sem áudio ou armazenamento local. Progresso da aventura fica
na sessão atual; recordes e preferência de som ficam neste navegador.
