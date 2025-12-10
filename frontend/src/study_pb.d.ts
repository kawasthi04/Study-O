import * as jspb from 'google-protobuf'



export class User extends jspb.Message {
  getName(): string;
  setName(value: string): User;

  getAvatarUrl(): string;
  setAvatarUrl(value: string): User;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): User.AsObject;
  static toObject(includeInstance: boolean, msg: User): User.AsObject;
  static serializeBinaryToWriter(message: User, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): User;
  static deserializeBinaryFromReader(message: User, reader: jspb.BinaryReader): User;
}

export namespace User {
  export type AsObject = {
    name: string,
    avatarUrl: string,
  }
}

export class SessionToken extends jspb.Message {
  getSessionId(): string;
  setSessionId(value: string): SessionToken;

  getUserId(): string;
  setUserId(value: string): SessionToken;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SessionToken.AsObject;
  static toObject(includeInstance: boolean, msg: SessionToken): SessionToken.AsObject;
  static serializeBinaryToWriter(message: SessionToken, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SessionToken;
  static deserializeBinaryFromReader(message: SessionToken, reader: jspb.BinaryReader): SessionToken;
}

export namespace SessionToken {
  export type AsObject = {
    sessionId: string,
    userId: string,
  }
}

export class SessionAction extends jspb.Message {
  getSessionId(): string;
  setSessionId(value: string): SessionAction;

  getUserId(): string;
  setUserId(value: string): SessionAction;

  getChatMessage(): string;
  setChatMessage(value: string): SessionAction;

  getPageNumber(): number;
  setPageNumber(value: number): SessionAction;

  getDocumentUrl(): string;
  setDocumentUrl(value: string): SessionAction;

  getActionCase(): SessionAction.ActionCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SessionAction.AsObject;
  static toObject(includeInstance: boolean, msg: SessionAction): SessionAction.AsObject;
  static serializeBinaryToWriter(message: SessionAction, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SessionAction;
  static deserializeBinaryFromReader(message: SessionAction, reader: jspb.BinaryReader): SessionAction;
}

export namespace SessionAction {
  export type AsObject = {
    sessionId: string,
    userId: string,
    chatMessage: string,
    pageNumber: number,
    documentUrl: string,
  }

  export enum ActionCase { 
    ACTION_NOT_SET = 0,
    CHAT_MESSAGE = 3,
    PAGE_NUMBER = 4,
    DOCUMENT_URL = 5,
  }
}

export class SessionEvent extends jspb.Message {
  getUserId(): string;
  setUserId(value: string): SessionEvent;

  getUserName(): string;
  setUserName(value: string): SessionEvent;

  getTimestamp(): number;
  setTimestamp(value: number): SessionEvent;

  getChatMessage(): string;
  setChatMessage(value: string): SessionEvent;

  getPageNumber(): number;
  setPageNumber(value: number): SessionEvent;

  getUserJoined(): string;
  setUserJoined(value: string): SessionEvent;

  getDocumentUrl(): string;
  setDocumentUrl(value: string): SessionEvent;

  getEventCase(): SessionEvent.EventCase;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): SessionEvent.AsObject;
  static toObject(includeInstance: boolean, msg: SessionEvent): SessionEvent.AsObject;
  static serializeBinaryToWriter(message: SessionEvent, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): SessionEvent;
  static deserializeBinaryFromReader(message: SessionEvent, reader: jspb.BinaryReader): SessionEvent;
}

export namespace SessionEvent {
  export type AsObject = {
    userId: string,
    userName: string,
    timestamp: number,
    chatMessage: string,
    pageNumber: number,
    userJoined: string,
    documentUrl: string,
  }

  export enum EventCase { 
    EVENT_NOT_SET = 0,
    CHAT_MESSAGE = 4,
    PAGE_NUMBER = 5,
    USER_JOINED = 6,
    DOCUMENT_URL = 7,
  }
}

export class NoteRequest extends jspb.Message {
  getSessionId(): string;
  setSessionId(value: string): NoteRequest;

  getUserId(): string;
  setUserId(value: string): NoteRequest;

  getContent(): string;
  setContent(value: string): NoteRequest;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NoteRequest.AsObject;
  static toObject(includeInstance: boolean, msg: NoteRequest): NoteRequest.AsObject;
  static serializeBinaryToWriter(message: NoteRequest, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NoteRequest;
  static deserializeBinaryFromReader(message: NoteRequest, reader: jspb.BinaryReader): NoteRequest;
}

export namespace NoteRequest {
  export type AsObject = {
    sessionId: string,
    userId: string,
    content: string,
  }
}

export class NoteResponse extends jspb.Message {
  getContent(): string;
  setContent(value: string): NoteResponse;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): NoteResponse.AsObject;
  static toObject(includeInstance: boolean, msg: NoteResponse): NoteResponse.AsObject;
  static serializeBinaryToWriter(message: NoteResponse, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): NoteResponse;
  static deserializeBinaryFromReader(message: NoteResponse, reader: jspb.BinaryReader): NoteResponse;
}

export namespace NoteResponse {
  export type AsObject = {
    content: string,
  }
}

export class Empty extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Empty.AsObject;
  static toObject(includeInstance: boolean, msg: Empty): Empty.AsObject;
  static serializeBinaryToWriter(message: Empty, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): Empty;
  static deserializeBinaryFromReader(message: Empty, reader: jspb.BinaryReader): Empty;
}

export namespace Empty {
  export type AsObject = {
  }
}

