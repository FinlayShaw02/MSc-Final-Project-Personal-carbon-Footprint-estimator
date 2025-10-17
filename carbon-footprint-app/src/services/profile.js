/**
 * ============================================================
 *  File: profile.js
 *  Module: Profile Service
 *
 *  Description:
 *  Provides API utilities for managing user profile data,
 *  account updates, and password changes. Wraps the centralised
 *  `api` service to ensure consistent request structure and error handling.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { api } from "./api";

// already have:
export const getProfile = () => api.get("/profile.php");
export const patchProfile = (patch) => api.patch("/profile.php", patch);
export const deleteAccount = () => api.delete("/profile.php");

// add:
export const changePassword = (payload) =>
  api.post("/change_password.php", payload);
