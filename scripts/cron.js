// scripts/cron.js

const cron = require('node-cron');
const { exec } = require('child_process');
const path = require('path');

// Расписание: каждый день в 03:00 по серверному времени
cron.schedule('0 3 * * *', () => {
  console.log('[cron] Запуск updateDexs.js в', new Date().toLocaleString());
  exec('yarn generate-dexs', {
    cwd: path.resolve(__dirname, '..')
  }, (err, stdout, stderr) => {
    if (err) {
      console.error('[cron] Ошибка при генерации:', err);
    } else {
      console.log('[cron] Результат generate-dexs:\n', stdout);
      if (stderr) console.warn('[cron] stderr:\n', stderr);
    }
  });
});

// Чтобы cron.js не завершался сразу:
console.log('[cron] Планировщик запущен — обновление data/dexs.json каждый день в 03:00');