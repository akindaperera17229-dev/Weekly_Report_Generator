package com.akinda.weekly_report_backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class WeeklyReportBackendApplication {

	public static void main(String[] args) {
		loadEnv();
		SpringApplication.run(WeeklyReportBackendApplication.class, args);
	}

	private static void loadEnv() {
		java.io.File envFile = new java.io.File(".env");
		if (!envFile.exists()) {
			envFile = new java.io.File("../.env");
		}
		if (envFile.exists()) {
			try (java.io.BufferedReader reader = new java.io.BufferedReader(new java.io.FileReader(envFile))) {
				String line;
				while ((line = reader.readLine()) != null) {
					line = line.trim();
					if (line.isEmpty() || line.startsWith("#")) {
						continue;
					}
					int idx = line.indexOf('=');
					if (idx > 0) {
						String key = line.substring(0, idx).trim();
						String value = line.substring(idx + 1).trim();
						if (value.startsWith("\"") && value.endsWith("\"")) {
							value = value.substring(1, value.length() - 1);
						} else if (value.startsWith("'") && value.endsWith("'")) {
							value = value.substring(1, value.length() - 1);
						}
						System.setProperty(key, value);
					}
				}
			} catch (java.io.IOException e) {
				System.err.println("Failed to load .env file: " + e.getMessage());
			}
		}
	}

}
