package com.northmess.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import de.bwaldvogel.mongo.MongoServer;
import de.bwaldvogel.mongo.backend.memory.MemoryBackend;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnExpression;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnExpression("'${MONGODB_URI:}'.trim().isEmpty()")
@Slf4j
public class MongoServerConfig {

    @Bean(destroyMethod = "shutdown")
    public MongoServer mongoServer() {
        MongoServer server = new MongoServer(new MemoryBackend());
        String connectionString = server.bindAndGetConnectionString();
        log.info("Started in-memory MongoDB server at {}", connectionString);
        return server;
    }

    @Bean
    public MongoClient mongoClient(MongoServer mongoServer) {
        return MongoClients.create(mongoServer.getConnectionString());
    }
}