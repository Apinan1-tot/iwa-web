/*!
 * promptpay-payload.js
 * Builds an EMV-compliant PromptPay QR payload string (Thailand).
 * Independent implementation of the public PromptPay/EMV QR spec, written for IWA Rich U D.
 * CRC16/CCITT-FALSE (poly 0x1021, init 0xFFFF) verified against known reference payloads.
 *
 * NOTE: On this site the generated QR is explicitly labeled as a DEMO —
 * it is not linked to any live merchant account.
 */
(function (global) {
  'use strict';

  function crc16ccitt(str) {
    var crc = 0xFFFF;
    for (var i = 0; i < str.length; i++) {
      crc ^= (str.charCodeAt(i) << 8);
      for (var j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xFFFF : (crc << 1) & 0xFFFF;
      }
    }
    return crc;
  }

  function tlv(id, value) {
    var len = ('00' + String(value).length).slice(-2);
    return id + len + value;
  }

  function sanitizeDigits(id) {
    return String(id).replace(/[^0-9]/g, '');
  }

  function formatTarget(id) {
    var numbers = sanitizeDigits(id);
    if (numbers.length >= 13) return numbers;
    // mobile number -> 13-digit format: 66 + number without leading 0, zero-padded
    return ('0000000000000' + numbers.replace(/^0/, '66')).slice(-13);
  }

  function buildPromptPayPayload(target, amount) {
    var numbers = sanitizeDigits(target);
    var targetType = numbers.length >= 15 ? '03' : numbers.length >= 13 ? '02' : '01';
    var hasAmount = amount !== undefined && amount !== null && amount > 0;

    var merchantInfo = tlv('00', 'A000000677010111') + tlv(targetType, formatTarget(target));

    var parts = [
      tlv('00', '01'),                         // Payload Format Indicator
      tlv('01', hasAmount ? '12' : '11'),       // Point of Initiation Method
      tlv('29', merchantInfo),                  // Merchant Account Info (PromptPay GUID)
      tlv('58', 'TH'),                          // Country Code
      tlv('53', '764')                          // Transaction Currency THB
    ];
    if (hasAmount) parts.push(tlv('54', Number(amount).toFixed(2)));

    var withoutCrc = parts.join('') + '6304';
    var crc = crc16ccitt(withoutCrc).toString(16).toUpperCase();
    while (crc.length < 4) crc = '0' + crc;

    return withoutCrc + crc;
  }

  global.buildPromptPayPayload = buildPromptPayPayload;
})(window);
