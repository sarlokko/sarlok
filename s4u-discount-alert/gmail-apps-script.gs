/**
 * Gmail webhook for the S4U Reddit Devvit monitor.
 *
 * Required Script Properties:
 * - WEBHOOK_TOKEN: the same random token configured in Devvit.
 * - ALERT_RECIPIENT: the only email address allowed as recipient.
 */
function doPost(event) {
  const lock = LockService.getScriptLock()
  lock.waitLock(10000)

  try {
    const properties = PropertiesService.getScriptProperties()
    const expectedToken = properties.getProperty('WEBHOOK_TOKEN')
    const expectedRecipient = properties.getProperty('ALERT_RECIPIENT')
    if (!expectedToken || !expectedRecipient) {
      return jsonResponse({ok: false, error: 'Script Properties are incomplete'})
    }

    const payload = JSON.parse(event.postData.contents)
    if (payload.token !== expectedToken) {
      return jsonResponse({ok: false, error: 'Unauthorized'})
    }
    if (payload.recipient !== expectedRecipient) {
      return jsonResponse({ok: false, error: 'Recipient is not allowed'})
    }
    if (
      !payload.notificationId ||
      !payload.subject ||
      !payload.textBody ||
      !payload.htmlBody
    ) {
      return jsonResponse({ok: false, error: 'Invalid message payload'})
    }

    const deliveryKey = `delivered:${payload.notificationId}`
    if (properties.getProperty(deliveryKey)) {
      return jsonResponse({ok: true, duplicate: true})
    }

    GmailApp.sendEmail(
      payload.recipient,
      payload.subject,
      payload.textBody,
      {
        htmlBody: payload.htmlBody,
        name: 'S4U Reddit Alert',
      },
    )
    properties.setProperty(deliveryKey, new Date().toISOString())
    return jsonResponse({ok: true})
  } catch (error) {
    return jsonResponse({ok: false, error: String(error)})
  } finally {
    lock.releaseLock()
  }
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
