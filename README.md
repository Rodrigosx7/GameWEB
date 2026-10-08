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
recordes por classe (solo) ou combinação de classes (coop), atalhos e preferências de som/trava pelo mouse ficam neste navegador.

## Controles Souls — teclado e mouse

Clique em **Começar aventura** para capturar o mouse. O cursor fica preso à
cena; mover o mouse gira a câmera e orienta o personagem. WASD move em relação
à visão, preservando a orientação ao recuar e andar de lado. Esc pausa e libera
o cursor. Ao continuar, o mouse é capturado novamente; o botão **Capturar câmera
do mouse** permite ativar manualmente. Se o navegador não permitir captura,
segurar e arrastar a cena gira a câmera e os comandos de combate continuam ativos.

| Ação | Jogador 1 | Jogador 2 no teclado |
| --- | --- | --- |
| Movimento | WASD | Setas |
| Esquiva / passo para trás | Toque e solte Espaço | Toque e solte M |
| Correr | Segure Espaço + direção | Segure M + direção |
| Corrida alternativa | Shift esquerdo | Shift direito |
| Pular | F | N |
| Ataque leve / combo | Clique esquerdo | U |
| Ataque carregado | Segure Shift + clique esquerdo; solte o clique | Segure O; solte |
| Defesa / parry | Segure clique direito | Segure B |
| Habilidade da classe | Shift + clique direito | P |
| Travar / liberar alvo | Botão central / Q | Backspace / Home |
| Alvo anterior / próximo | Roda para cima / baixo | [ / ] |
| Frasco | R | Delete |
| Interagir / reanimar | E | Enter |
| Câmera alternativa: esquerda / direita / cima / baixo | T / Y / G / H | Num4 / Num6 / Num8 / Num5 |
| Zoom aproximar / afastar | 1 / 2 | Num+ / Num− |
| Centralizar câmera | V | End |

A corrida começa após 0,22s segurando a esquiva com movimento e consome stamina.
Soltar depois de correr não dispara uma esquiva. Sem direção, o toque faz um
passo para trás. Ataques não viram automaticamente para inimigos não travados;
magia e flechas usam a direção da visão, ou miram no alvo travado.

**Geral:** Esc pausa/continua; F1 abre/fecha Controles; F3 começa/continua a
aventura; F2 alterna o som. São padrões inspirados em controles de Souls no PC;
as diferentes franquias e edições têm variações de atalhos.

## Configurar comandos

A aba **Controles (F1)** mantém comandos separados de Jogador 1, Jogador 2 e
Geral. Há 52 atalhos configuráveis. Selecione um comando e pressione uma tecla,
ou clique/role na área de captura para atribuir o mouse a J1. Segure Shift para
combinar uma tecla ou botão; solte Shift sozinho para atribuir apenas Shift.
Esc cancela. Conflitos oferecem troca explícita entre dois comandos. Restaurar
padrões recupera o novo layout Souls. As configurações ficam salvas no navegador;
esta versão adota novos padrões sem reutilizar o antigo layout somente teclado.

Em **Geral**, ajuste sensibilidade e inversão vertical do mouse e escolha
**Teclado** ou **Controle (gamepad)** para J2. Todos os atalhos de teclado e mouse
continuam personalizáveis, incluindo os comandos gerais. Tab navega nos menus,
Enter ou Espaço ativa botões e setas laterais alternam abas. Abrir Controles ou
perder foco pausa e limpa comandos segurados. Em telas móveis, use periféricos
compatíveis; não há comandos de toque.

## Combos, carga e animações

Cada arma tem uma sequência de três ataques leves. Espada alterna cortes e
termina numa estocada; adagas alternam braços e terminam com as duas mãos;
cajado alterna gestos de conjuração; arco usa diferentes poses de puxada e
liberação. O terceiro golpe causa **1,5×** o dano. A sequência reinicia após
1,15s sem renovar o combo. Segurar o ataque leve repete a sequência.

Segurar o ataque forte inicia uma carga de até **1,1s**. Soltar executa o golpe;
na carga máxima ele é disparado automaticamente. O dano varia de **2× a 3,5×**
e o custo de stamina de **32 a 44**, incluindo uma reserva inicial de 8.
Esquivar ou receber dano cancela a carga, sem devolver essa reserva.
A interface mostra a porcentagem da carga de cada jogador.

Golpes têm preparação e acertam durante a animação. Comandos de ataque,
esquiva ou habilidade dados durante a recuperação aguardam até 0,42s para
executar quando possível. Isso permite encadear movimentos sem exigir uma
tecla no instante exato. A preparação de um golpe comprometido não é cancelada
por esquiva. Iniciar a carga reduz a velocidade; não permite salto, cura ou habilidade.

Braços, pernas, capa e tronco usam transições suaves. Movimento acelera e
freia rapidamente; giros do personagem são interpolados e cada arma tem poses
próprias de preparação, impacto e recuperação.

## Cooperativo local — 2 jogadores

No menu, escolha **Coop local**, a classe de cada jogador e os comandos de J2:
**Teclado** ou **Controle (gamepad)**. J1 usa teclado/mouse. São dois personagens
no mesmo mundo e câmera compartilhada. Combos, carga e filas de comandos são
independentes. Não há conexão de rede.

### Controle do Jogador 2

Compatível com controles que o navegador expõe pela Gamepad API com mapeamento
**standard**, como controles Xbox e PlayStation reconhecidos pelo sistema.
Conecte e pressione um botão para o navegador reconhecer; depois solte os
botões e centralize o analógico esquerdo para ativar. O primeiro controle padrão
conectado é atribuído a J2.

| Controle Xbox / PlayStation | Ação |
| --- | --- |
| Analógico esquerdo | Movimento com intensidade variável |
| Analógico direito | Girar / inclinar câmera compartilhada |
| RB / R1 | Ataque leve; segurar repete combos |
| RT / R2 | Segurar carrega, soltar executa o golpe forte |
| LB / L1 | Defesa / parry |
| LT / L2 | Habilidade da classe |
| B / Círculo | Toque esquiva; segurar + direção corre |
| A / X | Interagir / reanimar |
| X / Quadrado | Frasco |
| Y / Triângulo | Pular |
| R3 | Travar / liberar alvo |
| Direcional esquerdo / direito | Trocar alvo |
| L3 | Corrida alternativa |
| Start / Options | Pausar / continuar |

O analógico tem zona morta de 18% para evitar movimento involuntário. Desconectar
limpa comandos e cargas de J2; reconectar exige soltar botões antes de continuar.
Se a Gamepad API estiver indisponível, mude J2 para Teclado. Durante a pausa,
solte os botões e use Start novamente para continuar. A câmera do mouse pode
precisar de um clique ao retomar pelo controle, por exigência do navegador.

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
18 (12 para ladrão); forte 32–44 conforme carga; esquiva 25; salto 8; habilidade 22;
corrida gasta 18/s. Ficar sem stamina impede a ação correspondente.

Ataques e cura reduzem movimento durante suas animações. O golpe forte causa
2×–3,5× o dano após a carga e 0,22s de preparação final, deixando sentinelas vulneráveis.
A esquiva tem invulnerabilidade breve e recarga por classe.

Defesa só protege a frente e gasta 22 de stamina por HP bloqueado. Sem stamina,
a guarda quebra e o personagem fica vulnerável brevemente. Começar a guarda
até 0,18s antes de uma investida de inimigo comum faz parry: gasta 10 de stamina
e atordoa o atacante por 1s. Chefões e projéteis são bloqueáveis, sem parry.

Há três frascos por fase. O comando de frasco gasta uma carga e cura 3 HP após 0,9s; receber dano
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
Ataques usam a direção da visão; travar o alvo permite mirar e acompanhar esse inimigo.

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

## Colisões

Os personagens usam uma base circular com altura, subdivisão do deslocamento
para evitar atravessar obstáculos em esquivas e deslizamento pelas quinas.
Laterais e partes inferiores das plataformas são sólidas; a aterrissagem usa a
superfície mais alta cruzada pelo movimento, incluindo topos de obstáculos.
Pilares, troncos, baús, caixas e bases de santuários possuem colisão. Caixas
quebradas deixam de bloquear imediatamente. Saltos e pontes continuam necessários
para alcançar rotas elevadas e atravessar vãos.

Projéteis verificam o trajeto inteiro contra volumes sólidos e personagens.
A câmera também verifica o caminho até o personagem para evitar atravessar
paredes. A mesma geometria de colisão é usada pelos dois jogadores e inimigos.

## Arquivos e licença

`index.html`, `styles.css`, `controls.js`, `game.js` e `vendor/` formam o jogo completo.
Modelos e cenários são construídos em código; não dependem de assets remotos.
Three.js r158: licença MIT em `vendor/THREE-LICENSE.txt`.

A versão anterior em 2D permanece no histórico do repositório Git.
