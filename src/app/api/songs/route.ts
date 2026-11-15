import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { authorizeApi } from '@/server/auth/guard';
import { createSong, listSongs } from '@/server/songs';
import { parseSongInput } from '@/validation/song';

export async function GET() {
    return NextResponse.json(await listSongs());
}

export async function POST(req: Request) {
    const auth = await authorizeApi('song:create');
    if (!auth.ok) return auth.response;

    const body: unknown = await req.json().catch(() => null);
    const parsed = parseSongInput(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const song = await createSong(parsed.value, auth.user.id);
    revalidatePath('/songs');
    return NextResponse.json(song, { status: 201 });
}