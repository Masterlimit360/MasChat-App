package com.postgresql.MasChat.repository;

import com.postgresql.MasChat.model.Chat;
import com.postgresql.MasChat.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    Optional<Chat> findByUser1AndUser2(User user1, User user2);
    Optional<Chat> findByUser1AndUser2OrUser2AndUser1(User user1, User user2, User user2b, User user1b);
} 