package com.postgresql.MasChat.dto;

public class ProfileUpdateRequest {
    private String bio;
    private String fullName;
    private UserDetailsDTO details;
    private String profilePicture;
    private String coverPhoto;


    // Getters and Setters
    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public UserDetailsDTO getDetails() {
        return details;
    }

    public void setDetails(UserDetailsDTO details) {
        this.details = details;
    }
    public String getProfilePicture() {
        return profilePicture;
    }
    public void setProfilePicture(String profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getCoverPhoto() {
        return coverPhoto;
    }
    public void setCoverPhoto(String coverPhoto) {
        this.coverPhoto = coverPhoto;
    }
}