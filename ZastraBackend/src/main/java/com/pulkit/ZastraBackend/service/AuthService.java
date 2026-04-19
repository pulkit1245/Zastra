package com.pulkit.ZastraBackend.service;

import com.pulkit.ZastraBackend.dto.request.LoginRequest;
import com.pulkit.ZastraBackend.dto.request.RegisterRequest;
import com.pulkit.ZastraBackend.dto.response.AuthResponse;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.repository.UserRepository;
import com.pulkit.ZastraBackend.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Email already in use");
        }
        
        User user = User.builder()
                .username(request.username())
                .email(request.email())
                .passwordHash(passwordEncoder.encode(request.password()))
                .build();
                
        userRepository.save(user);
        
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getId().toString());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email(), request.password())
        );
        
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        String jwtToken = jwtService.generateToken(user);
        return new AuthResponse(jwtToken, user.getId().toString());
    }
}
