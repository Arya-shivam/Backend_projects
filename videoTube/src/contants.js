export const DB_NAME = "vidtube"
export const DB_URL = `mongodb://localhost:27017/${DB_NAME}`
export const PORT = 5000
export const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000 // 1 day
}
