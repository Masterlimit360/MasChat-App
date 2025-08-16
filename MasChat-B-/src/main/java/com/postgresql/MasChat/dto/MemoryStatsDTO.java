package com.postgresql.MasChat.dto;

public class MemoryStatsDTO {
    private Long totalMemories;
    private Long thisYear;
    private Long thisMonth;
    private Long thisWeek;
    private Long totalLikes;
    private Long totalViews;
    private Long totalComments;
    private Long totalShares;

    // Getters and setters
    public Long getTotalMemories() {
        return totalMemories;
    }

    public void setTotalMemories(Long totalMemories) {
        this.totalMemories = totalMemories;
    }

    public Long getThisYear() {
        return thisYear;
    }

    public void setThisYear(Long thisYear) {
        this.thisYear = thisYear;
    }

    public Long getThisMonth() {
        return thisMonth;
    }

    public void setThisMonth(Long thisMonth) {
        this.thisMonth = thisMonth;
    }

    public Long getThisWeek() {
        return thisWeek;
    }

    public void setThisWeek(Long thisWeek) {
        this.thisWeek = thisWeek;
    }

    public Long getTotalLikes() {
        return totalLikes;
    }

    public void setTotalLikes(Long totalLikes) {
        this.totalLikes = totalLikes;
    }

    public Long getTotalViews() {
        return totalViews;
    }

    public void setTotalViews(Long totalViews) {
        this.totalViews = totalViews;
    }

    public Long getTotalComments() {
        return totalComments;
    }

    public void setTotalComments(Long totalComments) {
        this.totalComments = totalComments;
    }

    public Long getTotalShares() {
        return totalShares;
    }

    public void setTotalShares(Long totalShares) {
        this.totalShares = totalShares;
    }
} 