

//definition of interface
export interface ChatRoomMessage {
    chatId?: string,
    message: string,
    createdOn: Date,
    receiverId: string,
    receiverName: string,
    senderId: string,
    senderName: string,
    chatRoom:string,
    chatRoomTitle:string
}