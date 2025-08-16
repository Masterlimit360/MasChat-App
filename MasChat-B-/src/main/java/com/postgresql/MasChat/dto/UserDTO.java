package com.postgresql.MasChat.dto;

public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String fullName;
    private String profilePicture;
    private String coverPhoto;
    private String bio;
    private Boolean verified;
    private UserDetailsDTO details;

    // Getters and setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
    public String getCoverPhoto() { return coverPhoto; }
    public void setCoverPhoto(String coverPhoto) { this.coverPhoto = coverPhoto; }
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }
    public Boolean getVerified() { return verified; }
    public void setVerified(Boolean verified) { this.verified = verified; }
    public UserDetailsDTO getDetails() { return details; }
    public void setDetails(UserDetailsDTO details) { this.details = details; }

    // Mapping from entity
    public static UserDTO fromEntity(com.postgresql.MasChat.model.User user) {
        if (user == null) return null;
        UserDTO dto = new UserDTO();
        dto.setId(user.getId().toString());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setProfilePicture(user.getProfilePicture());
        dto.setCoverPhoto(user.getCoverPhoto());
        dto.setBio(user.getBio());
        dto.setVerified(user.getVerified());
        if (user.getDetails() != null) {
            UserDetailsDTO detailsDTO = new UserDetailsDTO();
            detailsDTO.setProfileType(user.getDetails().getProfileType());
            detailsDTO.setWorksAt1(user.getDetails().getWorksAt1());
            detailsDTO.setWorksAt2(user.getDetails().getWorksAt2());
            detailsDTO.setStudiedAt(user.getDetails().getStudiedAt());
            detailsDTO.setWentTo(user.getDetails().getWentTo());
            detailsDTO.setCurrentCity(user.getDetails().getCurrentCity());
            detailsDTO.setHometown(user.getDetails().getHometown());
            detailsDTO.setRelationshipStatus(user.getDetails().getRelationshipStatus());
            detailsDTO.setShowAvatar(user.getDetails().getShowAvatar());
            detailsDTO.setAvatar(user.getDetails().getAvatar());
            detailsDTO.setFollowerCount(user.getDetails().getFollowerCount());
            detailsDTO.setFollowingCount(user.getDetails().getFollowingCount());
            dto.setDetails(detailsDTO);
        }
        return dto;
    }
} 