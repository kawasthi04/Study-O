package com.kushagra.studyo

import jakarta.persistence.*

@Entity
@Table(name = "notes")
class Note(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long? = null,

    val sessionId: String,
    val userId: String,

    @Column(columnDefinition = "TEXT")
    var content: String
) {
    // Empty constructor for JPA
    constructor() : this(null, "", "", "")
}