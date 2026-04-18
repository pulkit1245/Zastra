package com.pulkit.ZastraBackend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.function.Function;

/**
 * JwtService – handles creating and reading JWT tokens.
 *
 * What is a JWT?
 * A JSON Web Token is like a concert wristband:
 *  - After you "check in" (login), you get a wristband (token).
 *  - You show the wristband on every request instead of logging in again.
 *  - The wristband has an expiry time.
 */
@Service
public class JwtService {

    // Secret key loaded from application.properties (jwt.secret)
    @Value("${jwt.secret}")
    private String secret;

    // How long the token is valid (ms), loaded from application.properties (jwt.expiration)
    @Value("${jwt.expiration}")
    private long expiration;

    // ─── Public API ──────────────────────────────────────────────────────────

    /** Generate a new JWT for the given user (uses email as subject). */
    public String generateToken(UserDetails userDetails) {
        return Jwts.builder()
                .subject(userDetails.getUsername())      // email is the "username" here
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(signingKey())
                .compact();
    }

    /** Extract the email (subject) from a token. */
    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /** Return true if the token is valid for the given user and not expired. */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String email = extractEmail(token);
        return email.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
        return claimsResolver.apply(claims);
    }

    /** Convert the Base64 secret string into a proper HMAC-SHA key. */
    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }
}
