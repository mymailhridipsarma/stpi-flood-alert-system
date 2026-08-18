// Telegram Alert Helper for AquaPulse Web Dashboard

export const getTelegramConfig = () => {
  return {
    botToken: localStorage.getItem('TELEGRAM_BOT_TOKEN') || '8826309434:AAE_FOaeYVT5B9z7kxjM_09Xk89ITyM3ceI',
    chatId: localStorage.getItem('TELEGRAM_CHAT_ID') || '1618261785'
  };
};

export const sendTelegramAlert = async (status, waterLevelCm, deviceId = 'DEV-ESP32-MAIN-001') => {
  const { botToken, chatId } = getTelegramConfig();

  if (!botToken || !chatId) return false;

  const statusUpper = (status || 'DANGER').toUpperCase();
  const statusEmoji = statusUpper === 'DANGER' ? '🔴' : (statusUpper === 'RISKY' ? '🟡' : '🟢');

  const text = `
<b>🚨 AquaPulse Emergency Flood Alert</b>

<b>System Node:</b> AquaPulse Flood Node (${deviceId})
<b>Alert Level:</b> ${statusUpper} ${statusEmoji}
<b>Water Level:</b> ${Number(waterLevelCm || 0).toFixed(1)} cm
<b>Time:</b> ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}

⚠️ <i>CRITICAL WARNING! Water level has reached dangerous depth. Immediate safety response required!</i>
  `.trim();

  try {
    const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
    const data = await res.json();
    return data.ok;
  } catch (err) {
    console.error("Telegram Web Alert Error:", err);
    return false;
  }
};
