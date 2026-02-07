import { NextResponse } from 'next/server';
// import prisma from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { key: string } }
) {
    if (params.key === 'health') return NextResponse.json({ status: 'ok' });

    const key = params.key;

    try {
        /*
        const record = await prisma.appStorage.findUnique({
            where: { key },
        });

        if (!record) {
            return NextResponse.json({ value: null }, { status: 404 });
        }

        return NextResponse.json({ value: record.value });
        */
        return NextResponse.json({ value: null });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
    }
}

export async function POST(
    request: Request,
    { params }: { params: { key: string } }
) {
    const key = params.key;

    try {
        const body = await request.json();
        const { value } = body;

        if (!value) {
            return NextResponse.json({ error: 'Value is required' }, { status: 400 });
        }

        /*
        await prisma.appStorage.upsert({
            where: { key },
            update: { value },
            create: { key, value },
        });
        */

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Database Error:', error);
        return NextResponse.json({ error: 'Failed to save data' }, { status: 500 });
    }
}
