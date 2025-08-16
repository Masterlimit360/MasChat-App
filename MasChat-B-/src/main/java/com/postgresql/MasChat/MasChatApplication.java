package com.postgresql.MasChat;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@EnableJpaRepositories(basePackages = "com.postgresql.MasChat.repository")
public class MasChatApplication {
    public static void main(String[] args) {
        SpringApplication.run(MasChatApplication.class, args);
    }
}
