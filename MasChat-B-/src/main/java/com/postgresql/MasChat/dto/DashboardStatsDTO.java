package com.postgresql.MasChat.dto;

public class DashboardStatsDTO {
    private long totalPosts;
    private long totalLikes;
    private long totalComments;
    private long totalShares;
    private long followers;
    private long following;
    private long profileViews;
    private double engagementRate;
    private double weeklyGrowth;
    private double monthlyGrowth;

    public long getTotalPosts() { return totalPosts; }
    public void setTotalPosts(long totalPosts) { this.totalPosts = totalPosts; }

    public long getTotalLikes() { return totalLikes; }
    public void setTotalLikes(long totalLikes) { this.totalLikes = totalLikes; }

    public long getTotalComments() { return totalComments; }
    public void setTotalComments(long totalComments) { this.totalComments = totalComments; }

    public long getTotalShares() { return totalShares; }
    public void setTotalShares(long totalShares) { this.totalShares = totalShares; }

    public long getFollowers() { return followers; }
    public void setFollowers(long followers) { this.followers = followers; }

    public long getFollowing() { return following; }
    public void setFollowing(long following) { this.following = following; }

    public long getProfileViews() { return profileViews; }
    public void setProfileViews(long profileViews) { this.profileViews = profileViews; }

    public double getEngagementRate() { return engagementRate; }
    public void setEngagementRate(double engagementRate) { this.engagementRate = engagementRate; }

    public double getWeeklyGrowth() { return weeklyGrowth; }
    public void setWeeklyGrowth(double weeklyGrowth) { this.weeklyGrowth = weeklyGrowth; }

    public double getMonthlyGrowth() { return monthlyGrowth; }
    public void setMonthlyGrowth(double monthlyGrowth) { this.monthlyGrowth = monthlyGrowth; }
}