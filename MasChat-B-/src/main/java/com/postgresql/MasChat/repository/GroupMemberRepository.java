package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.GroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, Long> {
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId")
    List<GroupMember> findByGroupId(@Param("groupId") Long groupId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.user.id = :userId")
    List<GroupMember> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.user.id = :userId")
    Optional<GroupMember> findByGroupIdAndUserId(@Param("groupId") Long groupId, @Param("userId") Long userId);
    
    @Query("SELECT COUNT(gm) FROM GroupMember gm WHERE gm.group.id = :groupId")
    Long countByGroupId(@Param("groupId") Long groupId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.role = 'admin'")
    List<GroupMember> findAdminsByGroupId(@Param("groupId") Long groupId);
    
    @Query("SELECT gm FROM GroupMember gm WHERE gm.group.id = :groupId AND gm.role = 'moderator'")
    List<GroupMember> findModeratorsByGroupId(@Param("groupId") Long groupId);
} 