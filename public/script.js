let musicasAtuais = [];
let rodadaAtual = 0;
let pontuacao = 0;
let audioPlayer;
const playButton = document.getElementById('play-button');
const playIcon = document.getElementById('play-icon');
const pauseIcon = document.getElementById('pause-icon');

const fallbackMusicas = [
    {
        id: 1,
        nome: 'Música de Exemplo 1',
        artista: 'Artista 1',
        preview_url: 'https://cdns-preview-7.dzcdn.net/stream/c-7b98da5f1c7a1a3a5a5a5a5a5a5a5a5a-128.mp3',
        opcoes: [
            { id: 1, nome: 'Música de Exemplo 1', artista: 'Artista 1' },
            { id: 2, nome: 'Música de Exemplo 2', artista: 'Artista 2' },
            { id: 3, nome: 'Música de Exemplo 3', artista: 'Artista 3' },
            { id: 4, nome: 'Música de Exemplo 4', artista: 'Artista 4' }
        ]
    }
];

// Verifica se o usuário já jogou hoje
function verificarTentativaDiaria() {
    const hoje = new Date().toLocaleDateString();
    const ultimaTentativa = localStorage.getItem('ultimaTentativa');

    if (ultimaTentativa === hoje) {
        alert("Você já jogou hoje! Tente novamente amanhã.");
        return false;
    }

    localStorage.setItem('ultimaTentativa', hoje);
    return true;
}

// Reseta a tentativa automaticamente à meia-noite
function configurarResetDiario() {
    const agora = new Date();
    const proximoReset = new Date();
    proximoReset.setHours(24, 0, 0, 0);

    const tempoAteMeiaNoite = proximoReset - agora;
    setTimeout(() => {
        localStorage.removeItem('ultimaTentativa');
        configurarResetDiario(); // Reconfigura para o próximo dia
    }, tempoAteMeiaNoite);
}

// Inicia o reset diário ao carregar a página
configurarResetDiario();

const resetarTentativasDiarias = () => {
    const hoje = new Date().toISOString().split('T')[0]; // Obtém a data atual (YYYY-MM-DD)
    const ultimaData = localStorage.getItem('ultimaData');

    if (ultimaData !== hoje) {
        localStorage.setItem('ultimaData', hoje);
        localStorage.setItem('tentativasPorCategoria', JSON.stringify({})); // Reseta as tentativas
    }
};

const podeTentarCategoria = (categoria) => {
    resetarTentativasDiarias();
    
    const tentativas = JSON.parse(localStorage.getItem('tentativasPorCategoria')) || {};
    return !tentativas[categoria]; // Retorna true se ainda não jogou a categoria hoje
};

const registrarTentativaCategoria = (categoria) => {
    const tentativas = JSON.parse(localStorage.getItem('tentativasPorCategoria')) || {};
    tentativas[categoria] = true;
    localStorage.setItem('tentativasPorCategoria', JSON.stringify(tentativas));
};


async function iniciarJogo(categoria) {
    if (!podeTentarCategoria(categoria)) {
        alert('Você já jogou essa categoria hoje! Tente novamente amanhã.');
        return;
    }

    try {
        console.log(`Iniciando jogo com categoria: ${categoria}`);
        
        document.getElementById('categorias').style.display = 'none';
        document.getElementById('jogo').style.display = 'block';
        
        const response = await fetch(`http://localhost:3000/api/musicas?categoria=${categoria}`);
        console.log('Resposta da requisição:', response);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao buscar músicas');
        }

        musicasAtuais = await response.json();
        console.log('Músicas carregadas:', musicasAtuais);

        if (musicasAtuais.length === 0) {
            console.warn('Nenhuma música encontrada. Usando fallback...');
            musicasAtuais = fallbackMusicas;
        }

        rodadaAtual = 0;
        pontuacao = 0;

        atualizarPlacar();
        carregarPergunta();

    } catch (error) {
        console.error('Erro detalhado:', error);
        alert(`Erro: ${error.message}`);
        voltarParaCategorias();
    }
}

function carregarPergunta() {
    if (rodadaAtual >= 5) {
        finalizarJogo();
        return;
    }

    const musica = musicasAtuais[rodadaAtual];

    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
    }

    audioPlayer = new Audio(musica.preview_url);
    audioPlayer.volume = 1.0;

    audioPlayer.addEventListener('timeupdate', atualizarBarraProgresso);

    const opcoes = document.getElementById('opcoes');
    opcoes.innerHTML = '';

    musica.opcoes.forEach(opcao => {
        const button = document.createElement('button');
        button.className = 'opcao-button';
        button.innerText = `${opcao.nome} - ${opcao.artista}`;
        button.onclick = () => verificarResposta(opcao.id === musica.id, button);
        opcoes.appendChild(button);
    });

    document.getElementById('proxima-button').disabled = true;
    playIcon.style.display = 'block';
    pauseIcon.style.display = 'none';
}

function atualizarPlacar() {
    const placar = document.getElementById('placar');
    placar.textContent = `Rodada ${rodadaAtual + 1}/5 • Pontos: ${pontuacao}`;
}

function atualizarBarraProgresso() {
    const progressBar = document.querySelector('.progress');
    const porcentagem = (audioPlayer.currentTime / audioPlayer.duration) * 100;
    progressBar.style.width = `${porcentagem}%`;
}

function verificarResposta(correta, buttonClicado) {
    const botoes = document.querySelectorAll('.opcao-button');
    botoes.forEach(b => b.disabled = true);

    if (correta) {
        buttonClicado.classList.add('correta');
        pontuacao++;
    } else {
        buttonClicado.classList.add('incorreta');
        botoes.forEach(b => {
            if (b.innerText === `${musicasAtuais[rodadaAtual].nome} - ${musicasAtuais[rodadaAtual].artista}`) {
                b.classList.add('correta');
            }
        });
    }

    atualizarPlacar();
    document.getElementById('proxima-button').disabled = false;
}

function proximaPergunta() {
    rodadaAtual++;
    carregarPergunta();
}

function finalizarJogo() {
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
    }

    const porcentagemAcertos = (pontuacao / 5) * 100;
    const mensagem = `
        Fim do jogo!
        Pontuação final: ${pontuacao} de 5 (${porcentagemAcertos}%)
        ${porcentagemAcertos === 100 ? '🏆 Perfeito!' : 
          porcentagemAcertos >= 80 ? '👏 Muito bom!' :
          porcentagemAcertos >= 60 ? '😊 Bom trabalho!' : '😅 Continue tentando!'}
    `;

    alert(mensagem);
    registrarTentativaCategoria(categoria); // Registra a tentativa dessa categoria
    voltarParaCategorias();
}

function voltarParaCategorias() {
    document.getElementById('categorias').style.display = 'block';
    document.getElementById('jogo').style.display = 'none';
    if (audioPlayer) {
        audioPlayer.pause();
        audioPlayer = null;
    }
}

playButton.addEventListener('click', () => {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playIcon.style.display = 'none';
        pauseIcon.style.display = 'inline';
    } else {
        audioPlayer.pause();
        pauseIcon.style.display = 'none';
        playIcon.style.display = 'inline';
    }
});
