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

async function iniciarJogo(categoria) {
    try {
        console.log(`Iniciando jogo com categoria: ${categoria}`);
        
        document.getElementById('categorias').style.display = 'none';
        document.getElementById('jogo').style.display = 'block';
        
        const API_URL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000'
            : 'https://music-game-3v45.onrender.com';

        const response = await fetch(`${API_URL}/api/musicas?categoria=${categoria}`);
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
