import { NextResponse } from 'next/server';
import proxyData from '../../../../data/statikproxy.json';

export async function GET() {
    // Возвращаем данные о статичных прокси-провайдерах
    return NextResponse.json(proxyData.Data.proxy.staticProxy.tools);
}

export const dynamic = 'force-dynamic';
export const revalidate = 0; 