


export function sendSuccess(res, data, message = "OK") {
  return res.json({ success: true, message, data });
}

export function sendError(res, statusCode, message) {
  return res.status(statusCode).json({ success: false, message });
}
