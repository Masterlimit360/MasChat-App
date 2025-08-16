package com.postgresql.MasChat;

import org.springframework.boot.autoconfigure.EnableAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.autoconfigure.websocket.servlet.WebSocketServletAutoConfiguration;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.FilterType;

@Configuration
@ComponentScan(basePackages = "com.postgresql.MasChat",
               excludeFilters = {
                   @ComponentScan.Filter(
                       type = FilterType.REGEX,
                       pattern = "com\\.postgresql\\.MasChat\\.security\\..*"
                   ),
                   @ComponentScan.Filter(
                       type = FilterType.REGEX,
                       pattern = "com\\.postgresql\\.MasChat\\.controller\\..*"
                   )
               })
@EnableAutoConfiguration(exclude = {
    SecurityAutoConfiguration.class,
    UserDetailsServiceAutoConfiguration.class,
    WebSocketServletAutoConfiguration.class
})
public class TestConfig {
    // Test-specific configuration that excludes security and controller components
} 