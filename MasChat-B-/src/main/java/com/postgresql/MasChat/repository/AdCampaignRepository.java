package com.postgresql.MasChat.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.postgresql.MasChat.model.AdCampaign;
import java.util.List;

public interface AdCampaignRepository extends JpaRepository<AdCampaign, Long> {
    
    @Query("SELECT ac FROM AdCampaign ac WHERE ac.user.id = :userId")
    List<AdCampaign> findByUserId(@Param("userId") Long userId);
    
    @Query("SELECT COUNT(ac) FROM AdCampaign ac WHERE ac.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);
    
    @Query("SELECT ac FROM AdCampaign ac WHERE ac.status = :status")
    List<AdCampaign> findByStatus(@Param("status") String status);
} 