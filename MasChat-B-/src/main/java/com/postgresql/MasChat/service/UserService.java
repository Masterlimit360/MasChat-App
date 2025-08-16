package com.postgresql.MasChat.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.postgresql.MasChat.dto.ProfileUpdateRequest;
import com.postgresql.MasChat.dto.RegisterRequest;
import com.postgresql.MasChat.exception.ResourceNotFoundException;
import com.postgresql.MasChat.model.User;
import com.postgresql.MasChat.model.UserProfile;
import com.postgresql.MasChat.repository.UserRepository;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private BCryptPasswordEncoder passwordEncoder;

    

    public User findById(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    public User register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists");
        }
        
        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        if (request.getFullName() != null) {
            user.setFullName(request.getFullName());
        }
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
public User updateProfile(Long userId, ProfileUpdateRequest request) {
    System.out.println("Received updateProfile request for userId: " + userId);
    System.out.println("Bio: " + request.getBio());
    System.out.println("FullName: " + request.getFullName());
    System.out.println("ProfilePicture: " + request.getProfilePicture());
    System.out.println("CoverPhoto: " + request.getCoverPhoto());
    if (request.getDetails() != null) {
        var dto = request.getDetails();
        System.out.println("Details:");
        System.out.println("  profileType: " + dto.getProfileType());
        System.out.println("  worksAt1: " + dto.getWorksAt1());
        System.out.println("  worksAt2: " + dto.getWorksAt2());
        System.out.println("  studiedAt: " + dto.getStudiedAt());
        System.out.println("  wentTo: " + dto.getWentTo());
        System.out.println("  currentCity: " + dto.getCurrentCity());
        System.out.println("  hometown: " + dto.getHometown());
        System.out.println("  relationshipStatus: " + dto.getRelationshipStatus());
        System.out.println("  showAvatar: " + dto.getShowAvatar());
        System.out.println("  avatar: " + dto.getAvatar());
        System.out.println("  followerCount: " + dto.getFollowerCount());
        System.out.println("  followingCount: " + dto.getFollowingCount());
    }
    User user = this.findById(userId);
    
    if (request.getBio() != null) user.setBio(request.getBio());
    if (request.getFullName() != null) user.setFullName(request.getFullName());
    if (request.getProfilePicture() != null) user.setProfilePicture(request.getProfilePicture());
    if (request.getCoverPhoto() != null) user.setCoverPhoto(request.getCoverPhoto());

    // Update details
    if (request.getDetails() != null) {
        UserProfile details = user.getDetails();
        if (details == null) {
            details = new UserProfile();
            details.setUser(user);
        }

        var dto = request.getDetails();
        if (dto.getProfileType() != null) details.setProfileType(dto.getProfileType());
        if (dto.getWorksAt1() != null) details.setWorksAt1(dto.getWorksAt1());
        if (dto.getWorksAt2() != null) details.setWorksAt2(dto.getWorksAt2());
        if (dto.getStudiedAt() != null) details.setStudiedAt(dto.getStudiedAt());
        if (dto.getWentTo() != null) details.setWentTo(dto.getWentTo());
        if (dto.getCurrentCity() != null) details.setCurrentCity(dto.getCurrentCity());
        if (dto.getHometown() != null) details.setHometown(dto.getHometown());
        if (dto.getRelationshipStatus() != null) details.setRelationshipStatus(dto.getRelationshipStatus());
        if (dto.getShowAvatar() != null) details.setShowAvatar(dto.getShowAvatar());
        if (dto.getAvatar() != null) details.setAvatar(dto.getAvatar());

        user.setDetails(details); // ensures bidirectional consistency
    }

    user.setUpdatedAt(LocalDateTime.now());
    return userRepository.save(user);
}


    @Transactional
    public User updateProfilePicture(Long userId, String imageUrl) {
        User user = this.findById(userId);
        user.setProfilePicture(imageUrl);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public User updateCoverPhoto(Long userId, String imageUrl) {
        User user = this.findById(userId);
        user.setCoverPhoto(imageUrl);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    @Transactional
    public User updateAvatar(Long userId, String imageUrl, boolean showAvatar) {
        User user = this.findById(userId);
        if (user.getDetails() == null) {
            user.setDetails(new UserProfile());
        }
        user.getDetails().setAvatar(imageUrl);
        user.getDetails().setShowAvatar(showAvatar);
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public Optional<User> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    public boolean deleteByUsername(String username) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
            return true;
        }
        return false;
    }

    public boolean deleteById(Long id) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isPresent()) {
            userRepository.delete(userOpt.get());
            return true;
        }
        return false;
    }

    public Optional<User> login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent() && passwordEncoder.matches(password, userOpt.get().getPassword())) {
            return userOpt;
        }
        return Optional.empty();
    }

    public List<User> getFriends(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        return user.getFriends();
    }

    public List<User> searchUsers(String query) {
        String q = query.toLowerCase();
        return userRepository.findAll().stream()
            .filter(u -> (u.getUsername() != null && u.getUsername().toLowerCase().contains(q)) ||
                         (u.getFullName() != null && u.getFullName().toLowerCase().contains(q)))
            .toList();
    }

    public List<User> getBestFriends(Long userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<User> friends = user.getFriends();
        // For now, just return the first two friends (could be sorted by interaction in the future)
        return friends.stream().limit(2).toList();
    }
}