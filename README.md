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
recordes por classe e a preferência de som ficam neste navegador.

## Controles

- WASD ou setas: mover em relação à câmera.
- Espaço: pular. W agora anda para a frente.
- J/Z: atacar; segure para ataques contínuos.
- Shift/K: esquivar, com invulnerabilidade breve e recarga.
- Q/L: habilidade de classe, desbloqueada no nível 3.
- E: interagir com placas, alavancas, baús e santuários.
- P: pausar/continuar; perder foco também pausa.
- Arrastar a cena: girar a câmera; roda do mouse: aproximar/afastar.
- Celular: direção e ações nos botões de toque; arraste a cena para girar.

## Classes e progressão

| Classe | HP inicial | Ataque | Poder do nível 3 |
| --- | --- | --- | --- |
| Guerreiro | 5 | Espada | Redemoinho em área |
| Mago | 3 | Projétil arcano; 10 energia | Explosão arcana |
| Ladrão | 3 | Adagas e movimento rápido | Ocultação de 4s e próximo golpe crítico |
| Arqueiro | 4 | Flechas; 5 energia | Disparo triplo |

A energia regenera 12 por segundo. Habilidades gastam energia e têm recarga.
Ataques miram automaticamente no inimigo próximo à frente do personagem.

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
