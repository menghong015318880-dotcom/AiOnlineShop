// Auth service (MOCK). It saves users in localStorage.
// Later, replace the bodies with the Laravel API (Sanctum):
//   register -> POST /api/register
//   login    -> POST /api/login
//   logout   -> POST /api/logout
//   getCurrentUser -> GET /api/me
// The pages stay the same.
//
// WARNING: this is NOT secure. Passwords are only hashed in the browser for testing.
import type { LoginInput, RegisterInput, User } from "@/types";
import { resolve } from "path";
import { start } from "repl";

const USERS_KEY = "smartshop-users";
const SESSION_KEY = "smartshop-session";  // id of the logged-in user

// A user as saved in the browser (with the password hash)
interface StoredUser extends User {
  password_hash: string;
}

// Fack network delay
const delay = (ms = 500) => new Promise ((resolve) => setTimeout(resolve, ms));

// SHA-256 of "email:password" as a hex text
async function hashPassword(email: string, password: string): Promise<string> {
  const data = new TextEncoder().encode(`${email.toLowerCase()}:${password}`);
  const buffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    throw new Error("Could not save your account in this browser.");
  }
}

// Remove the password hash before giving a user to the pages
function toPublic(user: StoredUser): User {
  return { id: user.id, full_name: user.full_name, email: user.email, phone: user.phone };
}

// Remember who is logged in.
// remember = true -> localStorage (stays after the browser is closed)
// remember = false -> sessionStorage (ends when the tab is closed)
function startSession(userId: number, remember: boolean) {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    (remember ? localStorage: sessionStorage).setItem(SESSION_KEY, String(userId));
  } catch {
    // Blocked storage: the user stays logged out
  }
}

export async function register(input: RegisterInput): Promise<User> {
  await delay();
  const users = readUsers();
  const email = input.email.trim().toLowerCase();
  
  if (users.some((u) => u.email === email)) {
    throw new Error("This email is already registered. Plases login.");
  }

  const user: StoredUser = {
    id: users.length > 0 ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    full_name: input.full_name.trim(),
    email,
    phone: input.phone.trim(),
    password_hash: await hashPassword(email, input.password),
  };

  writeUsers([...users, user]);
  startSession(user.id, true); // a new account is logged in right away
  return toPublic(user);
}

export async function login(input: LoginInput): Promise<User> {
  await delay();
  const email = input.email.trim().toLowerCase();
  const user = readUsers().find((u) => u.email === email);
  const hash = await hashPassword(email, input.password);

  // Same message for a wrong email and a wrong password (do not reveal which one is wrong)
  if (!user || user.password_hash !== hash) {
    throw new Error("Incorrect email or password.");
  }

  startSession(user.id, input.remember);
  return toPublic(user);
}

export function logout() {
  try {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Ignor blocked storage
  }
}

// The logged-in user, or null. Only works is the browser.
export function getCurrentUser(): User | null {
  try {
    const id = Number(localStorage.getItem(SESSION_KEY) ?? sessionStorage.getItem(SESSION_KEY));
    if (!id) return null;
    const user = readUsers().find((u) => u.id === id);
    return user ? toPublic(user) : null;
  } catch {
    return null;
  }
}