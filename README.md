# Salto das Estrelas 3D

Aventura 3D original para navegador, com câmera em terceira pessoa, ilhas
flutuantes, quatro classes, XP, equipamentos e cinco mundos. Combate com
ataques corpo a corpo ou à distância, esquiva e habilidades de classe.

## Jogar localmente

Extraia **todos** os arquivos e abra `index.html` no Chrome, Edge ou Firefox
com aceleração gráfica ativa. O jogo usa WebGL; não precisa instalar nada,
compilar ou conectar a uma CDN. Three.js está incluído em `vendor/`.
Fontes do Google são opcionais: há fontes locais de fallback.

Se o navegador restringir arquivos locais, execute nesta pasta:

```
python3 -m http.server 8000
```

Abra http://localhost:8000. O progresso da aventura dura até recarregar a página;
recordes por classe (solo) ou combinação de classes (coop) e a preferência de som ficam neste navegador.

## Controles soulslike (mouse e teclado)

Clique na cena ou em **Ativar câmera do mouse** para capturar o cursor.
Mova o mouse para girar e inclinar a câmera. Esc pausa e libera o cursor.
Se a captura não estiver disponível, mova o mouse sobre a cena para olhar.

| Comando | Ação |
| --- | --- |
| WASD / setas | Andar em relação à câmera |
| Clique esquerdo | Ataque leve; segurar repete |
| Shift + clique esquerdo | Ataque forte com preparação e maior recuperação |
| Segurar clique direito | Defesa frontal; início preciso faz parry |
| Espaço breve | Esquiva direcional; sem direção, passo para trás |
| Segurar Espaço + direção | Correr após 0,25s, consumindo stamina |
| F | Pular |
| Q / botão central do mouse | Travar ou liberar alvo |
| Roda do mouse | Trocar alvo travado; sem alvo, ajustar distância |
| Ctrl / L | Habilidade da classe (nível 3) |
| E | Interagir |
| R | Beber frasco de cura |
| Esc / P | Pausar / continuar |
| J / Z | Atalho de ataque leve |
| K | Atalho de ataque forte |
| B | Atalho de defesa |

No celular, use os botões de movimento, ataques, defesa, corrida, esquiva,
salto, alvo, frasco, habilidade e interação. Arrastar a cena gira a câmera.
Perder foco pausa automaticamente e limpa botões segurados.

## Cooperativo local — 2 jogadores

No menu, escolha **Coop local** e a classe de cada jogador. São dois
personagens na mesma tela, com câmera compartilhada e um único mundo.
J1 usa WASD/mouse. J2 pode usar um controle compatível com a Gamepad API,
ou um segundo conjunto de teclas no mesmo teclado. Não há conexão de rede.

### Jogador 2 no teclado

| Ação | Tecla | Teclado numérico |
| --- | --- | --- |
| Mover | Setas | — |
| Ataque leve | U | Num1 |
| Ataque forte | O | Num2 |
| Esquiva | M | Num3 |
| Pulo | N | Num0 |
| Defender | H / Ctrl direito | Num4 |
| Interagir / reanimar | Enter | Num5 |
| Frasco | Delete | Num6 |
| Travar alvo | Backspace | Num7 |
| Habilidade | Shift direito | Num8 |
| Correr (segurar) | End | Num9 |

No coop, as setas, Ctrl direito e Shift direito ficam reservados para J2.
J1 usa WASD, Ctrl esquerdo e Shift esquerdo. H permite defender sem modificadores.

### Jogador 2 no controle

Conecte um controle e pressione um botão para que o navegador o reconheça.
O primeiro controle conectado é atribuído ao jogador 2.

- Analógico esquerdo: movimento com intensidade variável.
- Analógico direito: câmera compartilhada.
- RB/R1: ataque leve; RT/R2: ataque forte.
- LB/L1: defesa; LT/L2: habilidade.
- B/Círculo: toque esquiva; segurar + direção corre.
- A/X: interagir/reanimar; X/Quadrado: frasco; Y/Triângulo: pulo.
- Clique no analógico direito (R3): trava de alvo.
- Start/Options: pausa e continua, também para os dois jogadores.

### Regras da equipe

Cada um tem classe, HP, energia, stamina, nível, moedas, equipamento e frascos
próprios. XP de um inimigo derrotado é concedido aos dois, uma vez por aventura.
Itens do mundo e baús são únicos e pertencem a quem os coleta. Os inimigos têm
mais HP no coop e perseguem o jogador visível mais próximo. O chefão tem 58 HP
no coop, em comparação com 36 no solo.

Os personagens ficam a até 20 unidades de distância para permanecer na tela.
O portal espera pelos dois, além dos guardiões e chefão habituais. Avançar de
fase leva a dupla para a nova área e restaura saúde, energia, stamina e frascos.

Um jogador com HP zero fica caído durante 20s. O outro pode se aproximar e
pressionar interação; ficar parado por 2s reanima com metade do HP máximo.
Mover-se ou receber dano cancela. Cair no abismo deixa o personagem caído no
último chão seguro. Se ambos caírem ou os 20s acabarem, a equipe perde uma
única tentativa e volta ao checkpoint. XP, equipamentos e progressão de
exploração são preservados para os dois. A equipe começa com três tentativas.

## Stamina, defesa e cura

Stamina é separada da energia mágica: máximo 100, recuperação de 28/s após
0,65s sem gastar. Manter a guarda impede a recuperação. Ataque leve custa
18 (12 para ladrão); forte 32; esquiva 25; salto 8; habilidade 22;
corrida gasta 18/s. Ficar sem stamina impede a ação correspondente.

Ataques e cura reduzem movimento durante suas animações. O golpe forte causa
dano dobrado após 0,38s de preparação e deixa sentinelas vulneráveis.
A esquiva tem invulnerabilidade breve e recarga por classe.

Defesa só protege a frente e gasta 22 de stamina por HP bloqueado. Sem stamina,
a guarda quebra e o personagem fica vulnerável brevemente. Começar a guarda
até 0,18s antes de uma investida de inimigo comum faz parry: gasta 10 de stamina
e atordoa o atacante por 1s. Chefões e projéteis são bloqueáveis, sem parry.

Há três frascos por fase. R gasta uma carga e cura 3 HP após 0,9s; receber dano
ou esquivar interrompe a cura e a carga permanece gasta. Santuários, morte e
mudança de fase restauram as três cargas. Com vida cheia, o frasco não é gasto.

Trava de alvo acompanha a câmera e mantém o personagem voltado ao inimigo
enquanto anda para os lados. Morte ou distância excessiva libera o alvo.

## Classes e progressão

| Classe | HP inicial | Ataque | Poder do nível 3 |
| --- | --- | --- | --- |
| Guerreiro | 5 | Espada | Redemoinho em área |
| Mago | 3 | Projétil arcano; 10 energia | Explosão arcana |
| Ladrão | 3 | Adagas e movimento rápido | Ocultação de 4s e próximo golpe crítico |
| Arqueiro | 4 | Flechas; 5 energia | Disparo triplo |

A energia regenera 12 por segundo. Habilidades gastam energia e têm recarga.
Ataques usam o alvo travado ou o inimigo próximo à frente do personagem.

Mobs dão 25–60 XP; o chefão dá 250 XP. Recompensas são concedidas uma única
vez por inimigo e aventura. Primeiro nível exige 60 XP, depois +35 por nível;
limite 15. Níveis 2, 7, 10 e 13 dão HP; 3 desbloqueia a habilidade; 4, 8 e 12
dão dano; 5 reduz recarga da esquiva; 9 reduz recarga da habilidade; os demais
dão energia. Subir de nível cura até 2 HP e restaura a energia.

## Exploração e dificuldade

São cinco mundos com 7, 8, 8, 9 e 10 ilhas principais, vãos para saltar,
caminhos laterais elevados e guardiões. Derrote os **três guardiões** de cada
fase para liberar o portal. Na quinta fase, vença também o Guardião do Eclipse.

Caçadores perseguem e investem; sentinelas bloqueiam golpes frontais, mas ficam
vulneráveis após investir; atiradores disparam projéteis após sinalizar o ataque.
O chefão alterna disparos e investidas, com preparação mais curta abaixo de 50% HP.
Espadas e adagas podem destruir projéteis próximos. Magia atravessa a guarda.

- Cristais dourados: moedas.
- Alavancas: abrem pontes para rotas de equipamento.
- Baús elevados: selados por um guarda, dão equipamento +1 a +5 conforme fase,
  25 moedas e +5 de energia máxima. O equipamento aumenta dano e permanece.
- Escudo: protege de ataques por 10s; não protege de quedas.
- Super salto: impulso maior por 12s.
- Caixas: quebram com ataques e dão 4 moedas/10 energia uma vez.
- Santuários: restauram HP e energia por 30 moedas, uma vez por fase.
- Checkpoints: ativam por proximidade e recuperam 1 HP.

Três tentativas por aventura. Quedas ou HP zero consomem uma tentativa.
XP, moedas, equipamento, itens coletados, pontes e inimigos derrotados são
preservados. Inimigos vivos voltam às posições; o chefão vivo recupera HP.
Avançar de fase recupera saúde e energia. Nova aventura reinicia a progressão.

## Arquivos e licença

`index.html`, `styles.css`, `game.js` e `vendor/` formam o jogo completo.
Modelos e cenários são construídos em código; não dependem de assets remotos.
Three.js r158: licença MIT em `vendor/THREE-LICENSE.txt`.

A versão anterior em 2D permanece no histórico do repositório Git.
