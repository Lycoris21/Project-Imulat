export async function handleAPIError(response) {
  const data = await response.json();
  let message = "An error occurred.";

  if (Array.isArray(data.details)) {
    message = data.details.map((e) => `• ${e.msg}`).join("\n");
  } else if (data.message) {
    message = data.message;
  } else if (data.error) {
    message = data.error;
  }

  throw new Error(message);
}
