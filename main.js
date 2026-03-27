import watermark from 'watermarkjs';

const watermarkInput = document.getElementById('watermarkInput');
const folderInput = document.getElementById('folderInput');
const applyBtn = document.getElementById('applyBtn');
const fileCount = document.getElementById('fileCount');
const watermarkPreview = document.getElementById('watermarkPreview');
const progress = document.getElementById('progress');
const progressText = document.getElementById('progressText');
const progressFill = document.getElementById('progressFill');
const results = document.getElementById('results');

let watermarkFile = null;
let imageFiles = [];

function updateButton() {
  applyBtn.disabled = !(watermarkFile && imageFiles.length > 0);
}

watermarkInput.addEventListener('change', (e) => {
  watermarkFile = e.target.files[0] || null;
  watermarkPreview.innerHTML = '';
  if (watermarkFile) {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(watermarkFile);
    watermarkPreview.appendChild(img);
  }
  updateButton();
});

folderInput.addEventListener('change', (e) => {
  imageFiles = Array.from(e.target.files).filter((f) =>
    /\.(jpe?g|png)$/i.test(f.name)
  );
  fileCount.textContent = imageFiles.length
    ? `${imageFiles.length} image(s) found`
    : 'No JPG/PNG images found in folder';
  updateButton();
});

applyBtn.addEventListener('click', async () => {
  applyBtn.disabled = true;
  results.innerHTML = '';
  progress.hidden = false;

  for (let i = 0; i < imageFiles.length; i++) {
    const file = imageFiles[i];
    progressText.textContent = `Processing ${i + 1} / ${imageFiles.length}: ${file.name}`;
    progressFill.style.width = `${((i + 1) / imageFiles.length) * 100}%`;

    try {
      const img = await watermark([file, watermarkFile])
        .image(function tile(source, wm) {
          const canvas = document.createElement('canvas');
          canvas.width = source.width;
          canvas.height = source.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(source, 0, 0);
          ctx.globalAlpha = 0.5;
          for (let y = 0; y < canvas.height; y += wm.height) {
            for (let x = 0; x < canvas.width; x += wm.width) {
              ctx.drawImage(wm, x, y);
            }
          }
          return canvas;
        });

      const card = document.createElement('div');
      card.className = 'result-card';

      const label = document.createElement('p');
      label.textContent = file.name;

      const link = document.createElement('a');
      link.href = img.src;
      link.download = `watermarked_${file.name}`;
      link.textContent = 'Download';
      link.className = 'download-link';

      card.appendChild(img);
      card.appendChild(label);
      card.appendChild(link);
      results.appendChild(card);
    } catch (err) {
      const card = document.createElement('div');
      card.className = 'result-card error';
      card.textContent = `Failed: ${file.name} — ${err.message}`;
      results.appendChild(card);
    }
  }

  progressText.textContent = 'Done!';
  updateButton();
});
