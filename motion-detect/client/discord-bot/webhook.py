from discord_webhook import DiscordWebhook

webhook_url = "https://discord.com/api/webhooks/1208551796507672586/9fw9M3z7canK4bXxh1_9W4KZq0PEUjw9c3dkl00yvqk-7_rWpbG5NSuKZEeGdVFHESIT"
webhook = DiscordWebhook(url=webhook_url, content="detected")
response = webhook.execute()
