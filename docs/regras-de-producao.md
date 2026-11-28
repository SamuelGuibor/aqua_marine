# Regras de produção

"Um número, um valor": toda conta de produção mora em `lib/dominio/`, em funções puras
(sem banco, `next/*`, rede, relógio ou API de navegador), usadas pelo servidor e pelo tablet offline.
Vazio ("—" na tela) é `null`. Percentuais saem como número (`86.3`); a tela formata.

## `tempo.ts`
| Conta | Fórmula | Exemplo (teste) |
|---|---|---|
| `diaDe` | data do instante em `America/Sao_Paulo` | `2026-11-25T02:30:00Z` → `2026-11-24` (máquina em UTC) |
| `diasUteisDecorridos` | seg–sex do mês antes de hoje | 10/11/2026 → 6 |
| `diasUteisRestantes` | max(0, úteis − decorridos), inclui hoje | 21 − 6 = 15 |
| `formatarDuracao` | `< 60` → `N min`; senão `HhMM` | 43 → `43 min`; 86 → `1h26`; 634 → `10h34` |
| `formatarDuracaoLonga` | `Hh Mmin` | 494 → `8h 14min` |

## `medidas.ts`
| Conta | Fórmula | Exemplo |
|---|---|---|
| `areaDaMedida` | metros × 0,5 | 2→1 · 3→1,5 · 4→2 · 5→2,5 |
| `rotuloMedida` | `M m · A m²` | `3 m · 1,5 m²`; `2 m · 1 m²` |

## `producao.ts`
| Conta | Fórmula | Exemplo |
|---|---|---|
| `UNIDADE` | Injetora = boas; Montagem = montadas; Teste & Embalagem = embaladas | — |
| `valorDoSetor` | soma de `placas` dos tipos que contam (inj: boa2+boa1; mon: mon_placa; tes: tes_pacote); sem linha = `sem_producao` | 230 + 10 = 240; `[]` → sem produção |
| `areaDoSetor` | Σ placas que contam × área da medida | 240 × 1,5 = 360 |

## `metas.ts`
| Conta | Fórmula | Exemplo |
|---|---|---|
| `pctMeta` | round(valor ÷ meta × 100), sem trava; meta 0 = `null` | 387/270 = 143; 76/270 = 28 |
| `pctBarra` | min(100, pctMeta) | 100 |
| `faltam` | meta − valor, ou `acima` valor − meta | Acima +117; 240 → faltam 30 |
| `ritmo` | round(valor ÷ horas ativas); sem tempo = `null` | 240 em 494 min = 29/h |
| `bateMeta` | agora + faltam ÷ ritmo (h), `HH:MM` SP; `batida`; `—` | 15:36 + 30÷29 h = 16:38 |
| `metaDoMes` | meta do dia × dias úteis | 270 × 21 = 5.670 |
| `esperado` | decorridos ÷ dias úteis, %, 1 casa | 6 ÷ 21 = 28,6 |
| `fazPorDia` | feito ÷ dias com produção (cru) | 1.504 ÷ 5 = 300,8 → 301 |
| `precisaPorDia` | ceil((meta mês − feito) ÷ restantes); 0 restantes = `null` | ceil(4.166 ÷ 15) = 278 |
| `projecao` | round(feito + fazPorDia cru × restantes) | 1.504 + 300,8 × 15 = 6.016 |
| `aFrente` | projeção − meta do mês (ou `atras`) | 6.016 − 5.670 = +346 |
| `metaDoDiaGrafico` | meta Montagem + meta Teste | 270 + 270 = 540 |

Montagem e Teste do Desempenho: 1.696 → 339 / 265 / 6.784; 1.440 → 288 / 282 / 5.760.

## `injetora.ts`
| Conta | Fórmula | Exemplo |
|---|---|---|
| `CICLOS` | boa2 = 2; boa1 = 1; vazio = 1; cada perda = 1 | — |
| `boas` | boa2 + boa1 | 240 |
| `perdas` | soma dos 4 tipos de perda | 3 |
| `eficiencia` | boas ÷ (boas + perdas), %, 1 casa; vazios fora; divisor 0 = `null` | 240 ÷ 243 = 98,8 |
| `ciclos` | Σ toques × ciclos | 240×2 + 1 + 3 = 484 |
| `ciclosPerdidos` | só perdas (sem vazios) | 3 |
| `ciclosVazios` | vazios, separado | 1 |
| `placasPorHora` / `ciclosPorHora` | round(q ÷ horas) | 29 / 59 em 494 min |
| `tempoPorPlaca` / `tempoPorCiclo` | segundos ativos ÷ q | 124 s / 61 s |

## `teste.ts`
| Conta | Fórmula | Exemplo |
|---|---|---|
| `testadas` | embaladas + defeitos | 120 + 7 + 12 = 139 |
| `aprovacao` | embaladas ÷ testadas, %, 1 casa (âmbar abaixo de `LIMITE_APROVACAO` = 90) | 86,3 |
| `perdaTeste` | defeitos ÷ testadas | 13,7 |
| `placasPorPacote` | embaladas ÷ pacotes, 1 casa; sem pacote = `null` | 120 ÷ 12 = 10,0 |
| `distribuicaoPorTamanho` | pacotes por tamanho, do mais frequente | `com 10: 136 · com 8: 10` |
| `validarPlacasPorPacote` | inteiro de 1 a 30 | 0 e 31 inválidos |
| `foraDoPadrao` | ≠ 10 | 8 → sim |

## `montagem.ts`
| Conta | Fórmula | Exemplo |
|---|---|---|
| `mesaAtiva` | tem operadora e medida | — |
| `porOperadora` | total, % do dia e ritmo por operadora, decrescente; ignora linha sem operadora/medida | 44 → 35% · 22/h em 120 min |
| `totalMontagem` | soma das operadoras | 31 + 21 + 44 + 31 = 127 |
| `operadorasSemMesa` | produção hoje e nenhuma mesa atual | — |

## Divergências com o protótipo
- **Esperado até ontem**: o protótipo mostra 24% (5 dias com produção ÷ 21); a regra decidida no card é
  dias úteis decorridos ÷ dias úteis = 6 ÷ 21 = **28,6%**.
- **Projeção** usa o faz-por-dia sem arredondar (6.016); com o 301 exibido daria 6.019.
- Valor igual à meta mostra **"Acima +0"**.
- `tempoPorPlaca`/`tempoPorCiclo` saem em segundos (o protótipo não fixa a unidade).
