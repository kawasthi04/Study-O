package com.kushagra.studyo.service

import com.kushagra.studyo.*
import com.kushagra.studyo.grpc.*
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableSharedFlow
import kotlinx.coroutines.flow.asSharedFlow
import org.springframework.stereotype.Service
import java.util.UUID

@Service
class StudyService(
    private val noteRepository: NoteRepository // <--- Inject DB Access
) : StudyServiceGrpcKt.StudyServiceCoroutineImplBase() {
    private val eventBus = MutableSharedFlow<SessionEvent>(extraBufferCapacity = 100)
    override suspend fun joinSession(request: User): SessionToken {
        println("User Joining: ${request.name}")
        val newUserId = UUID.randomUUID().toString()
        val sessionId = "room-1" 
        val joinEvent = SessionEvent.newBuilder()
            .setUserId(newUserId)
            .setUserName(request.name)
            .setUserJoined("joined the session!")
            .setTimestamp(System.currentTimeMillis())
            .build()
        eventBus.emit(joinEvent)
        return SessionToken.newBuilder()
            .setSessionId(sessionId)
            .setUserId(newUserId)
            .build()
    }
    override fun streamSessionUpdates(request: SessionToken): Flow<SessionEvent> {
        println("Starting stream for user: ${request.userId}")
        return eventBus.asSharedFlow()
    }
    override suspend fun sendAction(request: SessionAction): Empty {
        val eventBuilder = SessionEvent.newBuilder()
            .setUserId(request.userId)
            .setTimestamp(System.currentTimeMillis())
        if (request.hasChatMessage()) {
            println("Chat from ${request.userId}: ${request.chatMessage}")
            eventBuilder.setChatMessage(request.chatMessage)
        } else if (request.hasPageNumber()) {
            println("Page flip: ${request.pageNumber}")
            eventBuilder.setPageNumber(request.pageNumber)
        } else if (request.hasDocumentUrl()) { 
            println("New Doc Shared: ${request.documentUrl}")
            eventBuilder.setDocumentUrl(request.documentUrl)
        }
        eventBus.emit(eventBuilder.build())
        return Empty.getDefaultInstance()
    }
    override suspend fun saveNote(request: NoteRequest): Empty {
        val existingNote = noteRepository.findBySessionIdAndUserId(request.sessionId, request.userId)
        if (existingNote != null) {
            existingNote.content = request.content
            noteRepository.save(existingNote)
        } else {
            val newNote = Note(
                sessionId = request.sessionId,
                userId = request.userId,
                content = request.content
            )
            noteRepository.save(newNote)
        }
        return Empty.getDefaultInstance()
    }

    override suspend fun getMyNotes(request: SessionToken): NoteResponse {
        val note = noteRepository.findBySessionIdAndUserId(request.sessionId, request.userId)
        return NoteResponse.newBuilder()
            .setContent(note?.content ?: "") 
            .build()
    }
}