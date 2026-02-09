export const jwtConstants = {
    accessTokenSecret: process.env.AUTH_JWT_SECRET_KEY,
    accessTokenTtl: Number(process.env.AUTH_JWT_ACCESS_TOKEN_TTL),
    refreshTokenTtl: Number(process.env.AUTH_JWT_REFRESH_TOKEN_TTL)
};