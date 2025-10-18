# Jogo de Cartas - Projeto Web

Bem-vindo ao nosso projeto de Jogo de Cartas! Este é um jogo para dois jogadores desenvolvido utilizando apenas tecnologias web puras: HTML, CSS e JavaScript, sem o uso de bibliotecas ou frameworks externos. O foco do projeto é a manipulação dinâmica do DOM, a aplicação de lógica de jogo com JavaScript e a criação de uma interface limpa e responsiva.


## ✨ Funcionalidades

O jogo foi construído para atender aos seguintes requisitos:

* **Dois Jogadores:** Partidas para dois jogadores humanos na mesma tela.
* **Página Inicial:** Uma tela de configuração para inserir os nomes dos jogadores antes de iniciar o jogo.
* **Animações e Efeitos Visuais:**
    * Animação de cartas movendo-se da mão do jogador para a mesa.
    * Transições suaves e destaques visuais para o jogador da vez.
    * Mudança de estilo de elementos (cartas, botões) com base em eventos do jogo.
* **Elementos Dinâmicos (DOM):**
    * **Tabela de Placar:** Exibe os nomes e a pontuação, atualizada dinamicamente a cada turno.
    * **Lista de Histórico:** Registra as cartas jogadas em uma lista que é atualizada em tempo real.
* **Lógica em JavaScript:**
    * Classes para abstrair `Player`, `Card` e `Game`, organizando a lógica do jogo.
    * Sistema de turnos, distribuição de cartas e lógica de pontuação.
    * Eventos de clique para jogar cartas e botões para finalizar o turno ou resetar o jogo.
* **Layout Organizado:** A interface do jogo possui um layout claro, separando a mesa, as mãos dos jogadores, o placar e o histórico, com uma responsividade mínima.

## 💻 Tecnologias Utilizadas

Este projeto foi desenvolvido utilizando exclusivamente as seguintes tecnologias:

* **HTML5:** Para a estrutura semântica das páginas.
* **CSS3:** Para estilização, layout (Grid/Flexbox) e animações.
* **JavaScript (ES6+):** Para toda a lógica do jogo, manipulação do DOM e gerenciamento de eventos.

## ▶️ Como Jogar

1.  Abra o arquivo `index.html` em seu navegador.
2.  Na página inicial, insira o nome do Jogador 1 e do Jogador 2 nos campos designados.
3.  Clique no botão "Iniciar Jogo".
4.  Você será redirecionado para a página do jogo, onde as cartas serão distribuídas e a partida começará.
5.  Siga as regras do jogo, clique nas cartas para jogá-las e use os botões de controle para avançar os turnos.
