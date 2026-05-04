export async function sendSlackErrorNotification(message){
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
    return;
    }

    try {
        await fetch(webhookUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            text: message,
        }),
        });
    } catch (error) {
        console.error("Error enviando notificación a Slack:", error.message);
    }
}