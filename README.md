# IronPeersApi

## Sobre o Projeto
IronPeersApi é uma API robusta projetada para facilitar a interação e colaboração entre colegas em um ambiente educacional. Este projeto permite que os usuários gerenciem informações de perfil, interajam através de fóruns, e compartilhem recursos educacionais.

## Tecnologias Utilizadas
- Node.js
- Express
- MongoDB
- Docker

## Configuração Inicial

### Pré-requisitos
Antes de iniciar, instale as seguintes ferramentas:
- [Node.js](https://nodejs.org/en/download/)
- [MongoDB](https://www.mongodb.com/try/download/community)
- Gerenciador de pacotes [npm](https://www.npmjs.com/get-npm)

### Instalação
Clone o repositório para sua máquina local usando:
```bash
git clone https://github.com/digomattar21/IronPeersApi.git
cd IronPeersApi
```

Instale todas as dependências necessárias:
```bash
npm install
```

### Configuração de Variáveis de Ambiente
Copie o arquivo `.env.example` para um novo arquivo chamado `.env` e modifique conforme necessário para se adequar ao seu ambiente de desenvolvimento:
```bash
cp .env.example .env
```

Preencha o `.env` com as configurações apropriadas de conexão com o banco de dados, portas e outras variáveis relevantes.

## Executando a Aplicação

Para iniciar o servidor:
```bash
npm start
```

O servidor estará acessível em `http://localhost:3000` ou na porta que você configurou no arquivo `.env`.

## Contribuindo
Contribuições são altamente encorajadas! Se deseja contribuir, por favor:
1. Faça um fork do repositório.
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`).
3. Faça commit de suas mudanças (`git commit -m 'Add some AmazingFeature'`).
4. Push para a branch (`git push origin feature/AmazingFeature`).
5. Abra um Pull Request.
