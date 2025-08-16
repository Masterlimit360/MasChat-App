package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    
    @Query("SELECT g FROM Group g JOIN g.groupMembers gm WHERE gm.user.id = :userId")
    List<Group> findByMemberId(@Param("userId") Long userId);
    
    @Query("SELECT g FROM Group g WHERE g.isPrivate = false")
    List<Group> findPublicGroups();
    
    @Query("SELECT g FROM Group g WHERE g.name LIKE %:searchTerm% OR g.description LIKE %:searchTerm%")
    List<Group> searchGroups(@Param("searchTerm") String searchTerm);
    
    @Query("SELECT COUNT(g) FROM Group g JOIN g.groupMembers gm WHERE gm.user.id = :userId")
    Long countByMemberId(@Param("userId") Long userId);
    
    @Query("SELECT g FROM Group g WHERE g.createdBy.id = :userId")
    List<Group> findByCreatedBy(@Param("userId") Long userId);
} 