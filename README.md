# JSON Forge

Gerador visual de dados fictícios em JSON, CSV e SQL. Projeto #003 da série **LAB//ABERTO**.

## Funcionalidades

- Campos configuráveis: ID, nome, e-mail, cidade, números, booleanos, datas, enums e texto.
- Seeds para resultados reproduzíveis.
- Geração de até 1.000 registros por execução.
- Exportação JSON, CSV e SQL.
- Validação de schema e nomes duplicados.
- Interface responsiva e API HTTP.
- Sem banco de dados e sem envio para serviços externos.

## Executar

Requer Node.js 20+.

```bash
npm start
```

Acesse `http://localhost:3000`.

## Testes

```bash
npm run check
npm test
```

## Docker

```bash
docker compose up --build
```

## API

`POST /api/generate`

```json
{
  "count": 3,
  "seed": "demo",
  "format": "json",
  "schema": [
    {"name": "id", "type": "id"},
    {"name": "nome", "type": "fullName"},
    {"name": "status", "type": "enum", "values": ["ativo", "inativo"]}
  ]
}
```

## Limites do MVP

- Até 1.000 registros por geração.
- Mock API persistente e schemas salvos ficam para versões futuras.
- UUIDs não são determinísticos; demais tipos respeitam a seed.

## Independência

Projeto pessoal e educacional. Não contém código, dados, processos ou propriedade intelectual de empregadores ou clientes.

## Licença

MIT.
