/**
 * Serviço de envio de notificações push do MusiConnect.
 *
 * Este arquivo contém função para enviar notificações push via Expo.
 * Importe e utilize para notificar usuários sobre interações.
 */

/**
 * Envia uma notificação push para um usuário
 * @param pushToken Expo push token do usuário
 * @param title Título da notificação
 * @param body Corpo da notificação
 * @param data Dados extras (opcional)
 */
export async function sendPushNotification(pushToken: string, title: string, body: string, data?: Record<string, unknown>) {
  const message = {
    to: pushToken,
    sound: 'default',
    title,
    body,
    data,
  };

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });
    return await response.json();
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('Erro ao enviar push:', error.message);
    } else {
      console.error('Erro ao enviar push:', error);
    }
    return null;
  }
}
