function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.readAsDataURL(file)
  })
}

function extractJsonObject(text) {
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    // fall through
  }

  const match = text.match(/\{[\s\S]*\}/)
  if (!match) return null

  try {
    return JSON.parse(match[0])
  } catch {
    return null
  }
}

async function callVision({ apiKey, model, instruction, file }) {
  const imageUrl = await readAsDataUrl(file)

  const res = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      input: [
        {
          role: 'user',
          content: [
            { type: 'input_text', text: instruction },
            { type: 'input_image', image_url: imageUrl },
          ],
        },
      ],
    }),
  })

  const payload = await res.json().catch(() => ({}))

  if (!res.ok) {
    const message = payload?.error?.message || `Vision request failed (${res.status})`
    throw new Error(message)
  }

  const text = payload?.output_text || ''
  const parsed = extractJsonObject(text)
  if (!parsed) {
    throw new Error('Vision response JSON parse failed')
  }

  return parsed
}

export async function extractTrackingNoFromImage({ apiKey, model, file }) {
  const parsed = await callVision({
    apiKey,
    model,
    file,
    instruction: [
      'Read this shipping/package image and extract tracking number only.',
      'Return JSON only: {"trackingNo":""}',
      'If nothing is found return {"trackingNo":""}.',
      'Keep exact characters with no spaces removed unless clearly formatting separators.',
    ].join(' '),
  })

  return String(parsed.trackingNo || '').trim()
}

export async function extractExpLotFromImage({ apiKey, model, file }) {
  const parsed = await callVision({
    apiKey,
    model,
    file,
    instruction: [
      'Read product package bottom/label image and extract EXP date and LOT number.',
      'Return JSON only: {"exp":"","lot":""}.',
      'If either one is missing, keep that field empty.',
      'For exp, preserve original if unclear, else format as YYYY-MM or YYYY-MM-DD when possible.',
    ].join(' '),
  })

  return {
    exp: String(parsed.exp || '').trim(),
    lot: String(parsed.lot || '').trim(),
  }
}
