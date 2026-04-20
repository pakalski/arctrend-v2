export default function Home() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#0f172a', 
      color: 'white', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      fontFamily: 'system-ui'
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '48px', marginBottom: '16px' }}>✅ ArcTrend is Live!</h1>
        <p style={{ fontSize: '24px', color: '#64748b' }}>
          Your Arc Testnet Adoption Dashboard
        </p>
        <p style={{ marginTop: '40px', color: '#64748b' }}>
          Contract deployed: 0x5391d64389995d86dDb7a8FfdC4F8d854B61a0FF
        </p>
        <p style={{ marginTop: '60px', fontSize: '18px' }}>
          Full dashboard coming in next update...
        </p>
      </div>
    </div>
  );
}
