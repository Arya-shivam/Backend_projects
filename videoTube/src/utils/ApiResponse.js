class ApiResponse{
    constructor(statusCode, Data, Message ="Success"){
        this.statusCode=statusCode,
        this.Data=Data,
        this.Message=Message
        this.success = statusCode<400
    }
}

export {ApiResponse}