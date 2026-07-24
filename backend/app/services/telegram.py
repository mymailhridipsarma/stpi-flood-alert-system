import urllib.request
import urllib.parse
import json
from app.config import settings

def send_telegram_notification(message: str, bot_token: str = None, chat_id: str = None) -> bool:
    """
    Sends a formatted alert message via Telegram Bot API using urllib.
    """
    token = bot_token or settings.TELEGRAM_BOT_TOKEN
    cid = chat_id or settings.TELEGRAM_CHAT_ID

    if not token or not cid:
        print("[TELEGRAM] Bot Token or Chat ID is missing. Notification skipped.")
        return False

    try:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = json.dumps({
            "chat_id": cid,
            "text": message,
            "parse_mode": "HTML"
        }).encode('utf-8')
        
        req = urllib.request.Request(
            url, 
            data=payload, 
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req, timeout=8) as response:
            res = json.loads(response.read().decode('utf-8'))
            success = res.get('ok', False)
            print(f"[TELEGRAM ALERT] Status: {success}")
            return success
    except Exception as e:
        print(f"[TELEGRAM ERROR] Failed to send Telegram alert: {str(e)}")
        return False
