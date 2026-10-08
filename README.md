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

## Controles configuráveis — teclado completo

Movimento, combate, câmera e menus funcionam pelo teclado. Abra a aba
**Controles** com F1: há comandos separados de **Jogador 1**, **Jogador 2**
e **Geral**. Selecione um comando com Tab e Enter, depois pressione a nova
tecla. Esc cancela a edição. Teclas já usadas oferecem uma troca explícita
entre os dois comandos; nada é sobrescrito silenciosamente. Restaurar padrões
recupera os 50 atalhos. Teclas de navegação e atalhos reservados do navegador
não podem ser atribuídos. As configurações ficam salvas neste navegador.

| Ação | Jogador 1 | Jogador 2 |
| --- | --- | --- |
| Movimento | WASD | Setas |
| Correr (segurar) | Shift esquerdo | Shift direito |
| Pular | F | N |
| Ataque leve / combo | J | U |
| Ataque forte: segurar para carregar, soltar para golpear | K | O |
| Defesa / parry (segurar) | L | B |
| Esquiva / passo para trás | Espaço | M |
| Habilidade da classe | C | P |
| Travar / liberar alvo | Q | Backspace |
| Alvo anterior / próximo | Z / X | [ / ] |
| Frasco | R | Delete |
| Interagir / reanimar | E | Enter |
| Câmera: esquerda / direita / cima / baixo | T / Y / G / H | Num4 / Num6 / Num8 / Num5 |
| Zoom aproximar / afastar | 1 / 2 | Num+ / Num− |
| Centralizar câmera | V | End |

**Geral:** Esc pausa/continua; F1 abre/fecha Controles; F3 começa/continua a
aventura; F2 alterna o som. Todos esses atalhos também podem ser alterados.
Tab navega pelos menus, Enter ou Espaço ativa o botão selecionado e as setas
laterais alternam as abas. Abrir Controles pausa a aventura; ao voltar, use
F3 ou o botão Continuar. Perder foco também pausa e limpa comandos segurados.

O clique no **botão central do mouse** trava/libera o alvo do Jogador 1 como
alternativa opcional. Pode ser desligado em **Controles → Geral**. A câmera
continua totalmente controlável pelo teclado. No celular, use um teclado
externo; a interface se adapta à tela, mas esta versão não tem comandos de toque.

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

No menu, escolha **Coop local** e a classe de cada jogador. São dois personagens
no mesmo mundo, com câmera compartilhada. Os atalhos dos dois podem ser
configurados separadamente para acomodar seu teclado. Combos, carga e filas
de comandos são independentes; o botão central é uma alternativa apenas de J1.
Não há conexão de rede.

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

`index.html`, `styles.css`, `controls.js`, `game.js` e `vendor/` formam o jogo completo.
Modelos e cenários são construídos em código; não dependem de assets remotos.
Three.js r158: licença MIT em `vendor/THREE-LICENSE.txt`.

A versão anterior em 2D permanece no histórico do repositório Git.
