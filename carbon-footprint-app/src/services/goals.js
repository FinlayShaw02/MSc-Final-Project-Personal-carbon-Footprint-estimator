/**
 * ============================================================
 *  File: goals.js
 *  Module: Goals Service
 *
 *  Description:
 *  Provides CRUD (Create, Read, Update, Delete) operations for
 *  user goals via the backend API. Wraps the `api` service to
 *  standardise requests and manage endpoint paths.
 *
 *  Author: Finlay Shaw
 * ============================================================
 */

import { api } from "./api";

export const listGoals   = (active) => api.get(`/goals.php${active != null ? `?active=${+!!active}` : ""}`);
export const createGoal  = (payload) => api.post("/goals.php", payload);
export const updateGoal  = (payload) => api.patch("/goals.php", payload);     // expects { id, ...fields }
export const deleteGoal  = (id) => api.delete(`/goals.php?id=${id}`);
