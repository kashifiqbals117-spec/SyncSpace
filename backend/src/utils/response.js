export const sendResponse = (res, statusCode, data = null, message = null) => {
  const body = {
    success: statusCode >= 200 && statusCode < 300,
  };

  if (message) body.message = message;
  if (data !== null) body.data = data;

  return res.status(statusCode).json(body);
};
