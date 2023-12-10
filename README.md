# API-GamesCombos

API de Combos de Jogos de Luta
Esta API foi desenvolvida para armazenar e gerenciar combos utilizados em jogos de luta, como Mortal Kombat, Tekken e Street Fighter. Ela oferece endpoints para realizar operações como login, registro de usuários, adição, listagem, atualização e exclusão de combos.

Configuração do Ambiente
Antes de utilizar a API, é necessário configurar o ambiente. Siga os passos abaixo:

Instale as dependências utilizando o comando:

bash
Copy code
npm install
Crie um arquivo .env na raiz do projeto com as seguintes variáveis:

env
Copy code
PORT=3003
TOKEN_KEY=sua_chave_secreta
Endpoints
1. Login de Usuário
Realiza o login de um usuário cadastrado.

Endpoint: GET /usuario/login
Parâmetros:

nomeUsuario (string): Nome de usuário do usuário.
email (string): E-mail do usuário.
senha (string): Senha do usuário.
Respostas:

200 OK: Retorna um token de autenticação.
400 Bad Request: Erro de validação ou usuário não cadastrado.
500 Internal Server Error: Erro interno no servidor.
2. Listagem de Combos
Lista combos de jogos de luta, permitindo filtrar por nome do personagem ou jogo.

Endpoint: GET /combos
Parâmetros:

filtro (string): Nome do personagem ou jogo para filtrar combos.
ordem (string): Ordem de listagem, pode ser 'asc' (crescente) ou 'desc' (decrescente).
pagina (number): Página de resultados (padrão: 0).
Respostas:

200 OK: Retorna uma lista de combos.
400 Bad Request: Erro de validação ou parâmetros inválidos.
500 Internal Server Error: Erro interno no servidor.
3. Registro de Usuário
Realiza o registro de um novo usuário.

Endpoint: POST /usuario/registro
Corpo da Requisição:

nomeUsuario (string): Nome de usuário do novo usuário.
email (string): E-mail do novo usuário.
senha (string): Senha do novo usuário.
role (string): Papel do novo usuário ('user' ou 'admin').
Respostas:

200 OK: Retorna um token de autenticação.
400 Bad Request: Erro de validação ou usuário já cadastrado.
500 Internal Server Error: Erro interno no servidor.
4. Adição de Combo
Adiciona um novo combo de jogo de luta.

Endpoint: POST /combos/adicionar
Corpo da Requisição:

nomePersonagem (string): Nome do personagem do combo.
jogo (string): Nome do jogo do combo.
combo (string): Sequência do combo.
videoCombo (string): Link do vídeo do combo (opcional).
token (string): Token de autenticação do usuário.
Respostas:

200 OK: Combo adicionado com sucesso.
400 Bad Request: Erro de validação ou parâmetros inválidos.
500 Internal Server Error: Erro interno no servidor.
5. Exclusão de Combo
Exclui um combo existente.

Endpoint: DELETE /combos/deletar
Corpo da Requisição:

token (string): Token de autenticação do usuário.
idCombo (string): ID do combo a ser excluído.
Respostas:

200 OK: Combo deletado com sucesso.
400 Bad Request: Erro de validação ou parâmetros inválidos.
500 Internal Server Error: Erro interno no servidor.
6. Atualização de Combo
Atualiza informações de um combo existente.

Endpoint: PUT /combos/alterar
Corpo da Requisição:

token (string): Token de autenticação do usuário.
idCombo (string): ID do combo a ser atualizado.
nomePersonagem (string): Novo nome do personagem (opcional).
jogo (string): Novo nome do jogo (opcional).
combo (string): Nova sequência do combo (opcional).
videoCombo (string): Novo link do vídeo do combo (opcional).
Respostas:

200 OK: Alteração realizada com sucesso.
400 Bad Request: Erro de validação ou parâmetros inválidos.
500 Internal Server Error: Erro interno no servidor.
Executando a API
Para iniciar a API, utilize o comando:

bash
Copy code
npm start
A API estará acessível em http://localhost:3003.
