package com.kushagra.studyo.service

import com.kushagra.studyo.*
import com.kushagra.studyo.grpc.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import org.springframework.stereotype.Service
import java.util.concurrent.ConcurrentHashMap

@Service
class StudyService(
    private val noteRepository: NoteRepository
) : StudyServiceGrpcKt.StudyServiceCoroutineImplBase() {

    private val sessionBuses = ConcurrentHashMap<String, MutableSharedFlow<SessionEvent>>()
    private fun getBus(sessionId: String): MutableSharedFlow<SessionEvent> {
        return sessionBuses.computeIfAbsent(sessionId) {
            println("Creating new room: $sessionId")
            MutableSharedFlow(replay = 100, extraBufferCapacity = 100)
        }
    }

    override suspend fun joinSession(request: User): SessionToken {
        val safeName = request.name.trim().lowercase().replace("\\s".toRegex(), "-")
        val newUserId = "user-$safeName"
        
        var roomId = request.desiredSessionId
        if (roomId.isEmpty()) {
            roomId = "room-${System.currentTimeMillis() % 10000}" // Simple random room
        }

        val joinEvent = SessionEvent.newBuilder()
            .setUserId(newUserId)
            .setUserName(request.name)
            .setUserJoined("joined the session")
            .setTimestamp(System.currentTimeMillis())
            .build()
        
        getBus(roomId).emit(joinEvent)

        return SessionToken.newBuilder()
            .setSessionId(roomId) // Return the actual room ID
            .setUserId(newUserId)
            .build()
    }

    override fun streamSessionUpdates(request: SessionToken): Flow<SessionEvent> {
        return getBus(request.sessionId).asSharedFlow()
    }

    override suspend fun sendAction(request: SessionAction): Empty {
        val eventBuilder = SessionEvent.newBuilder()
            .setUserId(request.userId)
            .setUserName(request.userId.replace("user-", "")) 
            .setTimestamp(System.currentTimeMillis())

        if (request.hasChatMessage()) eventBuilder.setChatMessage(request.chatMessage)
        else if (request.hasPageNumber()) eventBuilder.setPageNumber(request.pageNumber)
        else if (request.hasDocumentUrl()) eventBuilder.setDocumentUrl(request.documentUrl)

        getBus(request.sessionId).emit(eventBuilder.build())
        
        return Empty.getDefaultInstance()
    }

    override suspend fun saveNote(request: NoteRequest): Empty {
        val existing = noteRepository.findBySessionIdAndUserId(request.sessionId, request.userId)
        if (existing != null) {
            existing.content = request.content
            noteRepository.save(existing)
        } else {
            noteRepository.save(Note(sessionId = request.sessionId, userId = request.userId, content = request.content))
        }
        return Empty.getDefaultInstance()
    }

    override suspend fun getMyNotes(request: SessionToken): NoteResponse {
        val note = noteRepository.findBySessionIdAndUserId(request.sessionId, request.userId)
        return NoteResponse.newBuilder().setContent(note?.content ?: "").build()
    }
}