import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { deleteSong, getSongById, updateSong } from '@/server/songs';
import { parseSongUpdate } from '@/domain/song/validation';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
    const { id } = await params;
    const song = await getSongById(id);
    return song ? NextResponse.json(song) : NextResponse.json({ error: 'No encontrada' }, { status: 404 });
}

export async function PATCH(req: Request, { params }: Ctx) {
    const { id } = await params;
    const body: unknown = await req.json().catch(() => null);
    const parsed = parseSongUpdate(body);
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 });

    const song = await updateSong(id, parsed.value);
    if (!song) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });

    revalidatePath(`/songs/${id}`, 'layout');
    revalidatePath('/songs');
    return NextResponse.json(song);
}

export async function DELETE(_req: Request, { params }: Ctx) {
    const { id } = await params;
    const ok = await deleteSong(id);
    if (!ok) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
    revalidatePath('/songs');
    return new NextResponse(null, { status: 204 });
}