

//definition of interface

export interface ChatMessage{
    chatId?:String,
    message:String,
    createdOn:Date,
    receiverId:String,
    receiverName:String,
    senderId:String,
    senderName:String
}