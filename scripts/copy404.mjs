// Copia index.html como 404.html después de compilar.
// GitHub Pages solo sirve archivos que existen. Si alguien recarga en /jardin-sullivan-demo/login,
// no hay un archivo "login" y mostraría un error 404; con esta copia, GitHub entrega la app
// de React en su lugar y React Router dibuja la pantalla correcta.
import { copyFileSync } from 'node:fs';

copyFileSync('dist/index.html', 'dist/404.html');
console.log('dist/404.html creado');
