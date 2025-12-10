package com.kushagra.studyo

import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.stereotype.Repository

@Repository
interface NoteRepository : JpaRepository<Note, Long> {
    fun findBySessionIdAndUserId(sessionId: String, userId: String): Note?
}