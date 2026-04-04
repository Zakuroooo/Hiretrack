import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#080c14',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            marginBottom: '32px',
          }}
        >
          <div style={{ fontSize: '72px', color: '#0ea5e9' }}>⚡</div>
          <div
            style={{
              fontSize: '64px',
              fontWeight: 800,
              color: '#e2f0ff',
            }}
          >
            HireTrack
          </div>
        </div>
        <div
          style={{
            fontSize: '28px',
            color: '#7096b8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: 1.4,
          }}
        >
          AI-Powered Job Application Tracker
        </div>
        <div
          style={{
            marginTop: '24px',
            fontSize: '20px',
            color: '#3d5a7a',
          }}
        >
          hiretrack-brown.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  )
}
