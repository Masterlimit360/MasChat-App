package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.MassCoinWithdrawal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MassCoinWithdrawalRepository extends JpaRepository<MassCoinWithdrawal, Long> {
    List<MassCoinWithdrawal> findByUserIdOrderByCreatedAtDesc(Long userId);
}






