// server.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Mapeamento de categorias para IDs de playlists/charts do Deezer
const categoriasMap = {
    'mpb': {
        type: 'playlist',
        id: '9956639542'
    },
    'pop_internacional': {
        type: 'playlist',
        id: '2251932286'
    },
    'trapbr': {
        type: 'playlist',
        id: '9526912002'
    },
    'rapbr': {
        type: 'playlist',
        id: '10411914742'
    },
    'hitsbr': {
        type: 'playlist',
        id: '1001939451'
    },
    'hiphop': {
        type: 'playlist',
        id: '9760371462'
    },
    'kpop': {
        type: 'playlist',
        id: '4096400722'
    },
    'jazz': {
        type: 'playlist',
        id: '1311336155'
    },
    'rock': {
        type: 'playlist',
        id: '1306931615'
    },
    'reb': {
        type: 'playlist',
        id: '2021626162'
    },
    'anime': {
        type: 'playlist',
        id: '7967291482'
    },
    'sertanejo': {
        type: 'playlist',
        id: '744341893'
    },
    'rockbr': {
        type: 'playlist',
        id: '3993310062'
    },
    'samba': {
        type: 'playlist',
        id: '11419090924'
    },
    'pagode': {
        type: 'playlist',
        id: '754903963'
    },
    'forro': {
        type: 'playlist',
        id: '2965223166'
    },
    'reggae': {
        type: 'playlist',
        id: '12141400851'
    },
    'funk': {
        type: 'playlist',
        id: '4278233422'
    },
    'mtg': {
        type: 'playlist',
        id: '12744125581'
    },
    'eletronica': {
        type: 'playlist',
        id: '1037632541'
    },
    'anos2000eua': {
        type: 'playlist',
        id: '11691279124'
    },
    'anos2000br': {
        type: 'playlist',
        id: '5691936222'
    },
    'hinos': {
        type: 'playlist',
        id: '13447559523'
    },
    'gamer': {
        type: 'playlist',
        id: '13408747443'
    },
    'theweeknd': {
        type: 'artist',
        id: '4050205'
    },
    'lanadelrey': {
        type: 'artist',
        id: '1424821'
    },
    'classica': {
        type: 'playlist',
        id: '8251956682'
    },
    'anos80': {
        type: 'playlist',
        id: '4322027746'
    },
    'anos90': {
        type: 'playlist',
        id: '11798812881'
    },
    'filme': {
        type: 'playlist',
        id: '11444075144'
    },
};

// Função para buscar músicas no Deezer
async function buscarMusicasDeezer(categoria, limit = 200) {
    const categoriaInfo = categoriasMap[categoria];
    
    if (!categoriaInfo) {
        throw new Error('Categoria não encontrada');
    }

    try {
        let tracks = [];
        let shouldFilterByArtist = false;
        let artistId = null;

        if (categoriaInfo.type === 'artist') {
            // Buscar as músicas diretamente do artista
            const artistTracksUrl = `https://api.deezer.com/artist/${categoriaInfo.id}/top?limit=100`;
            const response = await axios.get(artistTracksUrl);
            
            if (response.data && response.data.data) {
                tracks = response.data.data;
            }
            shouldFilterByArtist = true;
            artistId = categoriaInfo.id;
        } else if (categoriaInfo.type === 'playlist') {
            const response = await axios.get(`https://api.deezer.com/playlist/${categoriaInfo.id}/tracks`);
            tracks = response.data.data;
        } else if (categoriaInfo.type === 'chart') {
            const response = await axios.get(`https://api.deezer.com/chart/${categoriaInfo.id}`);
            tracks = response.data.tracks.data;
        }

        // Filtrar músicas com preview disponível
        tracks = tracks.filter(track => track.preview && track.preview.length > 0);

        // Se for artista, garantir que só pegamos músicas dele
        if (shouldFilterByArtist) {
            tracks = tracks.filter(track => track.artist.id.toString() === artistId);
        }

        // Garantir que temos músicas suficientes
        if (tracks.length === 0) {
            throw new Error('Nenhuma música encontrada para este artista');
        }

        // Embaralhar e limitar ao número desejado
        tracks = tracks.sort(() => 0.5 - Math.random()).slice(0, Math.min(limit, tracks.length));

        return tracks.map(track => {
            // Criar opções para o quiz
            let outrasOpcoes;
            
            if (shouldFilterByArtist) {
                // Para artistas, usar apenas outras músicas do mesmo artista
                outrasOpcoes = tracks
                    .filter(t => t.id !== track.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(t => ({
                        id: t.id,
                        nome: t.title,
                        artista: t.artist.name
                    }));
            } else {
                // Para playlists, manter o comportamento original
                outrasOpcoes = tracks
                    .filter(t => t.id !== track.id)
                    .sort(() => 0.5 - Math.random())
                    .slice(0, 3)
                    .map(t => ({
                        id: t.id,
                        nome: t.title,
                        artista: t.artist.name
                    }));
            }

            const opcoes = [
                {
                    id: track.id,
                    nome: track.title,
                    artista: track.artist.name
                },
                ...outrasOpcoes
            ].sort(() => 0.5 - Math.random());

            return {
                id: track.id,
                nome: track.title,
                artista: track.artist.name,
                preview_url: track.preview,
                capa: track.album.cover_medium,
                opcoes
            };
        });
    } catch (error) {
        console.error('Erro ao buscar músicas:', error);
        throw error;
    }
}

app.get('/api/musicas', async (req, res) => {
    const { categoria, limit } = req.query;
    
    if (!categoria) {
        return res.status(400).json({ error: 'Categoria não informada' });
    }

    const limiteNumerico = parseInt(limit) > 0 ? parseInt(limit) : 200;

    try {
        const musicas = await buscarMusicasDeezer(categoria, limiteNumerico);
        res.json(musicas);
    } catch (error) {
        console.error('Erro:', error.message);
        res.status(500).json({ 
            error: 'Erro ao buscar músicas',
            details: error.message 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});