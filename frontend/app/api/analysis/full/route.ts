import { NextRequest, NextResponse } from 'next/server';
import { decodeAndAnalyzeAudio } from '@/lib/mir/audioDecoder';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = (formData.get('file') || formData.get('audio_file')) as File | null;
    const targetRaga = (formData.get('target_raga') as string) || 'Yaman';
    const manualTonic = formData.get('manual_tonic_hz') || formData.get('user_sa_hz') || formData.get('user_sa');
    const tonicHz = manualTonic ? parseFloat(manualTonic as string) : 138.59;

    if (!file) {
      return NextResponse.json(
        {
          status: 'silent_audio',
          is_valid_audio: false,
          error_code: 'NO_AUDIO_FILE',
          message: '⚠️ No audio recording or file received.',
          instructions: 'Please upload a singing clip or record via microphone.'
        },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const result = await decodeAndAnalyzeAudio(arrayBuffer, {
      targetRaga,
      manualTonicHz: tonicHz
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Analysis full route error:', error);
    return NextResponse.json(
      {
        status: 'analysis_error',
        is_valid_audio: false,
        message: 'Analysis encountered an error',
        detail: error?.message || String(error)
      },
      { status: 500 }
    );
  }
}
