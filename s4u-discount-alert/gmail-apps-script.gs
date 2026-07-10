/**
 * Gmail webhook for the S4U Reddit Devvit monitor.
 *
 * Required Script Properties:
 * - WEBHOOK_TOKEN: the same random token configured in Devvit.
 * - ALERT_RECIPIENT: the only email address allowed as recipient.
 */
function doPost(event) {
  var properties = PropertiesService.getScriptProperties()
  var payload = JSON.parse(event.postData.contents)

  if (payload.token !== properties.getProperty('WEBHOOK_TOKEN')) {
    return jsonResponse({ok: false, error: 'Unauthorized'})
  }

  if (payload.recipient !== properties.getProperty('ALERT_RECIPIENT')) {
    return jsonResponse({ok: false, error: 'Recipient not allowed'})
  }

  var deliveryKey = 'delivered_' + payload.notificationId
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
}

function jsonResponse(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
