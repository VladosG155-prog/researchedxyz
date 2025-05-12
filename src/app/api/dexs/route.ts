// src/app/api/dexs/route.ts
import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import { join } from 'path'

export async function GET() {
  const file = await fs.readFile(join(process.cwd(),'data','dexs.json'),'utf8')
  return new NextResponse(file, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600'
    }
  })
}