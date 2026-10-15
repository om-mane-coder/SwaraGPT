import { NextResponse } from 'next/server';
import { CANONICAL_22_SHRUTIS } from '@/lib/mir/shrutis';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json(CANONICAL_22_SHRUTIS);
}
