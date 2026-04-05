import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tailwindcss(),
    react(),
    {
      name: 'file-save-api',
      configureServer(server) {
        server.middlewares.use('/api/save-file', (req, res) => {
          if (req.method === 'POST') {
            let body: any[] = [];
            req.on('data', chunk => body.push(chunk));
            req.on('end', () => {
              const buffer = Buffer.concat(body);
              const fileName = req.url?.split('?filename=')[1] || 'output.docx';
              // Decode URI component incase of hebrew characters
              const decodedFileName = decodeURIComponent(fileName);
              const caseIdMatch = decodedFileName.match(/טיוטה_(.+)_סופי/);
              // Infer folder from case or just drop in cases/
              let folderName = caseIdMatch ? caseIdMatch[1].replace(/_/g, '-') : 'general';
              if (folderName === 'דימה-רודניצקי') folderName = 'dima-rodnitski';
              
              const saveDir = path.resolve(__dirname, 'cases', folderName, 'final');
              if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
              }
              const savePath = path.join(saveDir, decodedFileName);
              
              fs.writeFileSync(savePath, buffer);
              res.statusCode = 200;
              res.end(JSON.stringify({ success: true, path: savePath }));
            });
          } else {
            res.statusCode = 405;
            res.end();
          }
        });
      }
    }
  ],
})
