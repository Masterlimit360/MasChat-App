package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.ReelComment;
import com.postgresql.MasChat.model.Reel;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReelCommentRepository extends JpaRepository<ReelComment, Long> {
    List<ReelComment> findByReel(Reel reel);
} 