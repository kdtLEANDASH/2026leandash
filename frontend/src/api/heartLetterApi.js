import apiRequest from "./client";

export function createHeartLetterApi(payload) {
  return apiRequest("/api/heart-letters", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getMyHeartLettersApi() {
  return apiRequest("/api/heart-letters/me", {
    method: "GET",
  });
}

export function getMyHeartLetterApi(heartLetterId) {
  return apiRequest(`/api/heart-letters/me/${heartLetterId}`, {
    method: "GET",
  });
}

export function getReceivedHeartLettersApi() {
  return apiRequest("/api/heart-letters/received", {
    method: "GET",
  });
}

export function getReceivedHeartLetterApi(heartLetterId) {
  return apiRequest(`/api/heart-letters/received/${heartLetterId}`, {
    method: "GET",
  });
}
