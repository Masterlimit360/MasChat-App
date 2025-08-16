package com.postgresql.MasChat.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class AppConfig {
    
    @Value("${server.port:8080}")
    private int serverPort;
    
    @Value("${app.server.host:localhost}")
    private String serverHost;
    
    public String getServerUrl() {
        return "http://" + serverHost + ":" + serverPort;
    }
    
    public String getUploadUrl(String fileName) {
        return getServerUrl() + "/uploads/" + fileName;
    }
    
    public String getWebSocketUrl() {
        return getServerUrl() + "/ws-chat";
    }
} 