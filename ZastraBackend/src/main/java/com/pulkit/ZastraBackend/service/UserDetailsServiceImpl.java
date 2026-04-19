package com.pulkit.ZastraBackend.service;

import com.pulkit.ZastraBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * UserDetailsServiceImpl – tells Spring Security how to load a user from DB.
 *
 * Spring Security calls this during:
 *  1. Login – to find the user and check the password.
 *  2. Every JWT-authenticated request – to reload the user from DB.
 *
 * Our "username" for auth purposes is the user's email address.
 */
@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Load user by email. Throws an exception if not found.
     * Spring Security catches this exception and returns 401 Unauthorized.
     */
    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(
                        "No user found with email: " + email));
    }
}
