package com.pulkit.ZastraBackend.service;

import com.pulkit.ZastraBackend.dto.request.ProfileUpdateRequest;
import com.pulkit.ZastraBackend.dto.response.ProfileResponse;
import com.pulkit.ZastraBackend.entity.User;
import com.pulkit.ZastraBackend.entity.UserProfile;
import com.pulkit.ZastraBackend.repository.UserProfileRepository;
import com.pulkit.ZastraBackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final UserProfileRepository userProfileRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElse(new UserProfile()); // default empty profile if not found
        return new ProfileResponse(profile.getDisplayName(), profile.getBio(), profile.getTargetRoles());
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserProfile profile = userProfileRepository.findByUser(user)
                .orElse(UserProfile.builder().user(user).build());

        profile.setDisplayName(request.displayName());
        profile.setBio(request.bio());
        if (request.targetRoles() != null) {
            profile.setTargetRoles(request.targetRoles());
        }

        userProfileRepository.save(profile);

        return new ProfileResponse(profile.getDisplayName(), profile.getBio(), profile.getTargetRoles());
    }
}
