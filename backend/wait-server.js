import waitPort from 'wait-port';
import './server.js'; // tu archivo principal del backend

async function main() {
  console.log('⏳ Esperando a que PostgreSQL esté listo...');
  const open = await waitPort({ host: 'db', port: 5432, timeout: 30000 });
  
  if (open) {
    console.log('✅ PostgreSQL listo, iniciando backend...');
    // Aquí tu server.js se ejecutará automáticamente
  } else {
    console.error('❌ Timeout esperando PostgreSQL');
    process.exit(1);
  }
}

main();
