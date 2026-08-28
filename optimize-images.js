import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectDir = 'd:\\WEBSITES\\zephyr';

async function optimize() {
  console.log('Starting image optimization...');

  // 1. Optimize freestyledecorators.png -> freestyledecorators.webp
  const fsPng = path.join(projectDir, 'freestyledecorators.png');
  const fsWebp = path.join(projectDir, 'freestyledecorators.webp');
  if (fs.existsSync(fsPng)) {
    console.log('Optimizing freestyledecorators.png...');
    const meta = await sharp(fsPng).metadata();
    console.log(`Original dimensions: ${meta.width}x${meta.height}`);
    
    // Resize to max 1200 width to save space if it's huge, while keeping aspect ratio
    let pipeline = sharp(fsPng);
    if (meta.width > 1200) {
      pipeline = pipeline.resize(1200);
    }
    
    await pipeline
      .webp({ quality: 80, effort: 6 })
      .toFile(fsWebp);
      
    const origSize = fs.statSync(fsPng).size;
    const optSize = fs.statSync(fsWebp).size;
    console.log(`Optimized freestyledecorators.png -> webp. Size reduced from ${(origSize/1024/1024).toFixed(2)}MB to ${(optSize/1024).toFixed(2)}KB (${((1 - optSize/origSize)*100).toFixed(1)}% savings).`);
  }

  // 2. Compress other webp images if they exist
  const webpImages = ['haveli.webp', 'panna.webp', 'rajdarbar.webp', 'rkm.webp'];
  for (const img of webpImages) {
    const imgPath = path.join(projectDir, img);
    if (fs.existsSync(imgPath)) {
      const backupPath = imgPath + '.bak';
      fs.copyFileSync(imgPath, backupPath);
      try {
        console.log(`Optimizing ${img}...`);
        const meta = await sharp(backupPath).metadata();
        let pipeline = sharp(backupPath);
        if (meta.width > 1200) {
          pipeline = pipeline.resize(1200);
        }
        await pipeline
          .webp({ quality: 80, effort: 6 })
          .toFile(imgPath);
        
        const origSize = fs.statSync(backupPath).size;
        const optSize = fs.statSync(imgPath).size;
        if (optSize < origSize) {
          console.log(`Reduced ${img} from ${(origSize/1024).toFixed(1)}KB to ${(optSize/1024).toFixed(1)}KB.`);
          fs.unlinkSync(backupPath);
        } else {
          console.log(`Optimization didn't reduce size for ${img}, keeping original.`);
          fs.copyFileSync(backupPath, imgPath);
          fs.unlinkSync(backupPath);
        }
      } catch (err) {
        console.error(`Error optimizing ${img}:`, err);
        if (fs.existsSync(backupPath)) {
          fs.copyFileSync(backupPath, imgPath);
          fs.unlinkSync(backupPath);
        }
      }
    }
  }

  console.log('Image optimization finished!');
}

optimize().catch(err => {
  console.error('Optimization script failed:', err);
});
