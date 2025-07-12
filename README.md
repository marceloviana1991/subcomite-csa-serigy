# Documentação da API - Subcomitê de Materiais CSA Serigy

Esta documentação detalha como utilizar a API REST para o gerenciamento de produtos e pedidos.

**URL Base da API:** `http://localhost:8080`

## Formato dos Dados

A API utiliza o formato **JSON** para todas as requisições e respostas que envolvem dados. Certifique-se de que o cabeçalho `Content-Type` esteja definido como `application/json` ao enviar dados, exceto para o upload de imagens.

## Endpoints

A API está dividida em dois recursos principais: **Produtos** e **Pedidos**.

----------

### **Recurso: Produtos**

Controla todas as operações relacionadas a produtos, como cadastro, listagem, atualização e exclusão.

#### 1. Listar todos os Produtos

Retorna uma lista com todos os produtos cadastrados no sistema.

-   **Método:** `GET`
    
-   **Rota:** `/produtos`
    
-   **Resposta (200 OK):** `application/json`
    
    JSON
    
    ```
    [
        {
            "id": 1,
            "nome": "Cimento Votoran",
            "preco": 28.50,
            "estoque": 150,
            "imagemUUID": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
        },
        {
            "id": 2,
            "nome": "Tijolo Baiano (Milheiro)",
            "preco": 850.00,
            "estoque": 45,
            "imagemUUID": "f0e9d8c7-b6a5-4321-fedc-ba0987654321"
        }
    ]
    
    ```
    

#### 2. Detalhar um Produto

Busca e retorna os dados de um produto específico pelo seu `id`.

-   **Método:** `GET`
    
-   **Rota:** `/produtos/{id}`
    
-   **Parâmetro de Rota:**
    
    -   `id` (Long): O ID do produto a ser detalhado.
        
-   **Resposta (200 OK):** `application/json`
    
    JSON
    
    ```
    {
        "id": 1,
        "nome": "Cimento Votoran",
        "preco": 28.50,
        "estoque": 150,
        "imagemUUID": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    }
    
    ```
    
-   **Resposta de Erro (404 Not Found):** Se o produto com o ID especificado não for encontrado.
    

#### 3. Cadastrar um novo Produto

Cria um novo produto. Este endpoint espera uma requisição do tipo `multipart/form-data` para enviar os dados do produto (em JSON) e a imagem.

-   **Método:** `POST`
    
-   **Rota:** `/produtos`
    
-   **Tipo de Requisição:** `multipart/form-data`
    
-   **Partes da Requisição:**
    
    1.  `produto`: um campo de texto contendo uma string JSON com os detalhes do produto.
        
    2.  `imagem`: um campo de arquivo contendo a imagem do produto (ex: `image/jpeg`, `image/png`).
        
-   **Exemplo do conteúdo para a parte `produto`:**
    
    JSON
    
    ```
    {
      "nome": "Argamassa ACIII",
      "preco": 18.75,
      "estoque": 200
    }
    
    ```
    
-   Resposta (201 Created): application/json
    
    Retorna o objeto do produto recém-criado, incluindo o id e o imagemUUID gerados pelo sistema.
    
    JSON
    
    ```
    {
        "id": 3,
        "nome": "Argamassa ACIII",
        "preco": 18.75,
        "estoque": 200,
        "imagemUUID": "11223344-5566-7788-9900-aabbccddeeff"
    }
    
    ```
    
-   **Exemplo com `curl`:**
    
    Bash
    
    ```
    curl -X POST http://localhost:8080/produtos \
    -F 'produto={"nome": "Argamassa ACIII", "preco": 18.75, "estoque": 200}' \
    -F 'imagem=@/caminho/para/sua/imagem.jpg'
    
    ```
    

#### 4. Carregar Imagem de um Produto

Retorna o arquivo de imagem de um produto, identificado pelo seu `UUID`. Ideal para ser usado em tags `<img>` no frontend.

-   **Método:** `GET`
    
-   **Rota:** `/produtos/imagem/{uuid}`
    
-   **Parâmetro de Rota:**
    
    -   `uuid` (UUID): O UUID da imagem associada ao produto.
        
-   **Resposta (200 OK):** O arquivo de imagem binário.
    
-   **Cabeçalhos da Resposta:**
    
    -   `Content-Type`: `image/jpeg`, `image/png`, etc.
        
-   **Exemplo de Uso:**
    
    HTML
    
    ```
    <img src="http://localhost:8080/produtos/imagem/a1b2c3d4-e5f6-7890-1234-567890abcdef" alt="Cimento Votoran">
    
    ```
    

#### 5. Adicionar Estoque a um Produto

Adiciona uma quantidade ao estoque de um produto existente.

-   **Método:** `PUT`
    
-   **Rota:** `/produtos/{id}/estoque`
    
-   **Parâmetro de Rota:**
    
    -   `id` (Long): O ID do produto que terá o estoque atualizado.
        
-   **Corpo da Requisição (Body):** `application/json`
    
    JSON
    
    ```
    {
      "quantidade": 50
    }
    
    ```
    
-   Resposta (200 OK): application/json
    
    Retorna o objeto completo do produto com o estoque atualizado.
    
    JSON
    
    ```
    {
        "id": 1,
        "nome": "Cimento Votoran",
        "preco": 28.50,
        "estoque": 200,
        "imagemUUID": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    }
    
    ```
    

#### 6. Excluir um Produto

Deleta permanentemente um produto do sistema, incluindo sua imagem associada.

-   **Método:** `DELETE`
    
-   **Rota:** `/produtos/{id}`
    
-   **Parâmetro de Rota:**
    
    -   `id` (Long): O ID do produto a ser excluído.
        
-   **Resposta de Sucesso (204 No Content):**
    
    -   Nenhum corpo de resposta é retornado, apenas o status HTTP indica que a operação foi bem-sucedida.
        
-   **Resposta de Erro (404 Not Found):**
    
    -   Se o produto com o ID especificado não for encontrado.
        
-   **Exemplo com `curl`:**
    
    Bash
    
    ```
    curl -X DELETE http://localhost:8080/produtos/3
    
    ```


#### 7. Editar um Produto

Edita os atributos de um produto existente.

-   **Método:** `PUT`

-   **Rota:** `/produtos/{id}`

-   **Parâmetro de Rota:**

    -   `id` (Long): O ID do produto que terá os atributos atualizados.

-   **Tipo de Requisição:** `multipart/form-data`

-   **Partes da Requisição:**

    1.  `produto`: um campo de texto contendo uma string JSON com os detalhes do produto.

    2.  `imagem`: um campo de arquivo contendo a imagem do produto (ex: `image/jpeg`, `image/png`).

    JSON

    ```
    {
        "nome": "Cimento Votoran",
        "preco": 28.50,
    }
    
    ```

-   Resposta (200 OK): application/json

    Retorna o objeto completo do produto com o estoque atualizado.

    JSON

    ```
    {
        "id": 1,
        "nome": "Cimento Votoran",
        "preco": 28.50,
        "estoque": 200,
        "imagemUUID": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
    }
    
    ```



----------

### **Recurso: Pedidos**

Gerencia a criação e consulta de pedidos de compra.

#### 1\. Cadastrar um novo Pedido

Cria um novo pedido com uma lista de itens. O sistema automaticamente debita a quantidade do estoque dos produtos correspondentes.

* **Método:** `POST`
* **Rota:** `/pedidos`
* **Corpo da Requisição (Body):** `application/json`
  Uma lista de itens, cada um contendo o `produtoId` e a `quantidade` desejada.
  ```json
  {
    "itens": [
      {
        "produtoId": 1,
        "quantidade": 5
      },
      {
        "produtoId": 3,
        "quantidade": 10
      }
    ]
  }
  ```
* **Resposta de Sucesso (201 Created):** `application/json`
  Retorna o objeto do pedido criado, com detalhes sobre os itens, data e valor total calculado.
  ```json
  {
      "id": 1,
      "dataPedido": "2025-07-05T13:55:00.123456",
      "valorTotal": 330.00,
      "itens": [
          {
              "id": 1,
              "produto": { "id": 1, "nome": "Cimento Votoran", "preco": 28.50, ... },
              "quantidade": 5,
              "precoUnitario": 28.50
          },
          {
              "id": 2,
              "produto": { "id": 3, "nome": "Argamassa ACIII", "preco": 18.75, ... },
              "quantidade": 10,
              "precoUnitario": 18.75
          }
      ]
  }
  ```
* **Resposta de Erro (400 Bad Request):** Se a quantidade pedida de algum item for maior que o estoque disponível.

-----

#### 2\. Listar todos os Pedidos

Retorna uma lista com todos os pedidos já realizados no sistema.

* **Método:** `GET`
* **Rota:** `/pedidos`
* **Resposta de Sucesso (200 OK):** `application/json`
  ```json
  [
      {
          "id": 1,
          "dataPedido": "2025-07-05T13:55:00.123456",
          "valorTotal": 330.00,
          "itens": [...]
      },
      {
          "id": 2,
          "dataPedido": "2025-07-05T13:57:10.789123",
          "valorTotal": 850.00,
          "itens": [...]
      }
  ]
  ```

-----

#### 3\. Detalhar um Pedido

Busca e retorna os dados de um pedido específico pelo seu `id`.

* **Método:** `GET`
* **Rota:** `/pedidos/{id}`
* **Parâmetro de Rota:**
    * `id` (Long): O ID do pedido a ser detalhado.
* **Resposta de Sucesso (200 OK):** `application/json`
  ```json
  {
      "id": 1,
      "dataPedido": "2025-07-05T13:55:00.123456",
      "valorTotal": 330.00,
      "itens": [
          {
              "id": 1,
              "produto": { "id": 1, "nome": "Cimento Votoran", "preco": 28.50, ... },
              "quantidade": 5,
              "precoUnitario": 28.50
          },
          {
              "id": 2,
              "produto": { "id": 3, "nome": "Argamassa ACIII", "preco": 18.75, ... },
              "quantidade": 10,
              "precoUnitario": 18.75
          }
      ]
  }
  ```
* **Resposta de Erro (404 Not Found):** Se o pedido com o ID especificado não for encontrado.