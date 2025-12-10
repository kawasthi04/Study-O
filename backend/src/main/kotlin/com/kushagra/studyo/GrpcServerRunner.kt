package com.kushagra.studyo

import com.kushagra.studyo.service.StudyService
import io.grpc.ServerBuilder
import org.springframework.boot.CommandLineRunner
import org.springframework.stereotype.Component
import javax.annotation.PreDestroy

@Component
class GrpcServerRunner(
    private val studyService: StudyService
) : CommandLineRunner {

    private val server = ServerBuilder.forPort(9090)
        .addService(studyService)
        .build()

    override fun run(vararg args: String?) {
        println("Starting gRPC Server on port 9090.")
        server.start()
        println("gRPC Server listening, ready for connections.")
    }

    @PreDestroy
    fun stop() {
        println("Stopping gRPC Server.")
        server.shutdown()
    }
}