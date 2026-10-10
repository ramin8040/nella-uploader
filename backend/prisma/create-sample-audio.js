const fs = require('fs');
const path = require('path');

// Generate a valid minimal 5-second silence/beep MP3 audio file
function createMinimalMp3(outputPath, durationSeconds = 5) {
  const dir = path.dirname(outputPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // MPEG-1 Layer III header: 0xFF, 0xFB (sync + MPEG1 + Layer 3 + no CRC)
  // 0x90: 128 kbps, 44100 Hz, no padding
  // 0x64: Joint stereo, etc.
  // Frame size for 128kbps / 44100Hz = 144 * 128000 / 44100 = 417 bytes
  const frameLength = 417;
  const frame = Buffer.alloc(frameLength, 0);
  frame[0] = 0xff;
  frame[1] = 0xfb;
  frame[2] = 0x90;
  frame[3] = 0x64;

  const totalFrames = Math.floor(durationSeconds * (44100 / 1152));
  const buffer = Buffer.alloc(totalFrames * frameLength);

  for (let i = 0; i < totalFrames; i++) {
    frame.copy(buffer, i * frameLength);
  }

  fs.writeFileSync(outputPath, buffer);
  console.log(`Generated sample audio at: ${outputPath} (${buffer.length} bytes)`);
}

const uploadsDir = path.resolve(__dirname, '../uploads');
createMinimalMp3(path.join(uploadsDir, 'sample_rain.mp3'), 214);
createMinimalMp3(path.join(uploadsDir, 'sample_desert.mp3'), 185);
