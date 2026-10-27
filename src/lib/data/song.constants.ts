import type { Song, SongInput } from './song.types';

export const COMPAS_OPTIONS = ['4/4', '3/4', '2/4', '6/8', '12/8'] as const;
export const TEMPO_MIN = 20;
export const TEMPO_MAX = 300;

export const DEFAULT_SONG_INPUT: SongInput = {
    title: '',
    artist: '',
    album: '',
    key: 'G',
    tempo: 120,
    compas: '4/4',
    body: '',
};

/** Extrae los campos editables de una canción completa. */
export function toSongInput(song: Song): SongInput {
    return {
        title: song.title,
        artist: song.artist,
        album: song.album,
        imageUrl: song.imageUrl,
        key: song.key,
        tempo: song.tempo,
        compas: song.compas,
        body: song.body,
    };
}