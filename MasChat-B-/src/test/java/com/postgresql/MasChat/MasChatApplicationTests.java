package com.postgresql.MasChat;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class MasChatApplicationTests {

	@Test
	void applicationExists() {
		// Simple test to verify the application class exists and can be instantiated
		assertDoesNotThrow(() -> {
			MasChatApplication application = new MasChatApplication();
			assertNotNull(application);
		});
	}

}
